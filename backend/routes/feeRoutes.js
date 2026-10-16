const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/my', authenticate, feeController.getMyFees);
router.get('/structure', authenticate, feeController.getFeeStructure);
router.get('/', authenticate, authorize('admin'), feeController.getAllFees);
router.post('/', authenticate, authorize('admin'), feeController.createFeeRecord);
router.patch('/:id/pay', authenticate, authorize('admin'), feeController.recordPayment);

module.exports = router;

