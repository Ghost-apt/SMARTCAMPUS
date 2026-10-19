const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidators');
const authenticate = require('../middleware/authenticate');

const { getRegistrationStatus } = require('../controllers/registrationController');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/registration-status', getRegistrationStatus);

// Protected routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;

