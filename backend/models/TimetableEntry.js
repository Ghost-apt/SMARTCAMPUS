const mongoose = require('mongoose');

// ==========================================
// TIMETABLE SCHEMA & MODEL
// ==========================================
const timetableSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      default: 'BCA'
    },
    semester: {
      type: Number,
      required: true,
      default: 5
    },
    section: {
      type: String,
      default: 'A'
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    subjectCode: {
      type: String,
      default: ''
    },
    subjectName: {
      type: String,
      default: ''
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    facultyName: {
      type: String,
      default: ''
    },
    room: {
      type: String,
      required: true,
      default: 'Lab 304'
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    startTime: {
      type: String,
      required: true // e.g. "09:30"
    },
    endTime: {
      type: String,
      required: true // e.g. "11:00"
    }
  },
  {
    timestamps: true
  }
);

// Indexes to speed up conflict checking
timetableSchema.index({ faculty: 1, day: 1, startTime: 1 });
timetableSchema.index({ room: 1, day: 1, startTime: 1 });
timetableSchema.index({ courseCode: 1, semester: 1, section: 1, day: 1, startTime: 1 });

const TimetableEntry = mongoose.models.TimetableEntry || mongoose.model('TimetableEntry', timetableSchema);

module.exports = TimetableEntry;
