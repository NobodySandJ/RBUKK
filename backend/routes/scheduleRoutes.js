const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Public routes
router.get('/', scheduleController.getAllEvents);
router.get('/featured', scheduleController.getFeaturedEvents);
router.get('/month/:month', scheduleController.getEventsByMonth);

module.exports = router;
