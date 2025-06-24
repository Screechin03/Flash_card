import pool from '../config/database.js';

class Flashcard {
    static async createSet(title, description, userId) {
        const query = 'INSERT INTO flashcard_sets (title, description, user_id) VALUES ($1, $2, $3) RETURNING *';
        const values = [title, description, userId];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async createCard(front, back, setId) {
        const query = 'INSERT INTO flashcards (front, back, set_id) VALUES ($1, $2, $3) RETURNING *';
        const values = [front, back, setId];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getUserSets(userId) {
        const query = `
            SELECT fs.*, COUNT(f.id) as card_count 
            FROM flashcard_sets fs 
            LEFT JOIN flashcards f ON fs.id = f.set_id 
            WHERE fs.user_id = $1 
            GROUP BY fs.id 
            ORDER BY fs.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async getSetById(setId, userId) {
        const query = 'SELECT * FROM flashcard_sets WHERE id = $1 AND user_id = $2';
        const result = await pool.query(query, [setId, userId]);
        return result.rows[0];
    }

    static async getSetCards(setId) {
        const query = 'SELECT * FROM flashcards WHERE set_id = $1 ORDER BY created_at ASC';
        const result = await pool.query(query, [setId]);
        return result.rows;
    }

    static async updateSet(setId, userId, updates) {
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

        values.push(setId, userId);
        const query = `UPDATE flashcard_sets SET ${fields.join(', ')} WHERE id = $${paramCounter} AND user_id = $${paramCounter + 1} RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async updateCard(cardId, updates) {
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

        values.push(cardId);
        const query = `UPDATE flashcards SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async deleteSet(setId, userId) {
        const query = 'DELETE FROM flashcard_sets WHERE id = $1 AND user_id = $2 RETURNING *';
        const result = await pool.query(query, [setId, userId]);
        return result.rows[0];
    }

    static async deleteCard(cardId) {
        const query = 'DELETE FROM flashcards WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [cardId]);
        return result.rows[0];
    }

    static async getRandomCards(setId, limit = 10) {
        const query = 'SELECT * FROM flashcards WHERE set_id = $1 ORDER BY RANDOM() LIMIT $2';
        const result = await pool.query(query, [setId, limit]);
        return result.rows;
    }
}

export default Flashcard;