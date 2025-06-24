import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupAnalyticsTable() {
    try {
        console.log('Setting up analytics table in flashcards_db database...');

        // Read the SQL schema file
        const schemaPath = path.join(__dirname, 'schema', 'analytics.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute the SQL
        await pool.query(schema);

        console.log('Analytics table setup completed successfully!');
    } catch (error) {
        console.error('Error setting up analytics table:', error);
    } finally {
        // Close the connection pool
        await pool.end();
    }
}

// Run the setup
setupAnalyticsTable();
