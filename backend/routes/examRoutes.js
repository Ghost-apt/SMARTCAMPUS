const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/examinations', authenticate, examController.getExaminations);
router.post('/examinations', authenticate, authorize('admin', 'faculty'), examController.createExamination);

router.get('/results/my', authenticate, examController.getMyResults);
router.post('/results', authenticate, authorize('faculty', 'admin'), examController.enterResult);

module.exports = router;

