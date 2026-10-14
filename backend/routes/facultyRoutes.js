const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, facultyController.getFaculty);
router.get('/:id', authenticate, facultyController.getFacultyById);

// Admin-only management
router.post('/', authenticate, authorize('admin'), facultyController.createFaculty);
router.patch('/:id', authenticate, authorize('admin'), facultyController.updateFaculty);
router.delete('/:id', authenticate, authorize('admin'), facultyController.deleteFaculty);

module.exports = router;
