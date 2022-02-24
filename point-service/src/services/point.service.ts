import { DATABASE_ERROR, FAILURE_DECREASE_POINT, FAILURE_GET_HISTORY, FAILURE_GET_POINTS, FAILURE_INCREASE_POINT, FAILURE_SAVE_HISTORY, INTERNAL_SERVER_ERROR, STEP_BACKWARD, STEP_FORWARD, SUCCESS_DECREASE_POINT, SUCCESS_INCREASE_POINT } from "../constants/result.code";
import { STATUS } from "../constants/status.enum";
import { Choreographer } from "../event";
import { DecreasePointDto } from "../interface/decrease.point.interface.dto";
import { EventMessage } from "../interface/event.message.interface";
import { GetHistoryDto } from "../interface/get.history.dto";
import { GetPointsDto } from "../interface/get.point.dto";
import { IncreasePointDto } from "../interface/increase.point.interface.dto";
import { ResponseDto } from "../interface/response.dto";
import { logger } from "../logs/logging";
import { PointRepository } from "../repository/point.repository";

class PointService {
    private repository: PointRepository;

    constructor() {
        this.repository = new PointRepository();
    }

    public async getPoints(getPointsDto: GetPointsDto): Promise<ResponseDto> {
        try {
            const { userId } = getPointsDto;
            const PARAMS: string[] = [userId];
            const response: ResponseDto = await this.repository.getPoints(PARAMS);

            if(response.code === FAILURE_GET_POINTS || response.code === DATABASE_ERROR) {
                return {
                    code: response.code,
                    message: response.message,
                    payload: response.payload
                };
            }

            return {
                code: response.code,
                message: response.message,
                payload: response.payload + " 포인트"
            };
        } catch(e) {
            logger.error(JSON.stringify(e));

            return {
                code: INTERNAL_SERVER_ERROR,
                message: JSON.stringify(e),
                payload: null
            };
        }
    }

    public async getHistory(getHistoryDto: GetHistoryDto): Promise<ResponseDto> {
        try {
            const { userId } = getHistoryDto;
            const PARAMS: string[] = [userId];
            const response: ResponseDto = await this.repository.getHistory(PARAMS);

            if(response.code === FAILURE_GET_HISTORY || response.code === DATABASE_ERROR) {
                return {
                    code: response.code,
                    message: response.message,
                    payload: response.payload
                };
            }

            return {
                code: response.code,
                message: response.message,
                payload: response.payload
            };
        } catch(e) {
            logger.error(JSON.stringify(e));

            return {
                code: INTERNAL_SERVER_ERROR,
                message: JSON.stringify(e),
                payload: null
            };
        }
    }

    // ../index.ts 파일에서 REQUEST-INCREASE-POINT 메시지 구독
    // 메시지가 들어오면 해당 메서드 수행
    public async increasePoint(increasePointDto: IncreasePointDto): Promise<void> {
        const {
            basicPoint,
            bonusPoint,
            reviewId,
            userId
        } = increasePointDto;

        try {
            // 데이터 롤백, 커밋을 위한 포인트 저장 내역 아이디 값
            const idsForApproving = {
                historyIds: []
            };
            const point: number = basicPoint + bonusPoint;
            const PARAMS: any[] = [point,
                                   userId];
            const response: ResponseDto = await this.repository.increasePoint(PARAMS);

            logger.info("increasePointResponse " + JSON.stringify(response));
            // 포인트 증가 에러
            if(response.code === FAILURE_INCREASE_POINT || response.code === DATABASE_ERROR) {
                logger.info("increasePointError " + JSON.stringify(response));
                // 롤백 - 포인트 감소
                const decreasePointDto: DecreasePointDto = {
                    userId,
                    reviewId,
                    basicPoint : -basicPoint,
                    bonusPoint : -bonusPoint
                };

                // 보상 트랜잭션
                await this.compensateForIncreasePoint(decreasePointDto);
            }

            // 기본 포인트 증가 내역
            if(basicPoint > 0) {
                const PARAMS = [userId,
                                "BASIC",
                                STATUS.PENDING,
                                reviewId,
                                `기본 포인트 ${basicPoint} 증가!`,
                                0];

                const saveHistoryResponse: ResponseDto = await this.repository.saveHistory(PARAMS);

                logger.info("saveHistoryResponse " + JSON.stringify(saveHistoryResponse));
                // 포인트 내역 저장 중 오류 발생
                if(saveHistoryResponse.code === FAILURE_SAVE_HISTORY) {
                    logger.info("basicPoint - saveHistoryResponseError " + JSON.stringify(saveHistoryResponse));
                    // 롤백 - 포인트 감소
                    const decreasePointDto: DecreasePointDto = {
                        userId,
                        reviewId,
                        basicPoint : -basicPoint,
                        bonusPoint : -bonusPoint
                    };

                    // 보상 트랜잭션
                    await this.compensateForIncreasePoint(decreasePointDto);
                }

                // 포인트 내역 아이디 값 저장
                idsForApproving.historyIds.push(saveHistoryResponse.payload);
            }
            
            // 보너스 포인트 내역 저장
            if(bonusPoint > 0) {
                const PARAMS = [userId,
                                "BONUS",
                                STATUS.PENDING,
                                reviewId,
                                `보너스 포인트 ${bonusPoint} 증가!`,
                                0];

                const saveHistoryResponse: ResponseDto = await this.repository.saveHistory(PARAMS);

                logger.info("bonusPoint - saveHistoryResponse " + JSON.stringify(saveHistoryResponse));
                // 포인트 내역 저장 중 에러
                if(saveHistoryResponse.code === FAILURE_SAVE_HISTORY) {
                    logger.info("bonusPoint - saveHistoryResponseError " + JSON.stringify(saveHistoryResponse));
                    // 롤백 - 포인트 감소
                    const decreasePointDto: DecreasePointDto = {
                        userId,
                        reviewId,
                        basicPoint : -basicPoint,
                        bonusPoint : -bonusPoint
                    };

                    // 보상 트랜잭션
                    await this.compensateForIncreasePoint(decreasePointDto);
                    
                }

                idsForApproving.historyIds.push(saveHistoryResponse.payload);
            }

            // 모든 트랜잭션 정상 수행
            const eventMessage: EventMessage = {
                step: STEP_FORWARD,
                payload: { 
                    message: `기본 포인트: ${basicPoint},  보너스 포인트: ${bonusPoint}`
                }
            };
            
            // 포인트 내역 커밋
            idsForApproving.historyIds.map(async (historyId) => await this.repository.approveStatusForSaveHistory(historyId));

            logger.info("STEP_FORWARD");
            // 메시지 발행
            Choreographer.responseReviewEvent.publishToQueue(eventMessage);
        } catch(e) {
            const decreasePointDto: DecreasePointDto = {
                userId,
                reviewId,
                basicPoint,
                bonusPoint
            };

            await this.compensateForIncreasePoint(decreasePointDto);

            logger.error("Service - increasePoint:" + JSON.stringify(e));
        }
    }

    public async decreasePoint(decreasePointDto: DecreasePointDto): Promise<void> {
        const {
            basicPoint,
            bonusPoint,
            reviewId,
            userId
        } = decreasePointDto;

        try {
            // 롤백, 커밋을 위한 데이터
            const idsForApproving = {
                historyIds: []
            };
            const point: number = basicPoint + bonusPoint;
            var PARAMS: any[] = [point,
                                 userId];
            // 포인트 감소
            const response: ResponseDto = await this.repository.decreasePoint(PARAMS);

            // 포인트 감소 에러
            if(response.code === FAILURE_DECREASE_POINT || response.code === DATABASE_ERROR) {
                // 보상 트랜잭션
                const increasePointDto: IncreasePointDto = {
                    userId,
                    reviewId,
                    basicPoint: -basicPoint,
                    bonusPoint: -bonusPoint
                };
    
                await this.compensateForDecreasePoint(increasePointDto);
            }

            // 기본 포인트 감소
            if(basicPoint < 0) {
                const PARAMS = [userId,
                               "BASIC",
                                STATUS.PENDING,
                                reviewId,
                                `기본 포인트 ${basicPoint} 회수!`,
                                0];

                // PENDING 상태로 포인트 감소 내역 저장
                const saveHistoryResponse: ResponseDto = await this.repository.saveHistory(PARAMS);

                if(saveHistoryResponse.code === FAILURE_SAVE_HISTORY) {
                    // 롤백 - 포인트 감소
                    const increasePointDto: IncreasePointDto = {
                        userId,
                        reviewId,
                        basicPoint : basicPoint,
                        bonusPoint : bonusPoint
                    };

                    // 보상 트랜잭션
                    await this.compensateForDecreasePoint(increasePointDto);
                }

                // 포인트 감소 내역 아이디 값 저장
                idsForApproving.historyIds.push(saveHistoryResponse.payload);
            } 
            // 보너스 포인트 감소
            if(bonusPoint < 0) {
                const PARAMS = [userId,
                                "BONUS",
                                STATUS.PENDING,
                                reviewId,
                                `보너스 포인트 ${bonusPoint} 회수!`,
                                0];

                // PENDING 상태로 저장
                const saveHistoryResponse: ResponseDto = await this.repository.saveHistory(PARAMS);

                if(saveHistoryResponse.code === FAILURE_SAVE_HISTORY) {
                    // 롤백 - 포인트 감소
                    const increasePointDto: IncreasePointDto = {
                        userId,
                        reviewId,
                        basicPoint : basicPoint,
                        bonusPoint : bonusPoint
                    };

                    // 보상 트랜잭션
                    await this.compensateForDecreasePoint(increasePointDto);
                }

                // 포인트 감소 내역 아이디 값 저장
                idsForApproving.historyIds.push(saveHistoryResponse.payload);
            }

            const eventMessage: EventMessage = {
                step: STEP_FORWARD,
                payload: {
                    message: `기본 포인트: ${basicPoint},  보너스 포인트: ${bonusPoint}`
                }
            };
            
            // 트랜잭션 정상 수행 후 PENDING에서 APPROVED로 커밋
            idsForApproving.historyIds.map(async (historyId) => await this.repository.approveStatusForSaveHistory(historyId));

            // 메시지 발행
            Choreographer.responseReviewEvent.publishToQueue(eventMessage);
        } catch(e) {
            const increasePointDto: IncreasePointDto = {
                userId,
                reviewId,
                basicPoint,
                bonusPoint
            };

            await this.compensateForDecreasePoint(increasePointDto);
        }
    }

    public async compensateForIncreasePoint(decreasePointDto: DecreasePointDto): Promise<void> {
        const {
            basicPoint,
            bonusPoint,
            reviewId,
            userId
        } = decreasePointDto;
        
        try {
            const point: number = basicPoint + bonusPoint;
            const PARAMS: any[] = [point,
                                   userId];

            await this.repository.decreasePoint(PARAMS);

            const eventMessage: EventMessage = {
                step: STEP_BACKWARD,
                payload: {
                    reviewId,
                }
            };

            Choreographer.responseReviewEvent.publishToQueue(eventMessage);
        } catch(e) {
            logger.error("compensateForIncreasePoint:" + JSON.stringify(e));
        } 
    }

    public async compensateForDecreasePoint(decreasePointDto: IncreasePointDto): Promise<void> {
        const {
            basicPoint,
            bonusPoint,
            reviewId,
            userId
        } = decreasePointDto;
        
        try {
            const point: number = basicPoint + bonusPoint;
            const PARAMS: any[] = [point,
                                   userId];
            await this.repository.increasePoint(PARAMS);

            const eventMessage: EventMessage = {
                step: STEP_BACKWARD,
                payload: {
                    reviewId
                }
            };

            Choreographer.responseReviewEvent.publishToQueue(eventMessage);
        } catch(e) {
            logger.error("compensateForIncreasePoint:" + JSON.stringify(e));
        } 
    }
}

export { PointService };