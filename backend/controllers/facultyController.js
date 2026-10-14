const { User, FacultyProfile } = require('../models/CampusModels');

// @desc    List all faculty members
// @route   GET /api/faculty
// @access  Private
const getFaculty = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const query = { role: 'faculty' };

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } }
      ];
    }

    const faculty = await User.find(query).select('-password').sort({ name: 1 });
    const userIds = faculty.map((f) => f._id);
    const profiles = await FacultyProfile.find({ user: { $in: userIds } }).populate('assignedCourses').populate('assignedSubjects');

    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const facultyWithProfiles = faculty.map((f) => {
      const obj = f.toObject();
      obj.profile = profileMap[f._id.toString()] || null;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: facultyWithProfiles.length,
      faculty: facultyWithProfiles
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get faculty details
// @route   GET /api/faculty/:id
// @access  Private
const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await User.findOne({ _id: req.params.id, role: 'faculty' }).select('-password');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    const profile = await FacultyProfile.findOne({ user: faculty._id }).populate('assignedCourses').populate('assignedSubjects');

    res.status(200).json({
      success: true,
      faculty,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create faculty member (Admin only)
// @route   POST /api/faculty
// @access  Private / Admin
const createFaculty = async (req, res, next) => {
  try {
    const { name, email, password, department, facultyId, employeeId, designation, officeRoom, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const assignedId = facultyId || employeeId || `FAC-${Date.now().toString().slice(-4)}`;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'faculty',
      department: department || 'Computer Applications',
      facultyId: assignedId,
      phone: phone || '',
      accountStatus: 'active'
    });

    const profile = await FacultyProfile.create({
      user: user._id,
      employeeId: assignedId,
      department: department || 'Computer Applications',
      designation: designation || 'Assistant Professor',
      officeRoom: officeRoom || 'Faculty Block A - Room 204'
    });

    res.status(201).json({
      success: true,
      message: 'Faculty member registered successfully.',
      faculty: user,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update faculty
// @route   PATCH /api/faculty/:id
// @access  Private / Admin
const updateFaculty = async (req, res, next) => {
  try {
    const { name, department, facultyId, designation, officeRoom, phone, accountStatus } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'faculty' },
      { name, department, facultyId, phone, accountStatus },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    const profile = await FacultyProfile.findOneAndUpdate(
      { user: user._id },
      { department, employeeId: facultyId, designation, officeRoom },
      { returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      message: 'Faculty profile updated successfully.',
      faculty: user,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Deactivate faculty
// @route   DELETE /api/faculty/:id
// @access  Private / Admin
const deleteFaculty = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'faculty' },
      { accountStatus: 'inactive', isActive: false },
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty account deactivated.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
};
