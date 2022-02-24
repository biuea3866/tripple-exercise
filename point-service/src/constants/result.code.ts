// point-service 내 응답 코드
const SUCCESS_INCREASE_POINT: number = 3001;
const FAILURE_INCREASE_POINT: number = 3002;
const SUCCESS_DECREASE_POINT: number = 3003;
const FAILURE_DECREASE_POINT: number = 3004;
const SUCCESS_GET_POINTS: number = 3005;
const FAILURE_GET_POINTS: number = 3006;
const SUCCESS_GET_HISTORY: number = 3007;
const FAILURE_GET_HISTORY: number = 3008;
const SUCCESS_SAVE_HISTORY: number = 3009;
const FAILURE_SAVE_HISTORY: number = 3010;

// 전체 서비스들 내 공통 코드
const DATABASE_ERROR: number = 10000;
const STEP_FORWARD: number = 20001;
const STEP_BACKWARD: number = 20002;

// HTTP 응답 코드
const OK: number = 200;                  
const CREATED: number = 201;            
const NO_CONTENT: number = 204;
const BAD_GATEWAY: number = 400;            // validation
const UN_AUTHORIZED: number = 401;
const FORBIDDEN: number = 403;              // role: user, admin
const NOT_FOUND: number = 404;
const INTERNAL_SERVER_ERROR: number = 500;

export {
    SUCCESS_INCREASE_POINT,
    FAILURE_INCREASE_POINT,
    SUCCESS_DECREASE_POINT,
    FAILURE_DECREASE_POINT,
    SUCCESS_GET_POINTS,
    FAILURE_GET_POINTS,
    SUCCESS_GET_HISTORY,
    FAILURE_GET_HISTORY,
    SUCCESS_SAVE_HISTORY,
    FAILURE_SAVE_HISTORY,
    DATABASE_ERROR,
    STEP_FORWARD,
    STEP_BACKWARD,
    OK,
    CREATED,
    NO_CONTENT,
    BAD_GATEWAY,
    UN_AUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR
}