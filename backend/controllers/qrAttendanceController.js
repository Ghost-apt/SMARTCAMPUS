const crypto = require('crypto');
const QRCode = require('qrcode');
const {
  AttendanceSession,
  Attendance,
  Subject,
  StudentProfile,
  User,
  AuditLog
} = require('../models/CampusModels');

// @desc    Faculty creates an attendance session (generates QR & code)
// @route   POST /api/attendance/session/create
// @access  Private / Faculty, Admin
const createSession = async (req, res, next) => {
  try {
    const { subjectId, courseCode, semester, section, durationMinutes = 10 } = req.body;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'subjectId is required to start an attendance session.' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Generate secure short-lived token and manual entry code
    const qrToken = crypto.randomBytes(24).toString('hex');
    const sessionCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const duration = Math.max(1, Math.min(60, parseInt(durationMinutes, 10) || 10));
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const sessionDate = new Date();
    sessionDate.setHours(0, 0, 0, 0);

    const session = await AttendanceSession.create({
      sessionCode,
      qrToken,
      subject: subjectId,
      faculty: req.user.id,
      courseCode: courseCode || subject.courseCode || 'BCA',
      semester: semester || subject.semester || 5,
      section: section || 'A',
      date: sessionDate,
      expiresAt,
      status: 'Active',
      attendees: []
    });

    // Generate QR Code as base64 Data URL
    const qrPayload = JSON.stringify({
      sessionId: session._id,
      token: qrToken,
      code: sessionCode
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    // Log action in AuditLog
    await AuditLog.create({
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'CREATE_ATTENDANCE_SESSION',
      resourceType: 'AttendanceSession',
      resourceId: session._id.toString(),
      details: { subjectCode: subject.subjectCode, durationMinutes: duration, sessionCode }
    });

    res.status(201).json({
      success: true,
      message: `Attendance session active for ${duration} minutes.`,
      sessionId: session._id,
      session,
      qrDataUrl,
      qrCodeDataUrl: qrDataUrl,
      qrToken,
      sessionCode,
      expiresAt
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Student scans QR code or enters manual session code
// @route   POST /api/attendance/session/scan
// @access  Private / Student
const scanAttendance = async (req, res, next) => {
  try {
    const { qrToken, sessionCode } = req.body;

    if (!qrToken && !sessionCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a valid QR token or a 6-digit session code.'
      });
    }

    const query = {};
    if (qrToken) query.qrToken = qrToken.trim();
    else if (sessionCode) query.sessionCode = sessionCode.toUpperCase().trim();

    const session = await AttendanceSession.findOne(query).populate('subject', 'subjectCode subjectName');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Invalid attendance session or token.' });
    }

    // Check expiration
    if (new Date() > new Date(session.expiresAt) || session.status !== 'Active') {
      if (session.status === 'Active') {
        session.status = 'Expired';
        await session.save();
      }
      return res.status(400).json({
        success: false,
        message: 'Attendance session has expired or been closed by faculty.'
      });
    }

    const studentId = req.user.id;

    // Check duplicate scan in this session
    const alreadyScanned = session.attendees.some(
      (a) => a.student && a.student.toString() === studentId.toString()
    );

    if (alreadyScanned) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate submission: You have already checked in for this session.'
      });
    }

    // Record check-in in session attendees
    session.attendees.push({
      student: studentId,
      studentName: req.user.name,
      rollNumber: req.user.studentId || '',
      scannedAt: new Date(),
      method: qrToken ? 'QR' : 'Code'
    });
    await session.save();

    // Persist into permanent Attendance collection
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);

    await Attendance.findOneAndUpdate(
      {
        student: studentId,
        subject: session.subject._id || session.subject,
        date: sessionDate
      },
      {
        student: studentId,
        subject: session.subject._id || session.subject,
        date: sessionDate,
        status: 'Present',
        semester: session.semester || 5,
        markedBy: session.faculty,
        remarks: `Verified via ${qrToken ? 'QR Scan' : 'Manual Code'}`
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Recalculate student cumulative attendance percentage
    const allRecords = await Attendance.find({ student: studentId });
    const total = allRecords.length;
    const present = allRecords.filter((r) => r.status === 'Present').length;
    const pct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 100;
    await StudentProfile.findOneAndUpdate({ user: studentId }, { attendancePercentage: pct });

    // Audit Log
    await AuditLog.create({
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: 'student',
      action: 'QR_ATTENDANCE_CHECKIN',
      resourceType: 'AttendanceSession',
      resourceId: session._id.toString(),
      details: { subjectCode: session.subject?.subjectCode, method: qrToken ? 'QR' : 'Code' }
    });

    res.status(200).json({
      success: true,
      message: 'Attendance recorded and verified successfully!',
      subject: session.subject?.subjectCode || 'Class',
      scannedAt: new Date(),
      overallAttendance: pct,
      overallPercentage: pct
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Faculty checks live session status and attendee count
// @route   GET /api/attendance/session/:id/status
// @access  Private / Faculty, Admin
const getSessionStatus = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id)
      .populate('subject', 'subjectCode subjectName')
      .populate('faculty', 'name email');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found.' });
    }

    const isExpired = new Date() > new Date(session.expiresAt);
    if (isExpired && session.status === 'Active') {
      session.status = 'Expired';
      await session.save();
    }

    const remainingMs = Math.max(0, new Date(session.expiresAt).getTime() - Date.now());
    const remainingSeconds = Math.floor(remainingMs / 1000);

    const sessionObj = session.toObject();
    sessionObj.isActive = session.status === 'Active';

    res.status(200).json({
      success: true,
      status: session.status,
      sessionCode: session.sessionCode,
      attendeeCount: session.attendees.length,
      remainingSeconds,
      isExpired,
      attendees: session.attendees,
      session: sessionObj
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Faculty explicitly closes an attendance session
// @route   PATCH /api/attendance/session/:id/close
// @access  Private / Faculty, Admin
const closeSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found.' });
    }

    session.status = 'Closed';
    await session.save();

    await AuditLog.create({
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'CLOSE_ATTENDANCE_SESSION',
      resourceType: 'AttendanceSession',
      resourceId: session._id.toString(),
      details: { totalAttendees: session.attendees.length }
    });

    const sessionObj = session.toObject();
    sessionObj.isActive = false;

    res.status(200).json({
      success: true,
      message: `Session closed. Total attendees recorded: ${session.attendees.length}.`,
      session: sessionObj
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Faculty lists past and active attendance sessions
// @route   GET /api/attendance/session
// @access  Private / Faculty, Admin
const getFacultySessions = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { faculty: req.user.id };
    const sessions = await AttendanceSession.find(query)
      .populate('subject', 'subjectCode subjectName')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSession,
  scanAttendance,
  getSessionStatus,
  closeSession,
  getFacultySessions
};
