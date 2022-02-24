import { BAD_GATEWAY, DATABASE_ERROR, FAILURE_DELETE_REVIEW, FAILURE_GET_REVIEW_BY_INDEX, FAILURE_MODIFY_REVIEW, FAILURE_SAVE_REVIEW, IS_EXIST_REVIEW, IS_FIRST_REVIEW, STEP_FORWARD, SUCCESS_DELETE_REVIEW, SUCCESS_MODIFY_REVIEW, SUCCESS_SAVE_REVIEW } from "../constants/result.code";
import { EventMessage } from "../interface/event.message.interface";
import { ResponseDto } from "../interface/response.dto";
import { SaveReviewDto } from "../interface/save.review.dto";
import { ReviewRepository } from "../repository/review.repository";
import { v4 as UUID } from 'uuid';
import { logger } from "../logs/logging";
import { Choreographer } from "../event";
import { ModifyReviewDto } from "../interface/modify.review.dto";
import { IPhoto } from "../interface/photo.interface";
import { DeleteReviewDto } from "../interface/delete.review.dto";
import { STATUS } from "../constants/status.enum";

class ReviewService {
    private repository: ReviewRepository;

    constructor() {
        this.repository = new ReviewRepository();
    }

    public async getReviews(placeId: string): Promise<ResponseDto> {
        try {
            const getReviewsResponse: ResponseDto = await this.repository.getReviews([placeId]);

            return {
                ...getReviewsResponse
            };
        } catch(e) {
            return {
                code: BAD_GATEWAY,
                message: JSON.stringify(e),
                payload: null
            };
        }
    }

    public async saveReview(saveReviewdto: SaveReviewDto): Promise<ResponseDto> {
        const {
            type,
            content,
            attachedPhotos,
            userId,
            placeId
        } = saveReviewdto;

        if([type, userId, placeId].includes(null)) {
            return {
                code: FAILURE_SAVE_REVIEW,
                message: "공백 값이 존재합니다!",
                payload: null
            };
        }

        if(content.length < 1 || attachedPhotos.length < 1) {
            return {
                code: FAILURE_SAVE_REVIEW,
                message: "글, 사진 중 하나 이상의 리뷰를 작성해주세요!",
                payload: null
            };
        }

        try {
            // 롤백, 커밋을 위한 데이터
            const idsForApproving = {
                reviewId: null
            };
            // 해당 사용자의 리뷰가 특정 장소에 있는지
            const isExist: ResponseDto = await this.repository.isExistReview([userId, STATUS.APPROVED]);
            logger.info("isExist " + JSON.stringify(isExist));
            if(isExist.code === IS_EXIST_REVIEW) {
                return {
                    code:isExist.code,
                    message: isExist.message,
                    payload: isExist.payload
                };
            }

            var PARAMS: any[] = [type,
                                 UUID(),
                                 content,
                                 STATUS.PENDING,
                                 userId,
                                 placeId,
                                 0];
            // 리뷰 저장후 insertId 값 반환
            const saveResponse: ResponseDto = await this.repository.saveReview(PARAMS);
            // insertId값을 이용하여 리뷰 데이터 반환
            const getReviewResponse: ResponseDto = await this.repository.getReview(saveResponse.payload);
            const reviewId: string = getReviewResponse.payload;
            logger.info("getReviewResponse " + JSON.stringify(getReviewResponse));
            // 리뷰 아이디 조회 에러
            if(getReviewResponse.code === FAILURE_GET_REVIEW_BY_INDEX) {
                logger.info("getReviewResponseError " + JSON.stringify(getReviewResponse));
                // 롤백 - 리뷰 데이터 삭제
                const PARAMS: string[] = [reviewId];

                await this.repository.compensateForSaveReview(PARAMS);
                
                return {
                    code: getReviewResponse.code,
                    message: getReviewResponse.message,
                    payload: null
                };
            }
                
            // 추후 롤백을 위한 reviewId 저장
            idsForApproving.reviewId = reviewId;

            // reviews 테이블과 외래키로 연결되어있고, 롤백 시 리뷰 데이터를 삭제하면 사진 데이터도 삭제하기 때문에 APPROVED
            attachedPhotos.map(async (image: string) => {
                const PARAMS: any[] = [UUID(),
                                       reviewId,     
                                       STATUS.APPROVED,               
                                       image,
                                       0];
                
                // 첨부 사진 저장
                const savePhotoResponse: ResponseDto = await this.repository.savePhoto(PARAMS);
                logger.info("savePhotoResponse " + JSON.stringify(getReviewResponse));

                // 첨부 사진 저장 중 에러 케이스
                if(savePhotoResponse.code === FAILURE_MODIFY_REVIEW) {
                    logger.info("savePhotoResponseError " + JSON.stringify(getReviewResponse));
                    // 롤백 - 리뷰 데이터 삭제
                    await this.repository.compensateForSaveReview([reviewId]);
                    
                    return {
                        code: savePhotoResponse.code,
                        message: savePhotoResponse.message,
                        payload: null
                    };
                }
            });

            PARAMS = [reviewId];

            // 저장한 reviewId와 특정 장소 첫번째 리뷰 아이디 값을 비교하여 첫 리뷰라면 보너스 포인트 1점
            const bonusPoint: number = (await this.repository.isFirstReview(PARAMS)).code === IS_FIRST_REVIEW ? 1 : 0;
            var basicPoint: number = 0;

            // 글 1자 이상, 사진 1장 이상
            if((content.length >= 1 && attachedPhotos.length >= 1)) basicPoint = 2;
            // 글 1자 이상, 사진 1장 미만
            else if((content.length >= 1 || attachedPhotos.length < 1)) basicPoint = 1;
            // 글 1자 미만, 사진 1장 이상
            else if((content.length < 1 || attachedPhotos.length >= 1)) basicPoint = 1;

            // 포인트 서비스로 메시지 발행을 위한 데이터
            const eventMessage: EventMessage = {
                step: STEP_FORWARD,
                payload: {
                    reviewId,
                    userId,
                    basicPoint,
                    bonusPoint
                }
            };

            logger.info(`toPointService ${basicPoint}, ${bonusPoint}`);

            // 포인트 서비스로 메시지 발행
            Choreographer.increasePointEvent.publishToQueue(eventMessage);
            
            var responseMessage: EventMessage;

            // 포인트 서비스로부터 응답 메시지 대기
            while(!responseMessage) responseMessage = await Choreographer.responseReviewEvent.consumeFromQueue();

            // 포인트 서비스에서 정상적으로 트랜잭션이 완료된 경우
            if(responseMessage.step === STEP_FORWARD) {
                logger.info("FromPointService " + JSON.stringify(responseMessage));
                // 커밋 - 리뷰의 상태 값을 PENDING에서 APPROVED로 전환
                await this.repository.approveStatusForSaveReview(idsForApproving.reviewId);

                return {
                    code: SUCCESS_SAVE_REVIEW,
                    message: "리뷰 작성 성공!, " + responseMessage.payload.message,
                    payload: null
                };
            }

            // 롤백 - 포인트 서비스에서 트랜잭션이 실패할 경우 리뷰 데이터 삭제
            await this.repository.compensateForSaveReview([reviewId]);
            
            logger.info("Transacion Error");

            return {
                code: FAILURE_SAVE_REVIEW,
                message: "리뷰 작성 실패!",
                payload: null
            };
        } catch(e) {
            return {
                code: BAD_GATEWAY,
                message: JSON.stringify(e),
                payload: null
            };
        }
    }

    public async modifyReview(modifyReviewDto: ModifyReviewDto): Promise<ResponseDto> {
        const {
            reviewId,
            userId,
            action,
            content,
            attachedPhotos
        } = modifyReviewDto;

        if([reviewId, userId, action].includes(null)) {
            return {
                code: FAILURE_MODIFY_REVIEW,
                message: "공백 값이 존재합니다!",
                payload: null
            };
        }

        if(content.length < 0 && attachedPhotos.length < 0) {
            return {
                code: FAILURE_MODIFY_REVIEW,
                message: "글과 사진이 전부 공백입니다!",
                payload: null
            };
        }

        try {
            // 롤백, 커밋을 위한 데이터
            const columnsForApproving = {
                content: null,
                allRemovePhoto: null,
                addPhotos: [],
                removePhotos: []
            };
            // 글, 사진 데이터 조회
            const checkReviewResponse: ResponseDto = await this.repository.checkReview([reviewId]);

            logger.info("checkReviewResponse: " + JSON.stringify(checkReviewResponse));
            if(checkReviewResponse.payload.content === content && JSON.stringify(checkReviewResponse.payload.photos.map(photo => photo.image)) === JSON.stringify(attachedPhotos)) {
                return {
                    code: SUCCESS_MODIFY_REVIEW,
                    message: "수정할 사항이 없습니다!",
                    payload: null
                };
            }

            if(checkReviewResponse.code === DATABASE_ERROR) {
                return {
                    code: checkReviewResponse.code,
                    message: checkReviewResponse.message,
                    payload: null
                };
            }

            var basicPoint: number = 0;

            // 기본 포인트 케이스
            // 글만 있고, 수정 글과 수정 사진 첨부
            if(checkReviewResponse.payload.content.length >= 1 && 
               checkReviewResponse.payload.photos.length <= 0 && 
               content.length >= 1 && 
               attachedPhotos.length >= 1) basicPoint = 1;
            // 사진만 있고, 수정 글과 수정 사진 첨부
            if(checkReviewResponse.payload.content.length <= 0 && 
               checkReviewResponse.payload.photos.length >= 1 && 
               content.length >= 1 && 
               attachedPhotos.length >= 1) basicPoint = 1;
            // 글과 사진이 있고, 수정 글 첨부, 수정 사진 미첨부
            if(checkReviewResponse.payload.content.length >= 1 && 
               checkReviewResponse.payload.photos.length >= 1 && 
               content.length >= 1 &&
               attachedPhotos.length <= 0) basicPoint = -1;
            // 글과 사진이 있고, 수정 글 미첨부, 수정 사진 첨부
            if(checkReviewResponse.payload.content.length >= 1 && 
               checkReviewResponse.payload.photos.length >= 1 && 
               content.length <= 0 &&
               attachedPhotos.length >= 1) basicPoint = -1;

            logger.info("basicPoint: " + basicPoint);
            
            var modifyResponse: ResponseDto;
            // 글을 수정해야할 경우
            if(content !== checkReviewResponse.payload.content) {
                const PARAMS: any[] = [STATUS.PENDING,
                                       reviewId];

                // 수정 내용 저장
                columnsForApproving.content = content;

                // PENDING 상태로 변환
                modifyResponse = await this.repository.modifyReviewStatusByReviewId(PARAMS);

                logger.info("글 수정 - modifyResponse: " + JSON.stringify(modifyResponse));

                if(modifyResponse.code === FAILURE_MODIFY_REVIEW) {
                    const PARAMS = [STATUS.APPROVED, 
                        reviewId];

                    await this.repository.modifyReviewStatusByReviewId(PARAMS);

                    return {
                        code: modifyResponse.code,
                        message: modifyResponse.message,
                        payload: null
                    };
                }
            }

            // 사진 전부 삭제
            if((attachedPhotos.length <= 0) && (checkReviewResponse.payload.photos.length >= 1)) {
                const PARAMS: any[] = [STATUS.PENDING, 
                                       reviewId];

                // 사진 삭제를 위한 reviewId값 저장
                columnsForApproving.allRemovePhoto = reviewId;

                // PENDING 상태로 변환
                modifyResponse = await this.repository.modifyAllPhotoStatusByReviewId(PARAMS);

                logger.info("사진 전부 삭제 - modifyResponse: " + JSON.stringify(modifyResponse));

                if(modifyResponse.code === FAILURE_MODIFY_REVIEW) {
                    const PARAMS = [STATUS.APPROVED,
                                    reviewId];

                    await this.repository.modifyAllPhotoStatusByReviewId(PARAMS);

                    return {
                        code: modifyResponse.code,
                        message: modifyResponse.message,
                        payload: null
                    };
                }
            } else {
                // 첨부 사진이 존재하여 첨부 사진과 데이터베이스에 저장된 사진 중 교집합을 필터 사진으로 만듦. 
                const { photos } = checkReviewResponse.payload;
                const photoImages: string[] = photos.map(photo => photo.image);
                const photoFilter: string[] = attachedPhotos.filter(attachedPhoto => photoImages.includes(attachedPhoto));

                const removePhotos: IPhoto[] = photos.filter(photo => !photoFilter.includes(photo.image));
                const addPhotos: string[] = attachedPhotos.filter(attachedPhoto => !photoFilter.includes(attachedPhoto));

                logger.info("photos" + JSON.stringify(photos));
                logger.info("attachedPhotoImages " + JSON.stringify(attachedPhotos))
                logger.info("photoImages " + JSON.stringify(photoImages))
                logger.info("photoFilter" + JSON.stringify(photoFilter));
                logger.info("removePhotos " + JSON.stringify(removePhotos))
                logger.info("addPhotos " + JSON.stringify(addPhotos))

                // 삭제해야 할 사진
                removePhotos.length >= 1 && removePhotos.map(async photo => {
                    const PARAMS: any[] = [STATUS.PENDING, 
                                           photo.photoId];

                    // 삭제 사진 아이디 값 저장
                    columnsForApproving.removePhotos.push(photo.photoId);

                    // PENDING 상태로 변환
                    modifyResponse = await this.repository.modifyPhotoStatusById(PARAMS);

                    logger.info("삭제해야 할 사진 - modifyResponse: " + JSON.stringify(modifyResponse));

                    if(modifyResponse.code === FAILURE_MODIFY_REVIEW) {
                        columnsForApproving.removePhotos.map(async (photoId) => {
                            const PARAMS = [STATUS.APPROVED,
                                            photoId];
    
                            await this.repository.modifyPhotoStatusById(PARAMS);
                        });

                        return {
                            code: modifyResponse.code,
                            message: modifyResponse.message,
                            payload: null
                        };
                    }
                });

                // 추가해야 할 사진
                addPhotos.length >= 1 && addPhotos.map(async photo => {
                    const addPhoto: any[] = [UUID(), 
                                            reviewId,
                                            STATUS.APPROVED,
                                            photo, 
                                            0];

                    // 사진 추가 데이터
                    columnsForApproving.addPhotos.push(addPhoto);
                });
            }
            
            const eventMessage: EventMessage = {
                step: STEP_FORWARD,
                payload: {
                    reviewId,
                    userId,
                    basicPoint,
                    bonusPoint: 0
                }
            };

            // 포인트 증가가 필요한 경우 포인트 서비스로 메시지 발행
            if(basicPoint > 0) Choreographer.increasePointEvent.publishToQueue(eventMessage);
            // 포인트 감소가 필요한 경우 포인트 서비스로 메시지 발행
            else if(basicPoint < 0) Choreographer.decreasePointEvent.publishToQueue(eventMessage);
            // 포인트 증감이 없을 경우 결과값 반환 및 커밋
            else if(basicPoint === 0) {
                logger.info("포인트 증감 없음, 결과값 및 데아터 커밋: " + JSON.stringify(columnsForApproving));
                if(columnsForApproving.content) {
                    const PARAMS = [columnsForApproving.content, 
                                    STATUS.APPROVED,
                                    reviewId];

                    await this.repository.modifyContentByReviewId(PARAMS);
                }
                
                if(columnsForApproving.allRemovePhoto) {
                    const PARAMS = [reviewId];

                    await this.repository.deleteAllPhotosByReviewId(PARAMS);
                }

                if(columnsForApproving.removePhotos.length > 0) {
                    columnsForApproving.removePhotos.map(async photoId => {
                        const PARAMS = [photoId];

                        await this.repository.deletePhotoByPhotoId(PARAMS);
                    });
                }

                if(columnsForApproving.addPhotos.length > 0) {
                    columnsForApproving.addPhotos.map(async addPhoto => {
                        const PARAMS = [...addPhoto];

                        await this.repository.savePhoto(PARAMS);
                    });
                }

                return {
                    code: SUCCESS_MODIFY_REVIEW,
                    message: "리뷰 수정 성공!",
                    payload: null
                };
            }

            var responseMessage: EventMessage;

            while(!responseMessage) responseMessage = await Choreographer.responseReviewEvent.consumeFromQueue();

            // 포인트 증감 트랜잭션 정상 수행
            if(responseMessage.step === STEP_FORWARD) {
                logger.info("포인트 증감 트랜잭션 정상 수행: " + JSON.stringify(responseMessage));
                // 결과값 반환 및 데이터 커밋
                if(columnsForApproving.content) {
                    const PARAMS = [columnsForApproving.content, 
                                    STATUS.APPROVED,
                                    reviewId];

                    await this.repository.modifyContentByReviewId(PARAMS);
                }
                
                if(columnsForApproving.allRemovePhoto) {
                    const PARAMS = [reviewId];

                    await this.repository.deleteAllPhotosByReviewId(PARAMS);
                }

                if(columnsForApproving.removePhotos.length > 0) {
                    columnsForApproving.removePhotos.map(async photoId => {
                        const PARAMS = [photoId];

                        await this.repository.deletePhotoByPhotoId(PARAMS);
                    });
                }

                if(columnsForApproving.addPhotos.length > 0) {
                    columnsForApproving.addPhotos.map(async addPhoto => {
                        const PARAMS = [...addPhoto];

                        await this.repository.savePhoto(PARAMS);
                    });
                }

                return {
                    code: SUCCESS_MODIFY_REVIEW,
                    message: "리뷰 수정 성공!" + responseMessage.payload.message,
                    payload: null
                };
            }

            logger.info("포인트 증감 트랜잭션 실패: " + JSON.stringify(responseMessage));
            // 포인트 증감 트랜잭션 실패
            // 저장된 데이터를 이용하여 전부 롤백
            if(columnsForApproving.content) {
                const PARAMS = [STATUS.APPROVED, 
                                reviewId];

                await this.repository.modifyReviewStatusByReviewId(PARAMS);
            }
            
            if(columnsForApproving.allRemovePhoto) {
                const PARAMS = [STATUS.APPROVED,
                                reviewId];

                await this.repository.modifyAllPhotoStatusByReviewId(PARAMS);
            }

            if(columnsForApproving.removePhotos) {
                columnsForApproving.removePhotos.map(async (photoId) => {
                    const PARAMS = [STATUS.APPROVED,
                                    photoId];

                    await this.repository.modifyPhotoStatusById(PARAMS);
                });
            }

            return {
                code: FAILURE_MODIFY_REVIEW,
                message: "리뷰 수정 실패!" + responseMessage.payload.message,
                payload: null
            };
        } catch(e) {
            return {
                code: BAD_GATEWAY,
                message: JSON.stringify(e),
                payload: null
            };
        }
    }

    public async deleteReview(deleteReviewDto: DeleteReviewDto): Promise<ResponseDto> {
        const {
            reviewId,
            action,
            userId
        } = deleteReviewDto;

        if([reviewId, action, userId].includes(null)) {
            return {
                code: FAILURE_DELETE_REVIEW,
                message: "공백 값이 존재합니다!",
                payload: null
            };
        }

        try {
            var bonusPoint: number;
            var PARAMS: any[] = [reviewId];

            // 유저가 보너스 포인트를 받았는지 받지 않았는지 체크
            if(action === "DELETE") (await this.repository.isFirstReview(PARAMS)).code === IS_FIRST_REVIEW ? bonusPoint = -1 : bonusPoint = 0;

            logger.info("bonusPoint: " + bonusPoint);
            // 기본 포인트 차감을 위해 리뷰 데이터 조회
            const checkReviewResponse: ResponseDto = await this.repository.checkReview([reviewId]);

            logger.info("checkReviewResponse: " + JSON.stringify(checkReviewResponse));
            if(checkReviewResponse.code === DATABASE_ERROR) {
                return {
                    code: checkReviewResponse.code,
                    message: checkReviewResponse.message,
                    payload: null
                };
            }

            const {
                content,
                photos
            } = checkReviewResponse.payload;

            var basicPoint: number;

            // 글 1자 이상, 사진 1장 이상
            if(content.length >= 1 && photos.length >= 1) basicPoint = -2;
            // 글 1자 이상, 사진 1장 미만
            else if(content.length >= 1 && photos.length <= 0) basicPoint = -1;
            // 글 1자 미만, 사진 1장 이상
            else if(content.length <= 0 && photos.length >= 1) basicPoint = -1;

            logger.info("basicPoint: " + JSON.stringify(basicPoint));
            
            PARAMS = [STATUS.PENDING, 
                      reviewId];
            // PENDING 상태로 변환
            const modifyReviewResponse: ResponseDto = await this.repository.modifyReviewStatusByReviewId(PARAMS);

            if(modifyReviewResponse.code === FAILURE_MODIFY_REVIEW) {
                logger.info("롤백(수정 실패) - modifyReviewResponse: " + JSON.stringify(modifyReviewResponse));
                PARAMS = [STATUS.APPROVED,
                          reviewId];
                // 롤백 - 수정 실패
                await this.repository.modifyReviewStatusByReviewId(PARAMS);

                return {
                    code: modifyReviewResponse.code,
                    message: modifyReviewResponse.message,
                    payload: null
                };
            }

            const eventMessage: EventMessage = {
                step: STEP_FORWARD,
                payload: {
                    reviewId,
                    userId,
                    basicPoint,
                    bonusPoint
                }
            };

            // 포인트 감소를 위한 메시지 발행
            Choreographer.decreasePointEvent.publishToQueue(eventMessage);
            
            var responseMessage: EventMessage;

            while(!responseMessage) responseMessage = await Choreographer.responseReviewEvent.consumeFromQueue();

            // 포인트 감소 트랜잭션 정상 수행
            if(responseMessage.step === STEP_FORWARD) {
                logger.info("포인트 감소 트랜잭션 정상 수행 - responseMessage: " + JSON.stringify(responseMessage));
                // 데이터 커밋
                PARAMS = [reviewId];

                const deleteReviewResponse: ResponseDto = await this.repository.deleteReview(PARAMS);

                logger.info("포인트 감소 트랜잭션 정상 수행 - deleteReviewResponse: " + JSON.stringify(deleteReviewResponse));

                if(deleteReviewResponse.code === SUCCESS_DELETE_REVIEW) { 
                    return {
                        code: SUCCESS_DELETE_REVIEW,
                        message: "리뷰 삭제 성공!" + responseMessage.payload.message,
                        payload: null
                    };
                }

                PARAMS = [STATUS.APPROVED,
                          reviewId];
                // 롤백 - 삭제 실패
                await this.repository.modifyReviewStatusByReviewId(PARAMS);
            }

            logger.info("포인트 감소 트랜잭션 실패 - responseMessage: " + JSON.stringify(responseMessage));

            // 포인트 감소 트랜잭션 실패
            PARAMS = [STATUS.APPROVED,
                      reviewId];
            // 롤백 - 리뷰 데이터 APPROVED
            await this.repository.modifyReviewStatusByReviewId(PARAMS);

            return {
                code: FAILURE_DELETE_REVIEW,
                message: "리뷰 삭제 실패!",
                payload: responseMessage.payload.message 
            };
        } catch(e) {
            return {
                code: BAD_GATEWAY,
                message: JSON.stringify(e),
                payload: null
            };
        }
    }
}

export { ReviewService };