// setup-db.js - Script to initialize the database tables on first deploy
import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const setupDatabase = async () => {
    console.log('Starting database setup...');

    try {
        // Check connection
        await pool.query('SELECT NOW()');
        console.log('Database connection successful');

        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Users table setup complete');

        // Create flashcard_sets table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS flashcard_sets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                is_public BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Flashcard sets table setup complete');

        // Create flashcards table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS flashcards (
                id SERIAL PRIMARY KEY,
                set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
                front TEXT NOT NULL,
                back TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Flashcards table setup complete');

        // Create user_progress table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_progress (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
                set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
                status VARCHAR(20) CHECK (status IN ('correct', 'incorrect', 'skipped')),
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, flashcard_id)
            );
        `);
        console.log('User progress table setup complete');

        // Load and run analytics schema if it exists
        try {
            const analyticsSchemaPath = path.join(__dirname, 'schema', 'analytics.sql');
            if (fs.existsSync(analyticsSchemaPath)) {
                const analyticsSchema = fs.readFileSync(analyticsSchemaPath, 'utf8');
                await pool.query(analyticsSchema);
                console.log('Analytics schema setup complete');
            }
        } catch (err) {
            console.error('Error setting up analytics schema:', err);
            // Continue even if analytics setup fails
        }

        console.log('Database setup completed successfully');
    } catch (err) {
        console.error('Database setup error:', err);
    } finally {
        await pool.end();
        console.log('Database connection closed');
    }
};

setupDatabase();
