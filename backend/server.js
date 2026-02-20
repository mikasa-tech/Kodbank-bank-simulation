const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite default ports
    credentials: true
}));

// Database Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Helper for DB queries
const query = (text, params) => pool.query(text, params);

// 1. User Registration
app.post('/api/register', async (req, res) => {
    const { uid, uname, password, email, phone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO koduser (uid, uname, password, email, phone, role, balance) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [uid, uname, hashedPassword, email, phone, 'customer', 100000.00]
        );
        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// 2. User Login
app.post('/api/login', async (req, res) => {
    const { uname, password } = req.body;
    try {
        const result = await query('SELECT * FROM koduser WHERE uname = $1', [uname]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { sub: user.uname, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Store token in DB
        await query('INSERT INTO UserToken (username, token) VALUES ($1, $2)', [user.uname, token]);

        // Set Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });

        res.json({ status: 'success', message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// 3. Token Verification Middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// 4. Check Balance
app.get('/api/balance', verifyToken, async (req, res) => {
    const username = req.user.sub;
    try {
        const result = await query('SELECT balance FROM koduser WHERE uname = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ balance: result.rows[0].balance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
