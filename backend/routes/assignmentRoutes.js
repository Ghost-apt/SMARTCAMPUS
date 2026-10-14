const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, assignmentController.getAssignments);
router.post('/', authenticate, authorize('faculty', 'admin'), assignmentController.createAssignment);
router.post('/:id/submit', authenticate, authorize('student'), assignmentController.submitAssignment);
router.patch('/:id/grade', authenticate, authorize('faculty', 'admin'), assignmentController.gradeSubmission);

module.exports = router;

