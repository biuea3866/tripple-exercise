// review-service 내 응답 코드
const SUCCESS_SAVE_REVIEW: number = 1001;
const FAILURE_SAVE_REVIEW: number = 1002;
const SUCCESS_GET_REVIEW_BY_INDEX: number = 1003;
const FAILURE_GET_REVIEW_BY_INDEX: number = 1004;
const IS_EXIST_REVIEW: number = 1005;
const IS_NOT_EXIST_REVIEW: number = 1006;
const IS_FIRST_REVIEW: number = 1007;
const IS_NOT_FIRST_REVIEW: number = 1008;
const CHECK_REVIEW: number = 1009;
const SUCCESS_MODIFY_REVIEW: number = 1010;
const FAILURE_MODIFY_REVIEW: number = 1011;
const SUCCESS_DELETE_REVIEW: number = 1012;
const FAILURE_DELETE_REVIEW: number = 1013;
const SUCCESS_GET_REVIEWS: number = 1014;
const FAILURE_GET_REVIEWS: number = 1015;

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
    SUCCESS_SAVE_REVIEW,
    FAILURE_SAVE_REVIEW,
    SUCCESS_GET_REVIEW_BY_INDEX,
    FAILURE_GET_REVIEW_BY_INDEX,
    IS_EXIST_REVIEW,
    IS_NOT_EXIST_REVIEW,
    IS_FIRST_REVIEW,
    IS_NOT_FIRST_REVIEW,
    CHECK_REVIEW,
    SUCCESS_MODIFY_REVIEW,
    FAILURE_MODIFY_REVIEW,
    SUCCESS_DELETE_REVIEW,
    FAILURE_DELETE_REVIEW,
    SUCCESS_GET_REVIEWS,
    FAILURE_GET_REVIEWS,
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