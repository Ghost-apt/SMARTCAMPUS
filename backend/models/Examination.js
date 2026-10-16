const mongoose = require('mongoose');

// ==========================================
// EXAMINATION SCHEMA & MODEL
// ==========================================
const examinationSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: [true, 'Examination name is required'],
      trim: true
    },
    courseCode: {
      type: String,
      default: 'BCA'
    },
    semester: {
      type: Number,
      required: true,
      default: 5
    },
    academicYear: {
      type: String,
      default: '2026-2027'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed'],
      default: 'Scheduled'
    }
  },
  {
    timestamps: true
  }
);

const Examination = mongoose.models.Examination || mongoose.model('Examination', examinationSchema);

module.exports = Examination;
