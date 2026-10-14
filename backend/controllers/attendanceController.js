const { Attendance, Subject, Course, User, StudentProfile } = require('../models/CampusModels');

// @desc    Mark attendance for a class session
// @route   POST /api/attendance/mark
// @access  Private / Faculty, Admin
const markAttendance = async (req, res, next) => {
  try {
    const { subjectId, courseCode, semester, date, attendanceList } = req.body;
    // attendanceList: [{ studentId, status: 'Present'|'Absent'|'Late'|'Excused', remarks }]

    if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
      return res.status(400).json({ success: false, message: 'attendanceList array with student records is required.' });
    }

    const sessionDate = date ? new Date(date) : new Date();
    // Normalize to start of day
    sessionDate.setHours(0, 0, 0, 0);

    const savedRecords = await Promise.all(
      attendanceList.map(async (item) => {
        const query = {
          student: item.studentId,
          date: sessionDate
        };
        if (subjectId) query.subject = subjectId;

        const update = {
          student: item.studentId,
          subject: subjectId || null,
          date: sessionDate,
          status: item.status || 'Present',
          semester: semester || 5,
          markedBy: req.user.id,
          remarks: item.remarks || ''
        };

        return Attendance.findOneAndUpdate(query, update, {
          upsert: true,
          returnDocument: 'after'
        });
      })
    );

    // Update overall attendance percentage for affected students
    for (const item of attendanceList) {
      const records = await Attendance.find({ student: item.studentId });
      const total = records.length;
      const attended = records.filter((r) => r.status === 'Present').length;
      const pct = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100;
      await StudentProfile.findOneAndUpdate({ user: item.studentId }, { attendancePercentage: pct });
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${savedRecords.length} student(s).`,
      count: savedRecords.length,
      records: savedRecords
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's own attendance with subject-wise breakdown
// @route   GET /api/attendance/student
// @access  Private / Student, Admin
const getStudentAttendance = async (req, res, next) => {
  try {
    const studentId = req.query.studentId && ['admin', 'faculty'].includes(req.user.role)
      ? req.query.studentId
      : req.user.id;

    const records = await Attendance.find({ student: studentId })
      .populate('subject', 'subjectCode subjectName credits')
      .sort({ date: -1 });

    const totalSessions = records.length;
    const presentSessions = records.filter((r) => r.status === 'Present').length;
    const overallPercentage = totalSessions > 0 ? Number(((presentSessions / totalSessions) * 100).toFixed(1)) : 100;

    // Subject-wise grouping
    const subjectMap = {};
    records.forEach((rec) => {
      const subCode = rec.subject?.subjectCode || 'General';
      const subName = rec.subject?.subjectName || 'Campus Lecture';

      if (!subjectMap[subCode]) {
        subjectMap[subCode] = {
          subjectCode: subCode,
          subjectName: subName,
          total: 0,
          present: 0,
          absent: 0,
          percentage: 100
        };
      }

      subjectMap[subCode].total += 1;
      if (rec.status === 'Present') subjectMap[subCode].present += 1;
      if (rec.status === 'Absent') subjectMap[subCode].absent += 1;
      subjectMap[subCode].percentage = Number(
        ((subjectMap[subCode].present / subjectMap[subCode].total) * 100).toFixed(1)
      );
    });

    res.status(200).json({
      success: true,
      overallPercentage,
      totalSessions,
      presentSessions,
      isEligible: overallPercentage >= 75,
      subjectBreakdown: Object.values(subjectMap),
      recentHistory: records.slice(0, 15)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get university attendance reports (Admin / Faculty)
// @route   GET /api/attendance/report
// @access  Private / Faculty, Admin
const getAttendanceReport = async (req, res, next) => {
  try {
    const { subjectId, date, semester } = req.query;
    const query = {};

    if (subjectId) query.subject = subjectId;
    if (semester) query.semester = parseInt(semester, 10);
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      query.date = d;
    }

    const records = await Attendance.find(query)
      .populate('student', 'name email studentId')
      .populate('subject', 'subjectCode subjectName')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getAttendanceReport
};

