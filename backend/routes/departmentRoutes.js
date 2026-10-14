const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, departmentController.getDepartments);
router.post('/', authenticate, authorize('admin'), departmentController.createDepartment);
router.patch('/:id', authenticate, authorize('admin'), departmentController.updateDepartment);
router.delete('/:id', authenticate, authorize('admin'), departmentController.deleteDepartment);

module.exports = router;

