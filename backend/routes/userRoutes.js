const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const { uploadAvatar } = require('../middleware/uploadMiddleware');

// Profile routes
router.get('/me', authenticate, userController.getCurrentUserProfile);
router.patch('/me', authenticate, userController.updateCurrentUserProfile);

// Profile picture upload, change, and remove routes
router.post('/me/profile-picture', authenticate, uploadAvatar, userController.uploadProfilePicture);
router.patch('/me/profile-picture', authenticate, uploadAvatar, userController.uploadProfilePicture);
router.delete('/me/profile-picture', authenticate, userController.removeProfilePicture);

// Admin user management route
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

module.exports = router;

