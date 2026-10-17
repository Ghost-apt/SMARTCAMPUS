const mongoose = require('mongoose');

// ==========================================
// STUDENT SYLLABUS PROGRESS SCHEMA & MODEL
// ==========================================
const studentSyllabusProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    completedTopics: [
      {
        type: String,
        trim: true
      }
    ],
    lastRevisedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee unique progress document per student per subject
studentSyllabusProgressSchema.index({ student: 1, subject: 1 }, { unique: true });

const StudentSyllabusProgress =
  mongoose.models.StudentSyllabusProgress ||
  mongoose.model('StudentSyllabusProgress', studentSyllabusProgressSchema);

module.exports = StudentSyllabusProgress;

