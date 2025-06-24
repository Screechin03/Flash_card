import express from 'express';
import flashcardController from '../controllers/flashcardController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validation from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Flashcard set routes
router.post('/sets', validation.validateFlashcardSet, flashcardController.createSet);
router.get('/sets', flashcardController.getUserSets);
router.get('/sets/:setId', flashcardController.getSetById);
router.put('/sets/:setId', flashcardController.updateSet);
router.delete('/sets/:setId', flashcardController.deleteSet);

// Flashcard routes
router.post('/sets/:setId/cards', validation.validateFlashcard, flashcardController.createCard);
router.put('/cards/:cardId', flashcardController.updateCard);
router.delete('/cards/:cardId', flashcardController.deleteCard);

// Study routes
router.get('/sets/:setId/study', flashcardController.getRandomCards);

export default router;
