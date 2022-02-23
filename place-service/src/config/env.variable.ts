const PORT: number = 6200;

const MYSQL_HOST: string = 'localhost';
const MYSQL_USER: string = 'root';
const MYSQL_PORT: number = 3306;
const MYSQL_PASSWORD: string = '10a10a';
const MYSQL_DATABASE: string = 'TRIPPLE_PLACE';

const AMQP_HOST: string = "amqps://xvnzykqp:mxGKnME_m9EMm2R6KVYDnJ_jj8YHzqdj@beaver.rmq.cloudamqp.com/xvnzykqp";

const REQUEST_IS_EXIST_REVIEW: string = "REQUEST-IS-EXIST-REVIEW"
const REQUEST_INCREASE_POINT: string = "REQUEST-INCREASE-POINT";
const RESPONSE_REVIEW: string = "RESPONSE-REVIEW";

export {
    PORT,
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PORT,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    AMQP_HOST,
    REQUEST_IS_EXIST_REVIEW,
    REQUEST_INCREASE_POINT,
    RESPONSE_REVIEW
};