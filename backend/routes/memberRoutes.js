const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Public routes
router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);

module.exports = router;
