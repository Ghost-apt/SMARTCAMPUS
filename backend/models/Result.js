const mongoose = require('mongoose');

// ==========================================
// RESULT SCHEMA & MODEL
// ==========================================
const resultSchema = new mongoose.Schema(
  {
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: true
    },
    examName: {
      type: String,
      default: 'Semester Examination'
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    subjectCode: {
      type: String,
      required: true
    },
    subjectName: {
      type: String,
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100
    },
    grade: {
      type: String,
      default: 'A'
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: 'Pass'
    },
    evaluatedBy: {
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

resultSchema.index({ examination: 1, student: 1, subjectCode: 1 }, { unique: true });

const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);

module.exports = Result;
