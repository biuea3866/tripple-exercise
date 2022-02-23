import { PoolConnection } from "mysql2/promise";
import { DATABASE_ERROR, FAILURE_DECREASE_POINT, FAILURE_GET_POINTS, FAILURE_INCREASE_POINT, FAILURE_SAVE_HISTORY, SUCCESS_DECREASE_POINT, SUCCESS_GET_POINTS, SUCCESS_INCREASE_POINT, SUCCESS_SAVE_HISTORY } from "../constants/result.code";
import { STATUS } from "../constants/status.enum";
import { ResponseDto } from "../interface/response.dto";
import { logger } from "../logs/logging";
import { mysql } from "../models/mysql.connection";

class PointRepository {
    constructor() {}

    public async getPoints(PARAMS: string[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "SELECT point " +
                                "FROM users " +
                                "WHERE user_id = ?";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(
                SQL, 
                PARAMS
            );

            await connection.commit();

            if(results.affectedRow as number < 1) {
                return {
                    code: FAILURE_GET_POINTS,
                    message: "포인트 조회 실패!",
                    payload: null
                };
            }

            return {
                code: SUCCESS_GET_POINTS,
                message: "포인트 조회 성공!",
                payload: results[0].point
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

    public async getHistory(PARAMS: string[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "SELECT history " +
                                "FROM history " +
                                "WHERE user_id = ?";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(
                SQL, 
                PARAMS
            );

            await connection.commit();

            if(results.affectedRow as number < 1) {
                return {
                    code: FAILURE_GET_POINTS,
                    message: "포인트 내역 조회 실패!",
                    payload: null
                };
            }

            return {
                code: SUCCESS_GET_POINTS,
                message: "포인트 내역 조회 성공!",
                payload: results
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

    public async increasePoint(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "UPDATE users " +
                                "SET point = point + ? " +
                                "WHERE user_id = ?";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(
                SQL, 
                PARAMS
            );

            await connection.commit();

            if(results.affectedRow as number < 1) {
                return {
                    code: FAILURE_INCREASE_POINT,
                    message: "포인트 부여 실패!",
                    payload: null
                };
            }

            return {
                code: SUCCESS_INCREASE_POINT,
                message: "포인트 부여 성공!",
                payload: null
            };
        } catch(e) {
            logger.error("Repsitory - increasePoint: " + JSON.stringify(e));

            return {
                code: DATABASE_ERROR,
                message: JSON.stringify(e),
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async saveHistory(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "INSERT INTO " +
                                "history(user_id, type, status, review_id, history, id) " +
                                "VALUES(?, ?, ?, ?, ?, ?)";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(
                SQL, 
                PARAMS
            );
            
            if(!results.insertId) {
                return {
                    code: FAILURE_SAVE_HISTORY,
                    message: "포인트 내역 저장 실패!",
                    payload: null
                };
            }

            await connection.commit();
                
            return {
                code: SUCCESS_SAVE_HISTORY,
                message: "포인트 내역 저장 성공!",
                payload: results.insertId 
            };
        } catch(e) {
            logger.error("Repository - saveHistory: " + JSON.stringify(e));

            return {
                code: DATABASE_ERROR,
                message: e,
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async decreasePoint(PARAMS: any[]): Promise<ResponseDto> {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "UPDATE users " +
                                "SET point = point + ? " +
                                "WHERE user_id = ?";

            await connection.beginTransaction();

            const [results, rows]: any = await connection.query(
                SQL, 
                PARAMS
            );

            await connection.commit();

            if(results.affectedRow as number < 1) {
                return {
                    code: FAILURE_DECREASE_POINT,
                    message: "포인트 회수 실패!",
                    payload: null
                };
            }

            return {
                code: SUCCESS_DECREASE_POINT,
                message: "포인트 회수 성공!",
                payload: null
            };
        } catch(e) {
            logger.error("Repository - decreasePoint: " + JSON.stringify(e));

            return {
                code: DATABASE_ERROR,
                message: JSON.stringify(e),
                payload: null
            };
        } finally {
            connection.release();
        }
    }

    public async approveStatusForSaveHistory(historyId: number) {
        const connection: PoolConnection = await mysql.getConnection();

        try {
            const SQL: string = "UPDATE history " +
                                "SET status = ? " +
                                "WHERE id = ?";
            const PARAMS: any[] = [STATUS.APPROVED, 
                                   historyId];
            
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
}

export { PointRepository };