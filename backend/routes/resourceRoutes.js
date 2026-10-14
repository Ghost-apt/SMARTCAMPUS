const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, resourceController.getResources);
router.post('/', authenticate, authorize('faculty', 'admin'), resourceController.createResource);
router.delete('/:id', authenticate, authorize('faculty', 'admin'), resourceController.deleteResource);

module.exports = router;

