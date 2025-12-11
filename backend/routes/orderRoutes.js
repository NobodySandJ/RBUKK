const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Protected routes
router.post('/', verifyToken, paymentLimiter, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);

// Midtrans webhook (no auth required)
router.post('/payment-callback', orderController.paymentCallback);

module.exports = router;
