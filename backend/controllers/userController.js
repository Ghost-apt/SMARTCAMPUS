const { User, StudentProfile, FacultyProfile } = require('../models/CampusModels');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id }).populate('enrolledCourses');
    } else if (user.role === 'faculty') {
      profile = await FacultyProfile.findOne({ user: user._id }).populate('assignedCourses');
    }

    res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user profile
// @route   PATCH /api/users/me
// @access  Private
const updateCurrentUserProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'phone', 'avatar', 'department'];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private / Admin
const getAllUsers = async (req, res, next) => {
  try {
    const roleFilter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(roleFilter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getAllUsers
};

