import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
    static async create(username, email, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at';
            const values = [username, email, hashedPassword];

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Username or email already exists');
            }
            throw error;
        }
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    static async updateUser(id, updates) {
        const fields = [];
        const values = [];
        let paramCounter = 1;

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                fields.push(`${key} = $${paramCounter}`);
                values.push(updates[key]);
                paramCounter++;
            }
        });

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(id);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING id, username, email, created_at`;

        const result = await pool.query(query, values);
        return result.rows[0];
    }
}

export default User;