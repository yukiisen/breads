import mysql from "mysql2";
import winston from "./logger";

const { env } = process;

const database = mysql.createConnection({
    host: env.DBHOST || '127.0.0.1',
    port: +(env.DBPORT || 3306),
    user: process.argv[2],
    password: env.DBPASS,
    supportBigNumbers: true,
    database: 'breads'
}).promise();

database.query('select 0;').then(() => {
    winston.info('MYSQL Databas Connected');
});

export default database;
