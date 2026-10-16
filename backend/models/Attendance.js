const mongoose = require('mongoose');

// ==========================================
// ATTENDANCE SCHEMA & MODEL
// ==========================================
const attendanceSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      default: 'Present'
    },
    semester: {
      type: Number,
      default: 5
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index on subject, student, date to avoid duplicate entries
attendanceSchema.index({ subject: 1, student: 1, date: 1 });
attendanceSchema.index({ course: 1, student: 1, date: 1 });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
