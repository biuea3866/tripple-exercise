// place-service 내 응답 코드
const IS_FIRST_REVIEW: number = 2001;
const IS_NOT_FIRST_REVIEW: number = 2002;

// 전체 서비스들 내 공통 코드
const DATABASE_ERROR: number = 10000;
const STEP_FORWARD: number = 20001;
const STEP_BACKWARD: number = 20002;

// HTTP 응답 코드
const OK: number = 200;                  
const CREATED: number = 201;            
const NO_CONTENTED: number = 204;
const BAD_GATEWAY: number = 400;            // validation
const UN_AUTHORIZED: number = 401;
const FORBIDDEN: number = 403;              // role: user, admin
const NOT_FOUND: number = 404;
const INTERNAL_SERVER_ERROR: number = 500;

export {
    IS_FIRST_REVIEW,
    IS_NOT_FIRST_REVIEW,
    DATABASE_ERROR,
    STEP_FORWARD,
    STEP_BACKWARD,
    OK,
    CREATED,
    NO_CONTENTED,
    BAD_GATEWAY,
    UN_AUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR
}