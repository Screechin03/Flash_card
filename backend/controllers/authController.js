import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const authController = {
    // Register new user
    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Validation
            if (!username || !email || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already taken' });
            }

            // Create user
            const user = await User.create(username, email, password);
            const token = generateToken(user.id);

            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    },

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await User.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = generateToken(user.id);

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    },

    // Get current user
    async getMe(req, res) {
        try {
            res.json({
                user: req.user
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

export default authController;
