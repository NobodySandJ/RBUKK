// Vercel Serverless Function Handler
// This file wraps the Express app for Vercel deployment

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { sanitizeInput } = require('../backend/middleware/sanitize');
const { errorHandler, notFoundHandler } = require('../backend/middleware/errorHandler');
const { apiLimiter } = require('../backend/middleware/rateLimiter');

// Import routes
const authRoutes = require('../backend/routes/authRoutes');
const memberRoutes = require('../backend/routes/memberRoutes');
const productRoutes = require('../backend/routes/productRoutes');
const orderRoutes = require('../backend/routes/orderRoutes');
const scheduleRoutes = require('../backend/routes/scheduleRoutes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Allow Vercel Frontend
const allowedOrigins = [
  'http://localhost:5500', 
  'http://localhost:3000',
  process.env.FRONTEND_URL, // e.g., https://rbukk.vercel.app
  'https://rbukk.vercel.app' // Hardcoded fallback for safety
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('Blocked Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running on Vercel',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/schedule', scheduleRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Export the Express app as a serverless function
module.exports = app;
