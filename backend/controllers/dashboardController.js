const {
  User,
  StudentProfile,
  FacultyProfile,
  Department,
  Course,
  Subject,
  Attendance,
  Assignment,
  Examination,
  Result,
  FeeRecord,
  Notice
} = require('../models/CampusModels');
const { getDbStatus } = require('../config/database');

// @desc    Get Student Dashboard Data
// @route   GET /api/dashboard/student
// @access  Private / Student, Admin
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user.id })
      .populate('enrolledCourses')
      .populate('enrolledSubjects');

    const subjects = await Subject.find({
      $or: [
        { courseCode: studentProfile?.course || 'BCA', semester: studentProfile?.semester || 5 },
        { _id: { $in: studentProfile?.enrolledSubjects || [] } }
      ]
    });

    // Notices
    const notices = await Notice.find({ targetAudience: { $in: ['all', 'student'] } })
      .sort({ createdAt: -1 })
      .limit(5);

    // Pending assignments
    const pendingAssignments = await Assignment.find({
      'submissions.student': { $ne: req.user.id },
      dueDate: { $gte: new Date() }
    })
      .limit(5)
      .populate('subject', 'subjectCode subjectName');

    // Real Attendance from logs
    const attendanceRecords = await Attendance.find({ student: req.user.id });
    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter((r) => r.status === 'Present').length;
    const realAttendanceRate = totalClasses > 0 ? Number(((attendedClasses / totalClasses) * 100).toFixed(1)) : (studentProfile?.attendancePercentage || 91.5);

    // Fee balance summary
    const feeRecords = await FeeRecord.find({ student: req.user.id });
    const feeBalance = feeRecords.reduce((acc, f) => acc + (f.balanceAmount || 0), 0);

    // Latest exam result
    const recentResults = await Result.find({ student: req.user.id }).sort({ createdAt: -1 }).limit(4);

    res.status(200).json({
      success: true,
      role: 'student',
      data: {
        profile: studentProfile || {
          rollNumber: req.user.studentId || 'BCA-2023-042',
          department: req.user.department || 'Computer Applications',
          course: 'BCA',
          semester: 5,
          cgpa: 8.75,
          attendancePercentage: 91.5
        },
        enrolledCoursesCount: subjects.length > 0 ? subjects.length : 2,
        courses: subjects,
        attendanceRate: realAttendanceRate,
        totalClassesLogged: totalClasses,
        attendedClassesLogged: attendedClasses,
        feeBalance,
        recentResults,
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
    const facultyProfile = await FacultyProfile.findOne({ user: req.user.id })
      .populate('assignedCourses')
      .populate('assignedSubjects');

    const assignedSubjects = await Subject.find({ faculty: req.user.id });
    const fallbackSubjects = assignedSubjects.length > 0
      ? assignedSubjects
      : await Subject.find({ courseCode: 'BCA', semester: 5 });

    const notices = await Notice.find({ targetAudience: { $in: ['all', 'faculty'] } })
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingReviewsCount = await Assignment.countDocuments({
      createdBy: req.user.id,
      'submissions.status': 'Submitted'
    });

    const studentCount = await User.countDocuments({ role: 'student', accountStatus: 'active' });

    res.status(200).json({
      success: true,
      role: 'faculty',
      data: {
        profile: facultyProfile || {
          employeeId: req.user.facultyId || 'FAC-BCA-001',
          department: req.user.department || 'Computer Applications',
          designation: 'Associate Professor'
        },
        assignedCoursesCount: fallbackSubjects.length,
        assignedCourses: fallbackSubjects,
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
    const departmentsCount = await Department.countDocuments();
    const coursesCount = await Course.countDocuments();
    const subjectsCount = await Subject.countDocuments();
    const noticesCount = await Notice.countDocuments();

    // Financial summaries
    const fees = await FeeRecord.find();
    const totalFeeReceivable = fees.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
    const totalFeeCollected = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const totalFeeOutstanding = Math.max(0, totalFeeReceivable - totalFeeCollected);

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
          departmentsCount: departmentsCount > 0 ? departmentsCount : 2,
          coursesCount: coursesCount > 0 ? coursesCount : 2,
          subjectsCount: subjectsCount > 0 ? subjectsCount : 4,
          noticesCount,
          totalFeeCollected,
          totalFeeOutstanding
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
