const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Profile routes
router.get('/me', authenticate, userController.getCurrentUserProfile);
router.patch('/me', authenticate, userController.updateCurrentUserProfile);

// Admin user management route
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

module.exports = router;

