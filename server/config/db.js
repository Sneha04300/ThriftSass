const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

require('dotenv').config();
console.log("ENV PASSWORD:", process.env.DB_PASSWORD);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: 'Root@091',
    database: process.env.DB_NAME || 'thriftsaas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;