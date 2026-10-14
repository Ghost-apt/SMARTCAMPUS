const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const qrAttendanceController = require('../controllers/qrAttendanceController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Student attendance view
router.get('/student', authenticate, attendanceController.getStudentAttendance);

// Faculty / Admin manual attendance operations
router.post('/mark', authenticate, authorize('faculty', 'admin'), attendanceController.markAttendance);
router.get('/report', authenticate, authorize('faculty', 'admin'), attendanceController.getAttendanceReport);

// QR-Based Attendance Session Endpoints (Phase 3)
router.post('/session/create', authenticate, authorize('faculty', 'admin'), qrAttendanceController.createSession);
router.post('/session/scan', authenticate, qrAttendanceController.scanAttendance);
router.get('/session/:id/status', authenticate, qrAttendanceController.getSessionStatus);
router.patch('/session/:id/close', authenticate, authorize('faculty', 'admin'), qrAttendanceController.closeSession);
router.get('/session', authenticate, authorize('faculty', 'admin'), qrAttendanceController.getFacultySessions);

module.exports = router;
