
const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({
    path: path.join(__dirname, '..', '.env')
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farmer_marketplace',
    port: parseInt(process.env.DB_PORT || '3306', 10),

    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    decimalNumbers: true,

    // Enable secure TLS connection for cloud MySQL
    ssl: process.env.DB_SSL === 'true'
        ? {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
        : undefined
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();

        console.log(
            'MySQL Database connected successfully to',
            process.env.DB_NAME || 'farmer_marketplace'
        );

        connection.release();
        return true;

    } catch (error) {
        console.error('MySQL Database connection failed:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    testConnection
};
