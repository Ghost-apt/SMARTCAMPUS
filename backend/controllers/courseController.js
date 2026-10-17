const { Course, Subject, User, StudentSyllabusProgress } = require('../models/CampusModels');

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

// --- SYLLABUS MANAGEMENT ---

// GET /api/subjects/:id/syllabus
const getSyllabus = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('faculty', 'name email department');
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const hasSyllabus = !!(
      subject.syllabus &&
      Array.isArray(subject.syllabus.units) &&
      subject.syllabus.units.length > 0
    );

    res.status(200).json({
      success: true,
      hasSyllabus,
      subjectId: subject._id,
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      courseCode: subject.courseCode,
      credits: subject.credits,
      semester: subject.semester,
      type: subject.type,
      faculty: subject.faculty,
      syllabus: hasSyllabus ? subject.syllabus : null
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/subjects/:id/syllabus
const updateSyllabus = async (req, res, next) => {
  try {
    const { syllabus } = req.body;
    if (!syllabus || !Array.isArray(syllabus.units)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid syllabus format. Units array is required.'
      });
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Role check: Faculty can only update their assigned subject; Admin can update any
    if (
      req.user.role === 'faculty' &&
      subject.faculty &&
      subject.faculty.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You may only publish or edit the syllabus for your assigned courses.'
      });
    }

    subject.syllabus = {
      academicYear: syllabus.academicYear || '2026-2027',
      objectives: Array.isArray(syllabus.objectives) ? syllabus.objectives.filter(Boolean) : [],
      units: syllabus.units.map((u, idx) => ({
        unitNumber: u.unitNumber || idx + 1,
        title: u.title || `Unit ${idx + 1}`,
        teachingHours: Number(u.teachingHours) || 8,
        topics: Array.isArray(u.topics)
          ? u.topics.filter(Boolean)
          : (typeof u.topics === 'string' ? u.topics.split('\n').map(t => t.trim()).filter(Boolean) : []),
        outcomes: Array.isArray(u.outcomes) ? u.outcomes.filter(Boolean) : []
      })),
      textbooks: Array.isArray(syllabus.textbooks)
        ? syllabus.textbooks.filter(b => b.title && b.author)
        : [],
      evaluationScheme: syllabus.evaluationScheme || {
        internalWeightage: 30,
        endSemWeightage: 70,
        hasPractical: subject.type === 'Practical'
      },
      syllabusFileUrl: syllabus.syllabusFileUrl || ''
    };

    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Course syllabus successfully published and updated.',
      syllabus: subject.syllabus
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/subjects/:id/progress (Student personal checklist)
const getStudentProgress = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const progress = await StudentSyllabusProgress.findOne({
      student: req.user._id,
      subject: req.params.id
    });

    const allTopics = [];
    if (subject.syllabus && Array.isArray(subject.syllabus.units)) {
      subject.syllabus.units.forEach((u) => {
        if (Array.isArray(u.topics)) {
          allTopics.push(...u.topics);
        }
      });
    }

    const completedTopics = progress?.completedTopics || [];
    const totalCount = allTopics.length;
    const completedCount = completedTopics.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    res.status(200).json({
      success: true,
      totalCount,
      completedCount,
      percentage,
      completedTopics,
      lastRevisedAt: progress?.lastRevisedAt || null
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/subjects/:id/progress/toggle
const toggleTopicProgress = async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid topic string is required.' });
    }

    const trimmedTopic = topic.trim();
    let progress = await StudentSyllabusProgress.findOne({
      student: req.user._id,
      subject: req.params.id
    });

    if (!progress) {
      progress = new StudentSyllabusProgress({
        student: req.user._id,
        subject: req.params.id,
        completedTopics: []
      });
    }

    const idx = progress.completedTopics.indexOf(trimmedTopic);
    let isCompleted = false;
    if (idx > -1) {
      progress.completedTopics.splice(idx, 1);
      isCompleted = false;
    } else {
      progress.completedTopics.push(trimmedTopic);
      isCompleted = true;
    }

    progress.lastRevisedAt = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      isCompleted,
      completedTopics: progress.completedTopics
    });
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
  updateSubject,
  getSyllabus,
  updateSyllabus,
  getStudentProgress,
  toggleTopicProgress
};


