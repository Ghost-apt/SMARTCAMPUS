const { Examination, Result, Subject, User } = require('../models/CampusModels');

// Helper to determine grade based on percentage
const computeGrade = (obtained, max) => {
  const pct = (obtained / max) * 100;
  if (pct >= 90) return { grade: 'A+', status: 'Pass' };
  if (pct >= 80) return { grade: 'A', status: 'Pass' };
  if (pct >= 70) return { grade: 'B+', status: 'Pass' };
  if (pct >= 60) return { grade: 'B', status: 'Pass' };
  if (pct >= 50) return { grade: 'C', status: 'Pass' };
  if (pct >= 40) return { grade: 'D', status: 'Pass' };
  return { grade: 'F', status: 'Fail' };
};

// @desc    Get examinations
// @route   GET /api/examinations
// @access  Private
const getExaminations = async (req, res, next) => {
  try {
    const { semester, courseCode } = req.query;
    const query = {};
    if (semester) query.semester = parseInt(semester, 10);
    if (courseCode) query.courseCode = courseCode;

    const exams = await Examination.find(query).sort({ startDate: -1 });
    res.status(200).json({ success: true, count: exams.length, exams });
  } catch (err) {
    next(err);
  }
};

// @desc    Create examination schedule
// @route   POST /api/examinations
// @access  Private / Admin, Faculty
const createExamination = async (req, res, next) => {
  try {
    const { examName, courseCode, semester, academicYear, startDate, endDate, status } = req.body;
    if (!examName) return res.status(400).json({ success: false, message: 'Examination name is required.' });

    const exam = await Examination.create({
      examName: examName.trim(),
      courseCode: courseCode || 'BCA',
      semester: semester || 5,
      academicYear: academicYear || '2026-2027',
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: status || 'Scheduled'
    });

    res.status(201).json({ success: true, message: 'Examination scheduled successfully.', exam });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's own examination results
// @route   GET /api/results/my
// @access  Private / Student, Admin
const getMyResults = async (req, res, next) => {
  try {
    const studentId = req.query.studentId && ['admin', 'faculty'].includes(req.user.role)
      ? req.query.studentId
      : req.user.id;

    const results = await Result.find({ student: studentId })
      .populate('examination', 'examName academicYear semester')
      .populate('subject', 'subjectCode subjectName credits')
      .sort({ createdAt: -1 });

    const totalSubjects = results.length;
    const totalMarksObtained = results.reduce((acc, r) => acc + r.marksObtained, 0);
    const totalMaxMarks = results.reduce((acc, r) => acc + r.maxMarks, 0);
    const aggregatePercentage = totalMaxMarks > 0 ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
    const gpa = Number((aggregatePercentage / 9.5).toFixed(2)); // Standard 10-point scale conversion

    res.status(200).json({
      success: true,
      totalSubjects,
      aggregatePercentage,
      gpa,
      results
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record/Enter examination marks (Faculty / Admin)
// @route   POST /api/results
// @access  Private / Faculty, Admin
const enterResult = async (req, res, next) => {
  try {
    const { examinationId, examName, studentId, subjectId, subjectCode, subjectName, marksObtained, maxMarks, remarks } = req.body;

    if (!studentId || !subjectCode || marksObtained === undefined) {
      return res.status(400).json({ success: false, message: 'studentId, subjectCode, and marksObtained are required.' });
    }

    const max = maxMarks || 100;
    if (marksObtained > max || marksObtained < 0) {
      return res.status(400).json({
        success: false,
        message: `marksObtained (${marksObtained}) must be between 0 and maxMarks (${max}).`
      });
    }

    const { grade, status } = computeGrade(marksObtained, max);

    const result = await Result.findOneAndUpdate(
      {
        examination: examinationId || null,
        student: studentId,
        subjectCode
      },
      {
        examination: examinationId || null,
        examName: examName || 'Semester Examination',
        student: studentId,
        subject: subjectId || null,
        subjectCode,
        subjectName: subjectName || subjectCode,
        marksObtained,
        maxMarks: max,
        grade,
        status,
        evaluatedBy: req.user.id,
        remarks: remarks || ''
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.status(201).json({
      success: true,
      message: 'Examination mark evaluated and saved.',
      result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExaminations,
  createExamination,
  getMyResults,
  enterResult
};

