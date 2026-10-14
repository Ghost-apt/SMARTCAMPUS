const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Student Dashboard (Students and Admins)
router.get('/student', authenticate, authorize('student', 'admin'), dashboardController.getStudentDashboard);

// Faculty Dashboard (Faculty and Admins)
router.get('/faculty', authenticate, authorize('faculty', 'admin'), dashboardController.getFacultyDashboard);

// Admin Dashboard (Admins only)
router.get('/admin', authenticate, authorize('admin'), dashboardController.getAdminDashboard);

module.exports = router;

