const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Faculty and Admin can list students
router.get('/', authenticate, authorize('faculty', 'admin'), studentController.getStudents);
router.get('/:id', authenticate, studentController.getStudentById);

// Admin-only operations
router.post('/', authenticate, authorize('admin'), studentController.createStudent);
router.patch('/:id', authenticate, authorize('admin', 'faculty'), studentController.updateStudent);
router.delete('/:id', authenticate, authorize('admin'), studentController.deleteStudent);

module.exports = router;

