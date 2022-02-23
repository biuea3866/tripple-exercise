// Result code inside project


// HTTP Status
const OK: number = 200;                  
const CREATED: number = 201;            
const NO_CONTENTED: number = 204;
const BAD_GATEWAY: number = 400;            // validation
const UN_AUTHORIZED: number = 401;
const FORBIDDEN: number = 403;              // role: user, admin
const NOT_FOUND: number = 404;

export {
    OK,
    CREATED,
    NO_CONTENTED,
    BAD_GATEWAY,
    UN_AUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
}