const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

const validation = {
    validateRegistration: (req, res, next) => {
        const { username, email, password } = req.body;
        const errors = [];

        if (!username) {
            errors.push('Username is required');
        } else if (!validateUsername(username)) {
            errors.push('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
        }

        if (!email) {
            errors.push('Email is required');
        } else if (!validateEmail(email)) {
            errors.push('Please provide a valid email address');
        }

        if (!password) {
            errors.push('Password is required');
        } else if (!validatePassword(password)) {
            errors.push('Password must be at least 6 characters long');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        next();
    },

    validateLogin: (req, res, next) => {
        const { email, password } = req.body;
        const errors = [];

        if (!email) {
            errors.push('Email is required');
        }

        if (!password) {
            errors.push('Password is required');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        next();
    },

    validateFlashcardSet: (req, res, next) => {
        const { title } = req.body;
        const errors = [];

        if (!title) {
            errors.push('Title is required');
        } else if (title.length < 2 || title.length > 100) {
            errors.push('Title must be between 2 and 100 characters');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        next();
    },

    validateFlashcard: (req, res, next) => {
        const { front, back } = req.body;
        const errors = [];

        if (!front) {
            errors.push('Front side is required');
        } else if (front.length > 1000) {
            errors.push('Front side must be less than 1000 characters');
        }

        if (!back) {
            errors.push('Back side is required');
        } else if (back.length > 1000) {
            errors.push('Back side must be less than 1000 characters');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        next();
    }
};

export default validation;
