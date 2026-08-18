require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// CONNECT DATABASE
// ============================================
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
});
