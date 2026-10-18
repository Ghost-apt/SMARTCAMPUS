/**
 * SmartCampus AI — Academic Legacy Compatibility Router
 * 
 * Delegates academic route endpoints (/courses, /notices, /attendance, /assignments, /ai/chat)
 * to the authoritative controllers to avoid route shadowing, schema drift, and unvalidated mutations.
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Authoritative controllers
const courseController = require('../controllers/courseController');
const noticeController = require('../controllers/noticeController');
const attendanceController = require('../controllers/attendanceController');
const assignmentController = require('../controllers/assignmentController');
const aiController = require('../controllers/aiController');

// ==========================================
// 1. COURSES DELEGATION
// ==========================================
router.get('/courses', authenticate, courseController.getCourses);
router.post('/courses', authenticate, authorize('admin', 'faculty'), courseController.createCourse);

// ==========================================
// 2. NOTICES DELEGATION
// ==========================================
router.get('/notices', noticeController.getNotices);
router.post('/notices', authenticate, authorize('faculty', 'admin'), noticeController.createNotice);

// ==========================================
// 3. ATTENDANCE DELEGATION
// ==========================================
router.get('/attendance/summary', authenticate, attendanceController.getAttendanceSummary);
router.post('/attendance/mark', authenticate, authorize('faculty', 'admin'), attendanceController.markAttendance);

// ==========================================
// 4. ASSIGNMENTS DELEGATION
// ==========================================
router.get('/assignments', authenticate, assignmentController.getAssignments);
router.post('/assignments', authenticate, authorize('faculty', 'admin'), assignmentController.createAssignment);

// ==========================================
// 5. AI ASSISTANT GATEWAY DELEGATION
// ==========================================
router.post('/ai/chat', aiController.chatAssistantController);

module.exports = router;
