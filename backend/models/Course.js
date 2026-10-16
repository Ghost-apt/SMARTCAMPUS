const mongoose = require('mongoose');

// ==========================================
// COURSE / PROGRAM SCHEMA & MODEL
// ==========================================
const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required (e.g. BCA, MCA)'],
      unique: true,
      uppercase: true,
      trim: true
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true
    },
    department: {
      type: String,
      required: true,
      default: 'Computer Applications'
    },
    durationYears: {
      type: Number,
      default: 3
    },
    totalSemesters: {
      type: Number,
      default: 6
    },
    credits: {
      type: Number,
      default: 120
    },
    description: {
      type: String,
      default: ''
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

module.exports = Course;
