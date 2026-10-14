const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', noticeController.getNotices);
router.post('/', authenticate, authorize('faculty', 'admin'), noticeController.createNotice);
router.delete('/:id', authenticate, authorize('faculty', 'admin'), noticeController.deleteNotice);

module.exports = router;

