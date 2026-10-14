const jwt = require('jsonwebtoken');
const { User, StudentProfile, FacultyProfile } = require('../models/CampusModels');

const JWT_SECRET = process.env.JWT_SECRET || 'smartcampus_jwt_secret_dev_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user);

  // Set secure HttpOnly cookie for session security
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      facultyId: user.facultyId,
      avatar: user.avatar,
      accountStatus: user.accountStatus
    }
  });
};

// @desc    Register a new student or faculty account
// @route   POST /api/auth/register
// @access  Public (Admin registration restricted)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, rollNumber, employeeId, studentId, facultyId, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const assignedRole = role || 'student';
    const sId = studentId || rollNumber || (assignedRole === 'student' ? `BCA-${Date.now().toString().slice(-4)}` : '');
    const fId = facultyId || employeeId || (assignedRole === 'faculty' ? `FAC-${Date.now().toString().slice(-4)}` : '');
    const dept = department || (assignedRole === 'faculty' ? 'Computer Applications' : 'BCA');

    const newUser = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: dept,
      studentId: sId,
      facultyId: fId,
      phone: phone || '',
      accountStatus: 'active'
    });

    // Create linked profile
    if (assignedRole === 'student') {
      await StudentProfile.create({
        user: newUser._id,
        rollNumber: sId,
        department: dept,
        semester: 1
      }).catch((e) => console.warn('StudentProfile creation note:', e.message));
    } else if (assignedRole === 'faculty') {
      await FacultyProfile.create({
        user: newUser._id,
        employeeId: fId,
        department: dept,
        designation: 'Assistant Professor'
      }).catch((e) => console.warn('FacultyProfile creation note:', e.message));
    }

    sendTokenResponse(newUser, 201, res, 'Registration successful. Welcome to SmartCampus AI!');
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & return token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.accountStatus && user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.accountStatus}. Please contact the university administrator.`
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user & clear session cookie
// @route   POST /api/auth/logout
// @access  Public / Authenticated
const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// @desc    Get current authenticated user info
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id }).populate('enrolledCourses');
    } else if (user.role === 'faculty') {
      profile = await FacultyProfile.findOne({ user: user._id }).populate('assignedCourses');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        facultyId: user.facultyId,
        avatar: user.avatar,
        phone: user.phone,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt
      },
      profile
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};

