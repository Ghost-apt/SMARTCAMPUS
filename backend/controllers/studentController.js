const { User, StudentProfile } = require('../models/CampusModels');

// @desc    List all students with search, filters & pagination
// @route   GET /api/students
// @access  Private / Faculty, Admin
const getStudents = async (req, res, next) => {
  try {
    const { search, department, semester, page = 1, limit = 20 } = req.query;
    const query = { role: 'student' };

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Fetch linked profiles
    const userIds = students.map((s) => s._id);
    const profiles = await StudentProfile.find({ user: { $in: userIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const studentsWithProfiles = students.map((student) => {
      const studentObj = student.toObject();
      studentObj.profile = profileMap[student._id.toString()] || null;
      return studentObj;
    });

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      students: studentsWithProfiles
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student details
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const profile = await StudentProfile.findOne({ user: student._id }).populate('enrolledCourses').populate('enrolledSubjects');

    res.status(200).json({
      success: true,
      student,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create student account & profile (Admin only)
// @route   POST /api/students
// @access  Private / Admin
const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, department, studentId, rollNumber, semester, batch, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const assignedRoll = studentId || rollNumber || `BCA-${Date.now().toString().slice(-4)}`;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'student',
      department: department || 'Computer Applications',
      studentId: assignedRoll,
      phone: phone || '',
      accountStatus: 'active'
    });

    const profile = await StudentProfile.create({
      user: user._id,
      rollNumber: assignedRoll,
      department: department || 'Computer Applications',
      course: 'BCA',
      semester: semester || 5,
      batch: batch || '2023-2026',
      cgpa: 8.5,
      attendancePercentage: 88.0
    });

    res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
      student: user,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student details
// @route   PATCH /api/students/:id
// @access  Private / Admin, Faculty
const updateStudent = async (req, res, next) => {
  try {
    const { name, department, studentId, phone, accountStatus, semester, cgpa, attendancePercentage } = req.body;
    const userUpdates = {};
    if (name) userUpdates.name = name.trim();
    if (department) userUpdates.department = department;
    if (studentId) userUpdates.studentId = studentId;
    if (phone !== undefined) userUpdates.phone = phone;
    if (accountStatus) userUpdates.accountStatus = accountStatus;

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      userUpdates,
      { returnDocument: 'after' }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const profileUpdates = {};
    if (department) profileUpdates.department = department;
    if (studentId) profileUpdates.rollNumber = studentId;
    if (semester !== undefined) profileUpdates.semester = semester;
    if (cgpa !== undefined) profileUpdates.cgpa = cgpa;
    if (attendancePercentage !== undefined) profileUpdates.attendancePercentage = attendancePercentage;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: student._id },
      profileUpdates,
      { returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      student,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Deactivate student
// @route   DELETE /api/students/:id
// @access  Private / Admin
const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { accountStatus: 'inactive', isActive: false },
      { returnDocument: 'after' }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Student account has been deactivated.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
