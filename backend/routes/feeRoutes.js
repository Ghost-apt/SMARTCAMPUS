const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Student Fee & Ledger Endpoints
router.get('/my', authenticate, feeController.getMyFees);
router.get('/me/summary', authenticate, feeController.getMyFees);
router.get('/me/assessments', authenticate, feeController.getMyFees);
router.get('/me/assessments/:id', authenticate, feeController.getAssessmentById);
router.get('/me/payments', authenticate, feeController.getMyTransactions);
router.get('/payments', authenticate, feeController.getMyTransactions);
router.get('/me/payments/:id', authenticate, feeController.getMyTransactionById);
router.get('/me/payments/:id/receipt', authenticate, feeController.downloadReceipt);
router.post('/me/payments/create-order', authenticate, feeController.createPaymentOrder);
router.post('/me/payments/order', authenticate, feeController.createPaymentOrder);
router.post('/me/payments/verify', authenticate, feeController.verifyPayment);
router.get('/structure', authenticate, feeController.getFeeStructure);

// Razorpay Online Payment Gateway Endpoints
router.post('/order', authenticate, feeController.createPaymentOrder);
router.post('/create-order', authenticate, feeController.createPaymentOrder);
router.post('/verify', authenticate, feeController.verifyPayment);
router.post('/webhook', feeController.handleWebhook);
router.get('/:id/receipt', authenticate, feeController.downloadReceipt);

// Admin Fee & Financial Governance Endpoints
router.get('/', authenticate, authorize('admin'), feeController.getAllFees);
router.post('/', authenticate, authorize('admin'), feeController.createFeeRecord);
router.patch('/:id/adjust', authenticate, authorize('admin'), feeController.adjustFeeRecord);
router.patch('/:id/pay', authenticate, authorize('admin'), feeController.recordPayment);
router.get('/transactions', authenticate, authorize('admin'), feeController.getAllTransactions);
router.get('/admin/summary', authenticate, authorize('admin'), feeController.getAdminFinanceSummary);

module.exports = router;

