import Analytics from '../models/Analytics.js';

const analyticsController = {
    // Save user's progress on a flashcard
    async saveProgress(req, res) {
        try {
            const { setId, cardId, status } = req.body;
            const userId = req.user.id;

            if (!setId || !cardId || !status) {
                return res.status(400).json({ message: 'Set ID, card ID, and status are required' });
            }

            const progress = await Analytics.saveProgress(userId, setId, cardId, status);
            res.status(201).json({
                message: 'Progress saved successfully',
                progress
            });
        } catch (error) {
            console.error('Save progress error:', error);
            res.status(500).json({ message: 'Server error while saving progress' });
        }
    },

    // Get user's overall progress
    async getProgress(req, res) {
        try {
            const userId = req.user.id;
            const progress = await Analytics.getProgress(userId);

            res.json({
                message: 'Progress retrieved successfully',
                progress
            });
        } catch (error) {
            console.error('Get progress error:', error);
            res.status(500).json({ message: 'Server error while fetching progress' });
        }
    },

    // Get user's daily activity
    async getDailyActivity(req, res) {
        try {
            const userId = req.user.id;
            const activity = await Analytics.getDailyActivity(userId);

            res.json({
                message: 'Daily activity retrieved successfully',
                activity
            });
        } catch (error) {
            console.error('Get daily activity error:', error);
            res.status(500).json({ message: 'Server error while fetching daily activity' });
        }
    },

    // Get user's progress by topic
    async getTopicProgress(req, res) {
        try {
            const userId = req.user.id;
            const topics = await Analytics.getTopicProgress(userId);

            res.json({
                message: 'Topic progress retrieved successfully',
                topics
            });
        } catch (error) {
            console.error('Get topic progress error:', error);
            res.status(500).json({ message: 'Server error while fetching topic progress' });
        }
    },

    // Get recently studied cards
    async getRecentCards(req, res) {
        try {
            const userId = req.user.id;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const cards = await Analytics.getRecentCards(userId, limit);

            res.json({
                message: 'Recent cards retrieved successfully',
                cards
            });
        } catch (error) {
            console.error('Get recent cards error:', error);
            res.status(500).json({ message: 'Server error while fetching recent cards' });
        }
    }
};

export default analyticsController;
