const { Assignment, Subject, Course, User } = require('../models/CampusModels');

// @desc    List assignments (filtered by role)
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const { courseCode, semester, subjectId } = req.query;
    const query = {};

    if (courseCode) query.courseCode = courseCode;
    if (semester) query.semester = parseInt(semester, 10);
    if (subjectId) query.subject = subjectId;

    // If Faculty, can also see assignments created by them
    if (req.user.role === 'faculty' && !courseCode) {
      query.createdBy = req.user.id;
    }

    const assignments = await Assignment.find(query)
      .populate('subject', 'subjectCode subjectName')
      .populate('createdBy', 'name email department')
      .sort({ dueDate: 1 });

    // Privacy protection: If requester is a student, only include their own submission in the submissions array!
    const sanitized = assignments.map((a) => {
      const aObj = a.toObject();
      if (req.user.role === 'student') {
        aObj.mySubmission = aObj.submissions.find((s) => s.student.toString() === req.user.id) || null;
        // Do not expose other students' submissions!
        delete aObj.submissions;
      }
      return aObj;
    });

    res.status(200).json({
      success: true,
      count: sanitized.length,
      assignments: sanitized
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new assignment (Faculty only)
// @route   POST /api/assignments
// @access  Private / Faculty, Admin
const createAssignment = async (req, res, next) => {
  try {
    const { title, description, subjectId, courseCode, semester, dueDate, totalMarks } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Assignment title and dueDate are required.' });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description || '',
      subject: subjectId || null,
      courseCode: courseCode || 'BCA',
      semester: semester || 5,
      dueDate: new Date(dueDate),
      totalMarks: totalMarks || 100,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      assignment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit assignment response (Student only)
// @route   POST /api/assignments/:id/submit
// @access  Private / Student
const submitAssignment = async (req, res, next) => {
  try {
    const { content, fileUrl } = req.body;
    if (!content && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Please provide submission text content or file URL.' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (assignment.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'This assignment is closed for submissions.' });
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    // Check if student already submitted
    const existingIndex = assignment.submissions.findIndex((s) => s.student.toString() === req.user.id);

    const submissionData = {
      student: req.user.id,
      studentName: req.user.name,
      studentRollNumber: req.user.studentId || '',
      submittedAt: new Date(),
      content: content || '',
      fileUrl: fileUrl || '',
      status: isLate ? 'Late' : 'Submitted'
    };

    if (existingIndex > -1) {
      assignment.submissions[existingIndex] = submissionData;
    } else {
      assignment.submissions.push(submissionData);
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      message: isLate ? 'Assignment submitted (marked Late).' : 'Assignment submitted successfully!',
      submission: submissionData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Grade student submission (Faculty only)
// @route   PATCH /api/assignments/:id/grade
// @access  Private / Faculty, Admin
const gradeSubmission = async (req, res, next) => {
  try {
    const { studentId, marksObtained, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    if (marksObtained > assignment.totalMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks obtained (${marksObtained}) cannot exceed total marks (${assignment.totalMarks}).`
      });
    }

    const sub = assignment.submissions.find((s) => s.student.toString() === studentId);
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Submission not found for this student.' });
    }

    sub.marksObtained = marksObtained;
    sub.feedback = feedback || '';
    sub.status = 'Graded';

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully.',
      submission: sub
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission
};

