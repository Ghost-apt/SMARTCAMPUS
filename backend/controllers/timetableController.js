const { TimetableEntry, Subject, User } = require('../models/CampusModels');

// Helper to check time overlaps (times formatted as "HH:MM")
const isTimeOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && endA > startB;
};

// @desc    Get timetable entries
// @route   GET /api/timetable
// @access  Private
const getTimetable = async (req, res, next) => {
  try {
    const { courseCode, semester, facultyId, day } = req.query;
    const query = {};

    if (courseCode) query.courseCode = courseCode;
    if (semester) query.semester = parseInt(semester, 10);
    if (facultyId) query.faculty = facultyId;
    if (day) query.day = day;

    // If role is student and no filter specified, default to course BCA sem 5
    if (req.user.role === 'student' && !courseCode) {
      query.courseCode = req.user.department === 'Computer Applications' || req.user.department === 'BCA' ? 'BCA' : req.user.department;
    }

    // If role is faculty and no filter, default to faculty's own schedule
    if (req.user.role === 'faculty' && !facultyId && !courseCode) {
      query.faculty = req.user.id;
    }

    const entries = await TimetableEntry.find(query)
      .populate('subject', 'subjectCode subjectName credits type')
      .populate('faculty', 'name email')
      .sort({ day: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      entries
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create timetable entry with conflict validation
// @route   POST /api/timetable
// @access  Private / Admin
const createTimetableEntry = async (req, res, next) => {
  try {
    const { courseCode, semester, section, subjectId, facultyId, room, day, startTime, endTime } = req.body;

    if (!day || !startTime || !endTime || !room) {
      return res.status(400).json({ success: false, message: 'Day, startTime, endTime, and room are required.' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'startTime must be strictly before endTime.' });
    }

    // --- CONFLICT VALIDATION ---
    // 1. Check Room Conflict
    const roomConflicts = await TimetableEntry.find({ day, room });
    const hasRoomConflict = roomConflicts.some((slot) =>
      isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)
    );
    if (hasRoomConflict) {
      return res.status(409).json({
        success: false,
        message: `Conflict: Room '${room}' is already booked on ${day} between ${startTime} and ${endTime}.`
      });
    }

    // 2. Check Faculty Schedule Conflict
    if (facultyId) {
      const facultyConflicts = await TimetableEntry.find({ day, faculty: facultyId });
      const hasFacultyConflict = facultyConflicts.some((slot) =>
        isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)
      );
      if (hasFacultyConflict) {
        return res.status(409).json({
          success: false,
          message: `Conflict: Assigned faculty is already scheduled for another lecture on ${day} during this time.`
        });
      }
    }

    // 3. Check Class / Section Schedule Conflict
    const classConflicts = await TimetableEntry.find({
      courseCode: courseCode || 'BCA',
      semester: semester || 5,
      section: section || 'A',
      day
    });
    const hasClassConflict = classConflicts.some((slot) =>
      isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)
    );
    if (hasClassConflict) {
      return res.status(409).json({
        success: false,
        message: `Conflict: Class ${courseCode || 'BCA'} Semester ${semester || 5} Section ${section || 'A'} already has a scheduled lecture on ${day} during this time.`
      });
    }

    // Fetch subject & faculty names if available
    let subjectName = '';
    let subjectCode = '';
    if (subjectId) {
      const sub = await Subject.findById(subjectId);
      if (sub) {
        subjectName = sub.subjectName;
        subjectCode = sub.subjectCode;
      }
    }

    let facultyName = '';
    if (facultyId) {
      const fac = await User.findById(facultyId);
      if (fac) facultyName = fac.name;
    }

    const entry = await TimetableEntry.create({
      courseCode: courseCode || 'BCA',
      semester: semester || 5,
      section: section || 'A',
      subject: subjectId || null,
      subjectCode,
      subjectName,
      faculty: facultyId || null,
      facultyName,
      room,
      day,
      startTime,
      endTime
    });

    res.status(201).json({
      success: true,
      message: 'Timetable entry scheduled without conflicts.',
      entry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private / Admin
const deleteTimetableEntry = async (req, res, next) => {
  try {
    const entry = await TimetableEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    res.status(200).json({ success: true, message: 'Schedule entry removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTimetable,
  createTimetableEntry,
  deleteTimetableEntry
};
