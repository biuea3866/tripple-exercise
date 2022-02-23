import mysql from 'mysql2';
import {
    MARIA_HOST,
    MARIA_USER,
    MARIA_PORT,
    MARIA_PASSWORD,
    MARIA_DATABASE
} from '../config/env.variable';

const pool = mysql.createPool({
    host: MARIA_HOST,
    port: MARIA_PORT,
    user: MARIA_USER,
    password: MARIA_PASSWORD,
    database: MARIA_DATABASE
});

const maria = pool.promise();

export { maria };