import express from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validation from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validation.validateRegistration, authController.register);
router.post('/login', validation.validateLogin, authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);

export default router;
