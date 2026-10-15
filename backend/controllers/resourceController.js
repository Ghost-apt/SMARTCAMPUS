const { Resource, Subject, User } = require('../models/CampusModels');
const ragService = require('../services/ragService');

// @desc    List study resources (filter by subject, category)
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res, next) => {
  try {
    const { subjectCode, category, search } = req.query;
    const query = {};

    if (subjectCode && subjectCode !== 'all') query.subjectCode = subjectCode.toUpperCase();
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('subject', 'subjectCode subjectName')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload / Register a new study resource and trigger RAG vector indexing
// @route   POST /api/resources
// @access  Private / Faculty, Admin
const createResource = async (req, res, next) => {
  try {
    const { title, description, subjectCode, subjectId, category, fileUrl, fileSize, rawText } = req.body;

    if (!title || !subjectCode) {
      return res.status(400).json({ success: false, message: 'Resource title and subjectCode are required.' });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: description || '',
      subjectCode: subjectCode.toUpperCase().trim(),
      subject: subjectId || null,
      category: category || 'Lecture Notes',
      fileUrl: fileUrl || 'https://smartcampus.edu/resources/sample-handout.pdf',
      fileSize: fileSize || '2.4 MB',
      department: req.user.department || 'BCA',
      courseCode: 'BCA',
      semester: 5,
      ragStatus: 'Processing',
      extractedText: rawText || description || '',
      uploadedBy: req.user.id
    });

    // Trigger RAG ingestion
    try {
      const ingestRes = await ragService.ingestDocumentIntoRag(resource);
      resource.ragStatus = 'Indexed';
      resource.chunkCount = ingestRes.chunksIndexed;
      resource.indexedAt = new Date();
      await resource.save();
    } catch (ingestErr) {
      resource.ragStatus = 'Failed';
      resource.ragError = ingestErr.message;
      await resource.save();
    }

    res.status(201).json({
      success: true,
      message: 'Study resource registered and processed for RAG assistant successfully.',
      resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Re-index an existing study resource into the RAG vector store
// @route   POST /api/resources/:id/reindex
// @access  Private / Faculty, Admin
const reindexResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    resource.ragStatus = 'Processing';
    await resource.save();

    const result = await ragService.ingestDocumentIntoRag(resource);
    resource.ragStatus = 'Indexed';
    resource.chunkCount = result.chunksIndexed;
    resource.indexedAt = new Date();
    resource.ragError = '';
    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Document re-indexed into RAG vector store successfully.',
      chunksIndexed: result.chunksIndexed,
      resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get indexing status of a resource
// @route   GET /api/resources/:id/processing-status
// @access  Private
const getResourceStatus = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    res.status(200).json({
      success: true,
      resourceId: resource._id,
      title: resource.title,
      ragStatus: resource.ragStatus,
      chunkCount: resource.chunkCount,
      indexedAt: resource.indexedAt,
      ragError: resource.ragError
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource and purge its vectors from RAG store
// @route   DELETE /api/resources/:id
// @access  Private / Faculty, Admin
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this resource.' });
    }

    // Purge vectors from RAG store
    await ragService.deleteDocumentFromRag(resource._id.toString());

    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Resource and associated vector embeddings purged.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Query the Academic Document Assistant (RAG)
// @route   POST /api/ai/document-assistant/query or POST /api/resources/assistant/query
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

module.exports = {
  getResources,
  createResource,
  reindexResource,
  getResourceStatus,
  deleteResource,
  queryDocumentAssistantController
};
