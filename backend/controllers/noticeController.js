const { Notice, User } = require('../models/CampusModels');

// @desc    Get notices (filtered by targetAudience and category)
// @route   GET /api/notices
// @access  Public / Authenticated
const getNotices = async (req, res, next) => {
  try {
    const { audience, category, priority } = req.query;
    const query = {};

    if (audience && audience !== 'all') {
      query.targetAudience = { $in: ['all', audience] };
    }
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const notices = await Notice.find(query).populate('author', 'name role department').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a campus notice
// @route   POST /api/notices
// @access  Private / Faculty, Admin
const createNotice = async (req, res, next) => {
  try {
    const { title, content, targetAudience, department, category, priority, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Notice title and content are required.' });
    }

    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      targetAudience: targetAudience || 'all',
      department: department || 'All',
      category: category || 'Academic',
      priority: priority || 'Medium',
      expiresAt: expiresAt || null,
      author: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Notice published successfully.',
      notice
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private / Admin, Author Faculty
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });

    // Authorization check: Admin or author
    if (req.user.role !== 'admin' && notice.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this notice.' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notice removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice
};
