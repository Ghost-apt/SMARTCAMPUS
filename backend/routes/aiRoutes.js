const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// @route   GET /api/ai/academic-insights
// @desc    Get student academic performance analysis and ML risk diagnostic
// @access  Private / Student, Admin
router.get(
  '/academic-insights',
  authenticate,
  authorize('student', 'admin'),
  aiController.getAcademicInsightsController
);

// @route   GET /api/ai/recommendations
// @desc    Get personalized learning curriculum & library recommendations
// @access  Private / Student, Admin
router.get(
  '/recommendations',
  authenticate,
  authorize('student', 'admin'),
  aiController.getRecommendationsController
);

// @route   GET /api/ai/early-support
// @desc    Get cohort early-support analysis (Faculty / Admin) or personal risk (Student)
// @access  Private
router.get(
  '/early-support',
  authenticate,
  aiController.getEarlySupportCohortController
);

// @route   POST /api/ai/chat
// @desc    Interact with role-aware AI campus assistant
// @access  Private
router.post(
  '/chat',
  authenticate,
  aiController.chatAssistantController
);

// @route   POST /api/ai/assistant
// @desc    Alias for role-aware AI campus assistant
// @access  Private
router.post(
  '/assistant',
  authenticate,
  aiController.chatAssistantController
);

// @route   GET /api/ai/status
// @desc    Check health and operational mode of AI microservice and fallback engine
// @access  Private
router.get(
  '/status',
  authenticate,
  aiController.getAiStatusController
);

// @route   POST /api/ai/ml/retrain
// @desc    Trigger ML Early-Support Classifier retraining (Admin only)
// @access  Private / Admin
router.post(
  '/ml/retrain',
  authenticate,
  authorize('admin'),
  aiController.retrainModelController
);

// @route   POST /api/ai/document-assistant/query
// @desc    Grounded academic document question answering with verified citations
// @access  Private
router.post(
  '/document-assistant/query',
  authenticate,
  aiController.queryDocumentAssistantController
);

// @route   GET /api/ai/rag/status
// @desc    Check health and status of RAG vector store
// @access  Private
router.get(
  '/rag/status',
  authenticate,
  aiController.getRagStatusController
);

module.exports = router;
