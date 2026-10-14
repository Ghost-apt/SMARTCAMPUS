const { Course, Subject, User } = require('../models/CampusModels');

// --- PROGRAMS / COURSES ---
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('faculty', 'name email');
    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (err) {
    next(err);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, department, durationYears, totalSemesters, description, faculty } = req.body;
    if (!courseCode || !courseName) {
      return res.status(400).json({ success: false, message: 'Course code and name are required.' });
    }

    const course = await Course.create({
      courseCode: courseCode.toUpperCase().trim(),
      courseName: courseName.trim(),
      department: department || 'Computer Applications',
      durationYears: durationYears || 3,
      totalSemesters: totalSemesters || 6,
      description: description || '',
      faculty
    });

    res.status(201).json({ success: true, message: 'Course created successfully.', course });
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.status(200).json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.status(200).json({ success: true, message: 'Course removed.' });
  } catch (err) {
    next(err);
  }
};

// --- SUBJECTS ---
const getSubjects = async (req, res, next) => {
  try {
    const { courseCode, semester, facultyId } = req.query;
    const query = {};
    if (courseCode) query.courseCode = courseCode;
    if (semester) query.semester = parseInt(semester, 10);
    if (facultyId) query.faculty = facultyId;

    const subjects = await Subject.find(query).populate('faculty', 'name email department');
    res.status(200).json({ success: true, count: subjects.length, subjects });
  } catch (err) {
    next(err);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, courseCode, department, semester, credits, type, faculty, description } = req.body;
    if (!subjectCode || !subjectName) {
      return res.status(400).json({ success: false, message: 'Subject code and name are required.' });
    }

    const subject = await Subject.create({
      subjectCode: subjectCode.toUpperCase().trim(),
      subjectName: subjectName.trim(),
      courseCode: courseCode || 'BCA',
      department: department || 'Computer Applications',
      semester: semester || 5,
      credits: credits || 4,
      type: type || 'Theory',
      faculty,
      description: description || ''
    });

    res.status(201).json({ success: true, message: 'Subject created successfully.', subject });
  } catch (err) {
    next(err);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
    res.status(200).json({ success: true, subject });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getSubjects,
  createSubject,
  updateSubject
};

