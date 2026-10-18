const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Admin Analytics
router.get(
  '/admin/overview',
  authenticate,
  authorize('admin'),
  analyticsController.getAdminAnalytics
);

router.get(
  '/admin/audit-logs',
  authenticate,
  authorize('admin'),
  analyticsController.getAdminAuditLogs
);

// Faculty Analytics
router.get(
  '/faculty/overview',
  authenticate,
  authorize('faculty', 'admin'),
  analyticsController.getFacultyAnalytics
);

// Student Analytics
router.get(
  '/student/overview',
  authenticate,
  authorize('student', 'admin'),
  analyticsController.getStudentAnalytics
);

module.exports = router;
