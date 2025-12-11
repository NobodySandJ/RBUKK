require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { testConnection } = require('./config/database');
const { sanitizeInput } = require('./middleware/sanitize');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for frontend
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
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
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

// Start server
if (process.env.NODE_ENV !== 'production') {
    const startServer = async () => {
      try {
        await testConnection();
        app.listen(PORT, () => {
          console.log(`\n🚀 Server running on port ${PORT}`);
        });
      } catch (error) {
        console.error('Failed to start server:', error);
      }
    };
    startServer();
}

module.exports = app;