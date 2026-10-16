const mongoose = require('mongoose');

// ==========================================
// STUDENT PROFILE SCHEMA & MODEL
// ==========================================
const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      required: [true, 'Department is required (e.g. BCA, CSE, IT)'],
      trim: true,
      default: 'Computer Applications'
    },
    course: {
      type: String,
      default: 'BCA'
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      default: 1
    },
    batch: {
      type: String,
      default: '2023-2026',
      trim: true
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    enrolledSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      }
    ],
    cgpa: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 10
    },
    attendancePercentage: {
      type: Number,
      default: 85.0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

studentProfileSchema.index({ department: 1, semester: 1 });

const StudentProfile = mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
