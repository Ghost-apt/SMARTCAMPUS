const { Resource, Subject, User } = require('../models/CampusModels');

// @desc    List study resources (filter by subject, category)
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res, next) => {
  try {
    const { subjectCode, category, search } = req.query;
    const query = {};

    if (subjectCode && subjectCode !== 'all') query.subjectCode = subjectCode;
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

// @desc    Upload / Register a new study resource (Faculty / Admin)
// @route   POST /api/resources
// @access  Private / Faculty, Admin
const createResource = async (req, res, next) => {
  try {
    const { title, description, subjectCode, subjectId, category, fileUrl, fileSize } = req.body;

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
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Study resource registered successfully.',
      resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private / Faculty, Admin
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });

    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this resource.' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Resource deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getResources,
  createResource,
  deleteResource
};

