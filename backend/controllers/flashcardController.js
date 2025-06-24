import Flashcard from '../models/Flashcard.js';

const flashcardController = {
    // Create new flashcard set
    async createSet(req, res) {
        try {
            const { title, description } = req.body;
            const userId = req.user.id;

            if (!title) {
                return res.status(400).json({ message: 'Title is required' });
            }

            const flashcardSet = await Flashcard.createSet(title, description, userId);
            res.status(201).json({
                message: 'Flashcard set created successfully',
                set: flashcardSet
            });
        } catch (error) {
            console.error('Create set error:', error);
            res.status(500).json({ message: 'Server error while creating set' });
        }
    },

    // Get all user's flashcard sets
    async getUserSets(req, res) {
        try {
            const userId = req.user.id;
            const sets = await Flashcard.getUserSets(userId);

            res.json({
                message: 'Sets retrieved successfully',
                sets
            });
        } catch (error) {
            console.error('Get sets error:', error);
            res.status(500).json({ message: 'Server error while fetching sets' });
        }
    },

    // Get specific set by ID
    async getSetById(req, res) {
        try {
            const { setId } = req.params;
            const userId = req.user.id;

            const set = await Flashcard.getSetById(setId, userId);
            if (!set) {
                return res.status(404).json({ message: 'Flashcard set not found' });
            }

            const cards = await Flashcard.getSetCards(setId);

            res.json({
                message: 'Set retrieved successfully',
                set: {
                    ...set,
                    cards
                }
            });
        } catch (error) {
            console.error('Get set error:', error);
            res.status(500).json({ message: 'Server error while fetching set' });
        }
    },

    // Update flashcard set
    async updateSet(req, res) {
        try {
            const { setId } = req.params;
            const userId = req.user.id;
            const updates = req.body;

            const updatedSet = await Flashcard.updateSet(setId, userId, updates);
            if (!updatedSet) {
                return res.status(404).json({ message: 'Flashcard set not found' });
            }

            res.json({
                message: 'Set updated successfully',
                set: updatedSet
            });
        } catch (error) {
            console.error('Update set error:', error);
            res.status(500).json({ message: 'Server error while updating set' });
        }
    },

    // Delete flashcard set
    async deleteSet(req, res) {
        try {
            const { setId } = req.params;
            const userId = req.user.id;

            const deletedSet = await Flashcard.deleteSet(setId, userId);
            if (!deletedSet) {
                return res.status(404).json({ message: 'Flashcard set not found' });
            }

            res.json({
                message: 'Set deleted successfully',
                set: deletedSet
            });
        } catch (error) {
            console.error('Delete set error:', error);
            res.status(500).json({ message: 'Server error while deleting set' });
        }
    },

    // Create new flashcard
    async createCard(req, res) {
        try {
            const { setId } = req.params;
            const { front, back } = req.body;
            const userId = req.user.id;

            if (!front || !back) {
                return res.status(400).json({ message: 'Front and back are required' });
            }

            // Verify set belongs to user
            const set = await Flashcard.getSetById(setId, userId);
            if (!set) {
                return res.status(404).json({ message: 'Flashcard set not found' });
            }

            const card = await Flashcard.createCard(front, back, setId);
            res.status(201).json({
                message: 'Flashcard created successfully',
                card
            });
        } catch (error) {
            console.error('Create card error:', error);
            res.status(500).json({ message: 'Server error while creating card' });
        }
    },

    // Update flashcard
    async updateCard(req, res) {
        try {
            const { cardId } = req.params;
            const updates = req.body;

            const updatedCard = await Flashcard.updateCard(cardId, updates);
            if (!updatedCard) {
                return res.status(404).json({ message: 'Flashcard not found' });
            }

            res.json({
                message: 'Card updated successfully',
                card: updatedCard
            });
        } catch (error) {
            console.error('Update card error:', error);
            res.status(500).json({ message: 'Server error while updating card' });
        }
    },

    // Delete flashcard
    async deleteCard(req, res) {
        try {
            const { cardId } = req.params;

            const deletedCard = await Flashcard.deleteCard(cardId);
            if (!deletedCard) {
                return res.status(404).json({ message: 'Flashcard not found' });
            }

            res.json({
                message: 'Card deleted successfully',
                card: deletedCard
            });
        } catch (error) {
            console.error('Delete card error:', error);
            res.status(500).json({ message: 'Server error while deleting card' });
        }
    },

    // Get random cards for study session
    async getRandomCards(req, res) {
        try {
            const { setId } = req.params;
            const { limit = 10 } = req.query;
            const userId = req.user.id;

            // Verify set belongs to user
            const set = await Flashcard.getSetById(setId, userId);
            if (!set) {
                return res.status(404).json({ message: 'Flashcard set not found' });
            }

            const cards = await Flashcard.getRandomCards(setId, parseInt(limit));
            res.json({
                message: 'Random cards retrieved successfully',
                cards
            });
        } catch (error) {
            console.error('Get random cards error:', error);
            res.status(500).json({ message: 'Server error while fetching random cards' });
        }
    }
};

export default flashcardController;
