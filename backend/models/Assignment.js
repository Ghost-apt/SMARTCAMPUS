const mongoose = require('mongoose');

// ==========================================
// ASSIGNMENT SCHEMA & MODEL
// ==========================================
const assignmentSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    courseCode: {
      type: String,
      default: 'BCA'
    },
    semester: {
      type: Number,
      default: 5
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    totalMarks: {
      type: Number,
      default: 100
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active'
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        studentName: String,
        studentRollNumber: String,
        submittedAt: {
          type: Date,
          default: Date.now
        },
        content: String,
        fileUrl: String,
        marksObtained: {
          type: Number,
          default: null
        },
        feedback: String,
        status: {
          type: String,
          enum: ['Submitted', 'Graded', 'Late'],
          default: 'Submitted'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

assignmentSchema.index({ subject: 1, dueDate: 1 });
assignmentSchema.index({ courseCode: 1, semester: 1 });

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
