import pool from "../config/database.js";

class Analytics {
    // Save user's progress on a flashcard
    static async saveProgress(userId, setId, cardId, status) {
        try {
            const timestamp = new Date().toISOString();
            const query = `
        INSERT INTO analytics (user_id, set_id, card_id, status, timestamp)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
            const values = [userId, setId, cardId, status, timestamp];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error saving progress:', error);
            throw error;
        }
    }

    // Get user's overall progress
    static async getProgress(userId) {
        try {
            const query = `
        SELECT 
          f.set_id, 
          fs.title as set_title,
          COUNT(DISTINCT a.card_id) as cards_studied,
          COUNT(DISTINCT f.id) as total_cards,
          SUM(CASE WHEN a.status = 'correct' THEN 1 ELSE 0 END) as correct_count,
          SUM(CASE WHEN a.status = 'incorrect' THEN 1 ELSE 0 END) as incorrect_count
        FROM flashcard_sets fs
        JOIN flashcards f ON fs.id = f.set_id
        LEFT JOIN (
          SELECT DISTINCT ON (card_id) *
          FROM analytics
          WHERE user_id = $1
          ORDER BY card_id, timestamp DESC
        ) a ON f.id = a.card_id
        WHERE fs.user_id = $1
        GROUP BY f.set_id, fs.title
      `;
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting progress:', error);
            throw error;
        }
    }

    // Get user's daily activity
    static async getDailyActivity(userId) {
        try {
            const query = `
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as total_count
        FROM analytics
        WHERE user_id = $1
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        LIMIT 30
      `;
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting daily activity:', error);
            throw error;
        }
    }

    // Get user's progress by topic
    static async getTopicProgress(userId) {
        try {
            const query = `
        SELECT 
          SPLIT_PART(fs.title, ':', 1) as topic,
          COUNT(DISTINCT a.card_id) as cards_studied,
          COUNT(DISTINCT f.id) as total_cards
        FROM flashcard_sets fs
        JOIN flashcards f ON fs.id = f.set_id
        LEFT JOIN analytics a ON f.id = a.card_id AND a.user_id = $1
        WHERE fs.user_id = $1
        GROUP BY SPLIT_PART(fs.title, ':', 1)
      `;
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting topic progress:', error);
            throw error;
        }
    }

    // Get recently studied cards
    static async getRecentCards(userId, limit = 10) {
        try {
            const query = `
        SELECT DISTINCT ON (a.card_id)
          a.card_id,
          a.set_id,
          f.front,
          f.back,
          fs.title as set_title,
          a.timestamp
        FROM analytics a
        JOIN flashcards f ON a.card_id = f.id
        JOIN flashcard_sets fs ON a.set_id = fs.id
        WHERE a.user_id = $1
        ORDER BY a.card_id, a.timestamp DESC
        LIMIT $2
      `;
            const result = await pool.query(query, [userId, limit]);
            return result.rows;
        } catch (error) {
            console.error('Error getting recent cards:', error);
            throw error;
        }
    }
}

export default Analytics;
