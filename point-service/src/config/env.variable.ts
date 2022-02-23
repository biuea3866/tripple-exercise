const PORT: number = 6400;

const MYSQL_HOST: string = 'mysql';
const MYSQL_USER: string = 'root';
const MYSQL_PORT: number = 3306;
const MYSQL_PASSWORD: string = '10a10a';
const MYSQL_DATABASE: string = 'TRIPPLE_AUTH';

const AMQP_HOST: string = "amqps://xvnzykqp:mxGKnME_m9EMm2R6KVYDnJ_jj8YHzqdj@beaver.rmq.cloudamqp.com/xvnzykqp";

const REQUEST_INCREASE_POINT: string = "REQUEST-INCREASE-POINT";
const RESPONSE_REVIEW: string = "RESPONSE-REVIEW";
const REQUEST_DECREASE_POINT: string = "REQUEST-DECREASE-POINT";

export {
    PORT,
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PORT,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    AMQP_HOST,
    RESPONSE_REVIEW,
    REQUEST_INCREASE_POINT,
    REQUEST_DECREASE_POINT
};