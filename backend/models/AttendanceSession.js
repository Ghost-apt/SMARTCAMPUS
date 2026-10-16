const mongoose = require('mongoose');

// ==========================================
// ATTENDANCE SESSION (QR & CODE) SCHEMA & MODEL
// ==========================================
const attendanceSessionSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    courseCode: {
      type: String,
      default: 'BCA'
    },
    semester: {
      type: Number,
      default: 5
    },
    section: {
      type: String,
      default: 'A'
    },
    date: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Expired'],
      default: 'Active'
    },
    attendees: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        studentName: String,
        rollNumber: String,
        scannedAt: {
          type: Date,
          default: Date.now
        },
        method: {
          type: String,
          enum: ['QR', 'Code'],
          default: 'QR'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

attendanceSessionSchema.index({ faculty: 1, status: 1 });

const AttendanceSession = mongoose.models.AttendanceSession || mongoose.model('AttendanceSession', attendanceSessionSchema);

module.exports = AttendanceSession;
