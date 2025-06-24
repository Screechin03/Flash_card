import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Analytics routes
router.post('/progress', analyticsController.saveProgress);
router.get('/progress', analyticsController.getProgress);
router.get('/daily', analyticsController.getDailyActivity);
router.get('/topics', analyticsController.getTopicProgress);
router.get('/recent', analyticsController.getRecentCards);

export default router;
