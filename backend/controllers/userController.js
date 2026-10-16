const fs = require('fs');
const path = require('path');
const { User, StudentProfile, FacultyProfile, DEFAULT_AVATAR_URL } = require('../models/CampusModels');
const { verifyImageSignature } = require('../middleware/uploadMiddleware');

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

// @desc    Upload or change current user profile picture
// @route   POST /api/users/me/profile-picture or PATCH /api/users/me/profile-picture
// @access  Private
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.'
      });
    }

    // Verify true image signature / magic numbers
    const isValidSignature = await verifyImageSignature(req.file.path);
    if (!isValidSignature) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid image content. File signature does not match a valid JPEG, PNG, or WebP image.'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safely delete previous local uploaded avatar file if one existed
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldRelative = user.avatar.replace(/^\//, '');
      const oldFullPath = path.join(__dirname, '..', oldRelative);
      if (fs.existsSync(oldFullPath)) {
        try {
          fs.unlinkSync(oldFullPath);
        } catch (e) {
          console.warn('[Avatar Cleanup Note]:', e.message);
        }
      }
    }

    // Save relative URL path for portable serving
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      avatarUrl: user.avatar,
      user
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // ignore
      }
    }
    next(err);
  }
};

// @desc    Remove current user profile picture (reset to default)
// @route   DELETE /api/users/me/profile-picture
// @access  Private
const removeProfilePicture = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safely delete previous local uploaded avatar file if one existed
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldRelative = user.avatar.replace(/^\//, '');
      const oldFullPath = path.join(__dirname, '..', oldRelative);
      if (fs.existsSync(oldFullPath)) {
        try {
          fs.unlinkSync(oldFullPath);
        } catch (e) {
          console.warn('[Avatar Cleanup Note]:', e.message);
        }
      }
    }

    user.avatar = DEFAULT_AVATAR_URL;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully',
      avatarUrl: DEFAULT_AVATAR_URL,
      user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadProfilePicture,
  removeProfilePicture,
  getAllUsers
};


