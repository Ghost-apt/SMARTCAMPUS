const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, timetableController.getTimetable);
router.post('/', authenticate, authorize('admin', 'faculty'), timetableController.createTimetableEntry);
router.delete('/:id', authenticate, authorize('admin'), timetableController.deleteTimetableEntry);

module.exports = router;
