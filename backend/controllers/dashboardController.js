const {
  User,
  StudentProfile,
  FacultyProfile,
  Course,
  Attendance,
  Assignment,
  Notice
} = require('../models/CampusModels');
const { getDbStatus } = require('../config/database');

// @desc    Get Student Dashboard Data
// @route   GET /api/dashboard/student
// @access  Private / Student, Admin
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user.id }).populate('enrolledCourses');
    const courses = studentProfile ? studentProfile.enrolledCourses : [];
    
    // Fetch recent notices for students
    const notices = await Notice.find({ targetAudience: { $in: ['all', 'student'] } })
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch pending assignments
    const pendingAssignments = await Assignment.find({
      'submissions.student': { $ne: req.user.id },
      dueDate: { $gte: new Date() }
    })
      .limit(5)
      .populate('course', 'courseCode courseName');

    // Attendance calculation
    const attendanceRecords = await Attendance.find({ student: req.user.id });
    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter((r) => r.status === 'Present').length;
    const realAttendanceRate = totalClasses > 0 ? Number(((attendedClasses / totalClasses) * 100).toFixed(1)) : null;

    res.status(200).json({
      success: true,
      role: 'student',
      data: {
        profile: studentProfile || {
          rollNumber: req.user.studentId || 'BCA-STUDENT',
          department: req.user.department || 'BCA',
          semester: 5,
          cgpa: 8.5,
          attendancePercentage: 88.0
        },
        enrolledCoursesCount: courses.length,
        courses,
        attendanceRate: realAttendanceRate !== null ? realAttendanceRate : (studentProfile ? studentProfile.attendancePercentage : 88.0),
        totalClassesLogged: totalClasses,
        attendedClassesLogged: attendedClasses,
        recentNotices: notices,
        pendingAssignments
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Faculty Dashboard Data
// @route   GET /api/dashboard/faculty
// @access  Private / Faculty, Admin
const getFacultyDashboard = async (req, res, next) => {
  try {
    const facultyProfile = await FacultyProfile.findOne({ user: req.user.id }).populate('assignedCourses');
    const assignedCourses = facultyProfile ? facultyProfile.assignedCourses : [];

    // Notices
    const notices = await Notice.find({ targetAudience: { $in: ['all', 'faculty'] } })
      .sort({ createdAt: -1 })
      .limit(5);

    // Pending reviews
    const pendingReviewsCount = await Assignment.countDocuments({
      createdBy: req.user.id,
      'submissions.status': 'Submitted'
    });

    // Enrolled students in faculty courses
    const studentCount = await StudentProfile.countDocuments({
      enrolledCourses: { $in: assignedCourses.map((c) => c._id) }
    });

    res.status(200).json({
      success: true,
      role: 'faculty',
      data: {
        profile: facultyProfile || {
          employeeId: req.user.facultyId || 'FAC-DEFAULT',
          department: req.user.department || 'Computer Applications',
          designation: 'Assistant Professor'
        },
        assignedCoursesCount: assignedCourses.length,
        assignedCourses,
        totalEnrolledStudents: studentCount,
        pendingReviewsCount,
        recentNotices: notices
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Admin Dashboard Data
// @route   GET /api/dashboard/admin
// @access  Private / Admin
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const coursesCount = await Course.countDocuments();
    const noticesCount = await Notice.countDocuments();

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(8);

    const dbStatus = getDbStatus();

    res.status(200).json({
      success: true,
      role: 'admin',
      data: {
        metrics: {
          totalUsers,
          studentsCount,
          facultyCount,
          adminCount,
          coursesCount,
          noticesCount
        },
        recentUsers,
        systemStatus: {
          uptimeSeconds: Math.floor(process.uptime()),
          uptimeFormatted: `${Math.floor(process.uptime() / 60)} minutes`,
          database: dbStatus
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentDashboard,
  getFacultyDashboard,
  getAdminDashboard
};

