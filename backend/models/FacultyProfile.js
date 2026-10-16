const mongoose = require('mongoose');

// ==========================================
// FACULTY PROFILE SCHEMA & MODEL
// ==========================================
const facultyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      default: 'Computer Applications'
    },
    designation: {
      type: String,
      default: 'Assistant Professor',
      trim: true
    },
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      }
    ],
    officeRoom: {
      type: String,
      default: 'Faculty Block A - Room 204'
    }
  },
  {
    timestamps: true
  }
);

facultyProfileSchema.index({ department: 1 });

const FacultyProfile = mongoose.models.FacultyProfile || mongoose.model('FacultyProfile', facultyProfileSchema);

module.exports = FacultyProfile;
