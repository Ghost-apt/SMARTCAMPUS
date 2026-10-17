const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Programs
router.get('/courses', authenticate, courseController.getCourses);
router.post('/courses', authenticate, authorize('admin'), courseController.createCourse);
router.patch('/courses/:id', authenticate, authorize('admin'), courseController.updateCourse);
router.delete('/courses/:id', authenticate, authorize('admin'), courseController.deleteCourse);

// Subjects
router.get('/subjects', authenticate, courseController.getSubjects);
router.post('/subjects', authenticate, authorize('admin', 'faculty'), courseController.createSubject);
router.patch('/subjects/:id', authenticate, authorize('admin', 'faculty'), courseController.updateSubject);

// Syllabus & Student Revision Progress
router.get('/subjects/:id/syllabus', authenticate, courseController.getSyllabus);
router.put('/subjects/:id/syllabus', authenticate, authorize('admin', 'faculty'), courseController.updateSyllabus);
router.get('/subjects/:id/progress', authenticate, courseController.getStudentProgress);
router.post('/subjects/:id/progress/toggle', authenticate, courseController.toggleTopicProgress);

module.exports = router;

