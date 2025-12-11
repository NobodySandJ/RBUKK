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

// CORS configuration - allow all origins for Vercel deployment
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
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
