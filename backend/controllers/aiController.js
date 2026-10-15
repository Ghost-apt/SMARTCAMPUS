const aiService = require('../services/aiService');

// @desc    Get student academic performance analysis and risk diagnostics
// @route   GET /api/ai/academic-insights
// @access  Private / Student, Admin
const getAcademicInsightsController = async (req, res, next) => {
  try {
    const studentId = req.user.role === 'admin' && req.query.studentId
      ? req.query.studentId
      : req.user.id;

    const data = await aiService.getAcademicInsights(studentId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// @desc    Get personalized learning curriculum & library recommendations
// @route   GET /api/ai/recommendations
// @access  Private / Student, Admin
const getRecommendationsController = async (req, res, next) => {
  try {
    const studentId = req.user.role === 'admin' && req.query.studentId
      ? req.query.studentId
      : req.user.id;

    const data = await aiService.getPersonalizedRecommendations(studentId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// @desc    Get cohort early-support analysis (Faculty / Admin) or personal risk (Student)
// @route   GET /api/ai/early-support
// @access  Private
const getEarlySupportCohortController = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      const data = await aiService.getAcademicInsights(req.user.id);
      return res.status(200).json({
        success: true,
        type: 'individual',
        data: data.analysis
      });
    }

    // Faculty or Admin
    const data = await aiService.getCohortEarlySupportAnalysis(req.user);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// @desc    Interact with role-aware AI campus assistant
// @route   POST /api/ai/chat or POST /api/ai/assistant
// @access  Private
const chatAssistantController = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid text query is required for AI consultation.'
      });
    }

    const user = req.user || {
      _id: 'anonymous',
      name: 'Guest User',
      role: 'student'
    };

    const result = await aiService.askCampusAssistant(user, query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Check health of AI microservice and fallback engine
// @route   GET /api/ai/status
// @access  Private
const getAiStatusController = async (req, res, next) => {
  try {
    const status = await aiService.getAiHealth();
    res.status(200).json({
      success: true,
      status
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger ML model retraining on benchmark dataset (Admin only)
// @route   POST /api/ai/ml/retrain
// @access  Private / Admin
const retrainModelController = async (req, res, next) => {
  try {
    const result = await aiService.triggerModelRetraining();
    res.status(200).json({
      success: true,
      message: 'ML Early-Support Classifier retrained and updated successfully.',
      result
    });
  } catch (err) {
    next(err);
  }
};

const ragService = require('../services/ragService');

// @desc    Query the RAG Academic Document Assistant
// @route   POST /api/ai/document-assistant/query
// @access  Private
const queryDocumentAssistantController = async (req, res, next) => {
  try {
    const { query, subjectCode, documentId } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid text query is required for document consultation.'
      });
    }

    const result = await ragService.queryDocumentAssistant(
      req.user,
      query,
      subjectCode,
      documentId
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// @desc    Get RAG vector store operational status
// @route   GET /api/ai/rag/status
// @access  Private
const getRagStatusController = async (req, res, next) => {
  try {
    const status = await ragService.getRagStatus();
    res.status(200).json({
      success: true,
      status
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAcademicInsightsController,
  getRecommendationsController,
  getEarlySupportCohortController,
  chatAssistantController,
  getAiStatusController,
  retrainModelController,
  queryDocumentAssistantController,
  getRagStatusController
};
