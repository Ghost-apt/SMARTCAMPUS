const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  getPendingCount
} = require('../controllers/registrationController');

// All admin registration routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Route definitions
router.get('/', getRegistrationRequests);
router.get('/count/pending', getPendingCount);
router.get('/:id', getRegistrationRequestById);

// Support both POST and PATCH for approval and rejection
router.post('/:id/approve', approveRegistrationRequest);
router.patch('/:id/approve', approveRegistrationRequest);

router.post('/:id/reject', rejectRegistrationRequest);
router.patch('/:id/reject', rejectRegistrationRequest);

module.exports = router;
