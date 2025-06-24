import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/auth.js';
import flashcardRoutes from '../routes/flashcards.js';
import analyticsRoutes from '../routes/analytics.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, 'https://flashcard-web.onrender.com']
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({
        message: "Server is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/flashcards/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

export default app;