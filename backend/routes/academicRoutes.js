const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Course, Notice, Attendance, Assignment, AIQueryLog } = require('../models/CampusModels');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { getDbStatus } = require('../config/database');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// ==========================================
// COURSES
// ==========================================
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.find().populate('faculty', 'name email department');
    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (err) {
    next(err);
  }
});

router.post('/courses', authenticate, authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const { courseCode, courseName, department, semester, credits, description } = req.body;
    const course = await Course.create({
      courseCode: courseCode.toUpperCase().trim(),
      courseName: courseName.trim(),
      department: department || 'BCA',
      semester: semester || 1,
      credits: credits || 4,
      description: description || '',
      faculty: req.user.id
    });
    res.status(201).json({ success: true, message: 'Course created successfully', course });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// NOTICES
// ==========================================
router.get('/notices', async (req, res, next) => {
  try {
    const audience = req.query.audience;
    const filter = audience && audience !== 'all' ? { targetAudience: { $in: ['all', audience] } } : {};
    const notices = await Notice.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notices.length, notices });
  } catch (err) {
    next(err);
  }
});

router.post('/notices', authenticate, authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const { title, content, targetAudience, priority, department } = req.body;
    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      targetAudience: targetAudience || 'all',
      priority: priority || 'Medium',
      department: department || 'All',
      author: req.user.id
    });
    res.status(201).json({ success: true, message: 'Notice posted successfully', notice });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ATTENDANCE
// ==========================================
router.get('/attendance/summary', authenticate, async (req, res, next) => {
  try {
    const studentId = req.query.studentId && req.user.role === 'admin' ? req.query.studentId : req.user.id;
    const records = await Attendance.find({ student: studentId }).populate('course', 'courseCode courseName');
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 100;

    res.status(200).json({
      success: true,
      totalClasses: total,
      presentClasses: present,
      percentage,
      records
    });
  } catch (err) {
    next(err);
  }
});

router.post('/attendance/mark', authenticate, authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const { courseId, attendanceList, date } = req.body;
    if (!courseId || !Array.isArray(attendanceList)) {
      return res.status(400).json({
        success: false,
        message: 'courseId and an array of attendanceList are required.'
      });
    }

    const records = await Promise.all(
      attendanceList.map((item) =>
        Attendance.findOneAndUpdate(
          {
            course: courseId,
            student: item.studentId,
            date: date ? new Date(date) : new Date().setHours(0, 0, 0, 0)
          },
          {
            course: courseId,
            student: item.studentId,
            date: date ? new Date(date) : new Date().setHours(0, 0, 0, 0),
            status: item.status || 'Present',
            markedBy: req.user.id,
            remarks: item.remarks || ''
          },
          { upsert: true, returnDocument: 'after' }
        )
      )
    );

    res.status(200).json({
      success: true,
      message: `Attendance recorded for ${records.length} students.`,
      records
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ASSIGNMENTS
// ==========================================
router.get('/assignments', authenticate, async (req, res, next) => {
  try {
    const assignments = await Assignment.find()
      .populate('course', 'courseCode courseName')
      .populate('createdBy', 'name email');
    res.status(200).json({ success: true, count: assignments.length, assignments });
  } catch (err) {
    next(err);
  }
});

router.post('/assignments', authenticate, authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const { courseId, title, description, dueDate, totalMarks } = req.body;
    const assignment = await Assignment.create({
      course: courseId,
      title: title.trim(),
      description: description || '',
      dueDate: new Date(dueDate),
      totalMarks: totalMarks || 100,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, message: 'Assignment created successfully', assignment });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// AI ASSISTANT CHAT GATEWAY
// ==========================================
router.post('/ai/chat', async (req, res, next) => {
  try {
    const { query, category } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A query string is required for AI support.'
      });
    }

    let aiResponse = '';
    let source = 'fastapi-ai';

    // 1. Try forwarding to Python FastAPI AI service
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/chat`,
        { query: query.trim(), category: category || 'General' },
        { timeout: 3000 }
      );
      aiResponse = response.data.response || response.data.reply;
    } catch (aiErr) {
      // 2. Intelligent local campus rule-based fallback
      source = 'rule-fallback';
      const q = query.toLowerCase();

      if (q.includes('attendance') || q.includes('absent') || q.includes('leave')) {
        aiResponse = 'SmartCampus Policy: Students must maintain at least 75% attendance in each course for final examination clearance. You can inspect your real-time attendance records in your Student Dashboard.';
      } else if (q.includes('exam') || q.includes('timetable') || q.includes('schedule') || q.includes('date')) {
        aiResponse = 'Semester Examinations: Examination timetables and seating charts are published in the Campus Notices section approximately 3 weeks prior to exam commencement.';
      } else if (q.includes('fee') || q.includes('payment') || q.includes('dues') || q.includes('receipt')) {
        aiResponse = 'Fee Payment: Semester fee payments can be settled online or at the University Accounts Desk (Administrative Wing, Ground Floor) during office hours (9:30 AM – 3:30 PM).';
      } else if (q.includes('bca') || q.includes('syllabus') || q.includes('course') || q.includes('curriculum')) {
        aiResponse = 'BCA Program Overview: The BCA syllabus includes Web Development, Database Management, Python & AI Systems, and a final-year Capstone Major Project.';
      } else if (q.includes('faculty') || q.includes('hod') || q.includes('teacher') || q.includes('mentor')) {
        aiResponse = 'Faculty Consultation: Faculty members are available for mentorship during their posted office hours. Specific contact details and office rooms can be viewed under the Courses directory.';
      } else {
        aiResponse = `Hello! I am your SmartCampus AI Assistant. I can assist you with course information, timetable details, attendance criteria, and university notices. How can I help you today?`;
      }
    }

    // Log query in MongoDB if connected
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      await AIQueryLog.create({
        user: req.user ? req.user.id : null,
        query: query.trim(),
        response: aiResponse,
        category: category || 'General',
        source
      }).catch((e) => console.warn('Could not log AI query:', e.message));
    }

    res.status(200).json({
      success: true,
      query: query.trim(),
      response: aiResponse,
      source
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

