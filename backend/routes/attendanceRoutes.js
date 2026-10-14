const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Student attendance view
router.get('/student', authenticate, attendanceController.getStudentAttendance);

// Faculty / Admin operations
router.post('/mark', authenticate, authorize('faculty', 'admin'), attendanceController.markAttendance);
router.get('/report', authenticate, authorize('faculty', 'admin'), attendanceController.getAttendanceReport);

module.exports = router;

