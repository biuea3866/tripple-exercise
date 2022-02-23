import Mysql from 'mysql2';
import {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PORT,
    MYSQL_PASSWORD,
    MYSQL_DATABASE
} from '../config/env.variable';

const pool = Mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
});

const mysql = pool.promise();

export { mysql };