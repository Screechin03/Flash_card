import pool from './config/database.js';

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully!');

        const result = await client.query('SELECT NOW()');
        console.log('Current time from database:', result.rows[0].now);

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
}

testConnection();