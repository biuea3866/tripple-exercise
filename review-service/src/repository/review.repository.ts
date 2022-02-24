import { PoolConnection } from "mysql2/promise";
import { CHECK_REVIEW, DATABASE_ERROR, FAILURE_DELETE_REVIEW, FAILURE_GET_REVIEW_BY_INDEX, FAILURE_MODIFY_REVIEW, FAILURE_SAVE_REVIEW, IS_EXIST_REVIEW, IS_FIRST_REVIEW, IS_NOT_EXIST_REVIEW, IS_NOT_FIRST_REVIEW, SUCCESS_DELETE_REVIEW, SUCCESS_GET_REVIEWS, SUCCESS_GET_REVIEW_BY_INDEX, SUCCESS_MODIFY_REVIEW, SUCCESS_SAVE_REVIEW } from "../constants/result.code";
import { STATUS } from "../constants/status.enum";
import { ResponseDto } from "../interface/response.dto";
import { logger } from "../logs/logging";
import { mysql } from "../models/mysql.connection";

class ReviewRepository {
    constructor() {}

    public async getReviews(PARAMS: string[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "SELECT r.content, " +
                                "       r.user_id AS userId, "  +
                                "       r.review_id AS reviewId, " +
                                "       p.image " +
                                "from reviews r, photos p " +
                                "WHERE r.place_id = ?";
            
            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(SQL, PARAMS);

            await connection.commit();

            const payload: [] = results.reduce((accumulator, current) => {
                if(accumulator.length === 0) {
                    accumulator.push({
                        'userId': results[0].userId,
                        'reviewId': results[0].reviewId,
                        'content': results[0].content,
                        'photos': [results[0].image]
                    });
                    
                    return accumulator;
                }

                if (current.reviewId === accumulator[accumulator.length - 1].reviewId) accumulator[accumulator.length - 1].photos.push(current.image);
                else {
                    accumulator.push({
                        'userId': current.userId,
                        'reviewId': current.reviewId,
                        'content': current.content,
                        'photos': [current.image]
                    });
                }
                
                return accumulator;
            }, []);

            return {
                code: SUCCESS_GET_REVIEWS,
                message: "리뷰 데이터 조회 성공!",
                payload
            };
        } catch(e) {
            return {
                code: DATABASE_ERROR,
                message: JSON.stringify(e),
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async saveReview(PARAMS: string[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "INSERT INTO " +
                                "reviews(type, review_id, content, status, user_id, place_id, id) " +
                                "VALUES(?, ?, ?, ?, ?, ?, ?)";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(
                SQL,
                PARAMS,
            );

            if(!results.insertId) {
                await connection.rollback();

                return {
                    code: FAILURE_SAVE_REVIEW,
                    message: "리뷰 작성 실패!",
                    payload: null
                };
            }

            await connection.commit();

            return {
                code: SUCCESS_SAVE_REVIEW,
                message: "리뷰 작성 성공!",
                payload: results.insertId
            };
        } catch(error) {
            await connection.rollback();
    
            return {
                code: DATABASE_ERROR,
                message: error,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async savePhoto(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "INSERT INTO " +
                                "photos(photo_id, review_id, status, image, id) " +
                                "VALUES(?, ?, ?, ?, ?)";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(
                SQL,
                PARAMS
            );

            if(results.insertId) {
                await connection.commit();

                return {
                    code: SUCCESS_MODIFY_REVIEW,
                    message: "사진 저장 성공!",
                    payload: results.insertId
                };
            }

            await connection.rollback();

            return {
                code: FAILURE_MODIFY_REVIEW,
                message: "사진 저장 실패!",
                payload: null
            };
        } catch(error) {
            await connection.rollback();

            return {
                code: DATABASE_ERROR,
                message: error,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async getReview(id: number): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "SELECT review_id AS reviewId " +
                                "FROM reviews " +
                                "WHERE id = ?";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(
                SQL,
                [id]
            );

            if(results.length <= 0) {
                return {
                    code: FAILURE_GET_REVIEW_BY_INDEX,
                    message: "해당 리뷰가 존재하지 않습니다!",
                    payload: null
                };
            }

            await connection.commit();

            return {
                code: SUCCESS_GET_REVIEW_BY_INDEX,
                message: "리뷰 조회 성공!",
                payload: results[0].reviewId
            };
        } catch(error) {
            return {
                code: DATABASE_ERROR,
                message: error,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async isExistReview(PARAMS: string[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "SELECT review_id AS reviewId" +
                                "FROM reviews " +
                                "WHERE user_id = ? AND status = ? ";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(
                SQL,
                [PARAMS]
            );

            if(results[0].reviewId) {
                await connection.commit();

                return {
                    code: IS_EXIST_REVIEW,
                    message: "리뷰가 존재합니다!",
                    payload: null
                };
            }

            await connection.commit();

            return {
                code: IS_NOT_EXIST_REVIEW,
                message: "리뷰가 존재하지 않습니다!",
                payload: null
            };
        } catch(error) {
            await connection.rollback();

            return {
                code: DATABASE_ERROR,
                message: error,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async isFirstReview(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "SELECT review_id AS reviewId " +
                                "FROM reviews " +
                                "LIMIT 1";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(SQL);

            if(PARAMS[0] === results[0].reviewId) {
                await connection.commit();
                
                return {
                    code: IS_FIRST_REVIEW,
                    message: "첫 리뷰입니다!",
                    payload: null
                };
            }
     
            await connection.commit();

            return {
                code: IS_NOT_FIRST_REVIEW,
                message: "첫 리뷰가 아닙니다!",
                payload: null
            }
        } catch(e) {
            await connection.rollback();

            return {
                code: DATABASE_ERROR,
                message: e,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async checkReview(PARAMS: string[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            var SQL: string = "SELECT content " +
                              "FROM reviews " +
                              "WHERE review_id = ?";
            
            await connection.beginTransaction();

            var [results, rows]: any = await connection.query(SQL, PARAMS);

            await connection.commit();

            var payload: {} = {
                content: results[0].content
            };

            SQL = "SELECT photo_id AS photoId, " +
                  "       image, " +
                  "       id " +
                  "FROM photos " +
                  "WHERE review_id = ?";
            
            [results, rows] = await connection.query(SQL, PARAMS);

            await connection.commit();

            payload = {
                ...payload,
                photos: results
            };
            
            return {
                code: CHECK_REVIEW,
                message: "리뷰 데이터를 조회했습니다!",
                payload
            };
        } catch(e) {
            return {
                code: DATABASE_ERROR,
                message: e,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async modifyReviewStatusByReviewId(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "UPDATE reviews " +
                                "SET status =  ? " +
                                "WHERE review_id = ?";
            
            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(SQL, PARAMS);

            if(results.affectedRows as number < 1) {
                await connection.rollback();

                return {
                    code: FAILURE_MODIFY_REVIEW,
                    message: "리뷰 수정 실패!",
                    payload: null
                };
            }

            await connection.commit();
            
            return {
                code: SUCCESS_MODIFY_REVIEW,
                message: "리뷰 수정 성공!",
                payload: null
            };
        } catch(e) {
            await connection.rollback();
            
            logger.error(JSON.stringify(e));
            
            return {
                code: DATABASE_ERROR,
                message: e,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async modifyPhotoStatusById(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "UPDATE photos " +
                                "SET status =  ? " +
                                "WHERE photo_id = ?";
            
            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(SQL, PARAMS);

            if(results.affectedRows as number < 1) {
                await connection.rollback();

                return {
                    code: FAILURE_MODIFY_REVIEW,
                    message: "리뷰 수정 실패!",
                    payload: null
                };
            }

            await connection.commit();
            
            return {
                code: SUCCESS_MODIFY_REVIEW,
                message: "리뷰 수정 성공!",
                payload: null
            };
        } catch(e) {
            await connection.rollback();
            
            logger.error(JSON.stringify(e));
            
            return {
                code: DATABASE_ERROR,
                message: e,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async modifyAllPhotoStatusByReviewId(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "UPDATE photos " +
                                "SET status =  ? " +
                                "WHERE review_id = ?";
            
            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(SQL, PARAMS);

            if(results.affectedRows as number < 1) {
                await connection.rollback();

                return {
                    code: FAILURE_MODIFY_REVIEW,
                    message: "리뷰 수정 실패!",
                    payload: null
                };
            }

            await connection.commit();
            
            return {
                code: SUCCESS_MODIFY_REVIEW,
                message: "리뷰 수정 성공!",
                payload: null
            };
        } catch(e) {
            await connection.rollback();
            
            logger.error(JSON.stringify(e));
            
            return {
                code: DATABASE_ERROR,
                message: e,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async modifyContentByReviewId(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "UPDATE reviews " +
                                "SET content =  ?, " +
                                "    status = ?" +
                                "WHERE review_id = ?";
            
            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(SQL, PARAMS);

            if(results.affectedRows as number < 1) {
                await connection.rollback();

                return {
                    code: FAILURE_MODIFY_REVIEW,
                    message: "리뷰 수정 실패!",
                    payload: null
                };
            }

            await connection.commit();

            return {
                code: SUCCESS_MODIFY_REVIEW,
                message: "리뷰 수정 성공!",
                payload: null
            };
        } catch(e) {
            await connection.rollback();
            
            return {
                code: DATABASE_ERROR,
                message: e,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async deleteAllPhotosByReviewId(PARAMS: string[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "DELETE " +
                                "FROM photos " +
                                "WHERE review_id = ?";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(SQL, PARAMS);

            if(results.affectedRows as number < 1) {
                await connection.rollback();

                return {
                    code: FAILURE_MODIFY_REVIEW,
                    message: "리뷰 수정 실패!",
                    payload: null
                };
            }

            await connection.commit();

            return {
                code: SUCCESS_MODIFY_REVIEW,
                message: "리뷰 수정 성공!",
                payload: null
            };
        } catch(e) {
            await connection.rollback();
            
            return {
                code: DATABASE_ERROR,
                message: e,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async deletePhotoByPhotoId(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "DELETE " +
                                "FROM photos " +
                                "WHERE photo_id = ?";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(SQL, PARAMS);

            if(results.affectedRows as number < 1) {
                await connection.rollback();

                return {
                    code: FAILURE_MODIFY_REVIEW,
                    message: "리뷰 수정 실패!",
                    payload: null
                };
            }

            await connection.commit();

            return {
                code: SUCCESS_MODIFY_REVIEW,
                message: "리뷰 수정 성공!",
                payload: null
            };
        } catch(e) {
            await connection.rollback();
            
            return {
                code: DATABASE_ERROR,
                message: e,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async deleteReview(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            var SQL: string = "DELETE " +
                              "FROM reviews " +
                              "WHERE review_id = ?";

            await connection.beginTransaction();

            var [results, rows]: any = await connection.query(SQL, PARAMS);

            if(results.affectedRows as number < 1) {
                await connection.rollback();

                return {
                    code: FAILURE_DELETE_REVIEW,
                    message: "리뷰 삭제 실패!",
                    payload: null
                };
            }

            await connection.commit();

            SQL = "DELETE " +
                  "FROM photos " +
                  "WHERE review_id = ?";

            await connection.beginTransaction();

            [results, rows] = await connection.query(SQL, PARAMS);

            await connection.commit();

            return {
                code: SUCCESS_DELETE_REVIEW,
                message: "리뷰 삭제 성공!",
                payload: null
            };
        } catch(e) {
            await connection.rollback();

            return {
                code: DATABASE_ERROR,
                message: JSON.stringify(e),
                payload: null 
            };
        } finally {
            connection.release();
        }
    }

    public async compensateForSaveReview(PARAMS: string[]): Promise<void> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "DELETE " +
                                "FROM reviews " +
                                "WHERE review_id = ?";

            await connection.beginTransaction();

            await connection.query(
                SQL,
                [PARAMS]
            );

            await connection.commit();
        } catch(error) {
            await connection.rollback();
            
            logger.error("compensateForSaveReview: " + error);
        } finally {
            connection.release();
        }
    }

    public async approveStatusForSaveReview(reviewId: string) {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "UPDATE reviews " +
                                "SET status = ? " +
                                "WHERE review_id = ?";
            const PARAMS: string[] = [STATUS.APPROVED, reviewId];
            
            await connection.beginTransaction();

            await connection.query(SQL, PARAMS);

            await connection.commit();
        } catch(e) {
            await connection.rollback();

            logger.error(JSON.stringify(e));
        } finally {
            connection.release();
        }
    }

    public async approveStatusForSavePhoto(id: number) {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "UPDATE photos " +
                                "SET status = ? " +
                                "WHERE id = ?";                    
            const PARAMS: any[] = [STATUS.APPROVED, 
                                   id];

            await connection.beginTransaction();

            await connection.query(SQL, PARAMS);

            await connection.commit();
        } catch(e) {
            await connection.rollback();

            logger.error(JSON.stringify(e));
        } finally {
            connection.release();
        }
    }

    public async approveStatusForPhotos(id: number) {
        const connection: PoolConnection = await mysql.getConnection();
    }
}

export { ReviewRepository };