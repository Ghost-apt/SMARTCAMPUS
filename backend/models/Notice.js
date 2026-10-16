const mongoose = require('mongoose');

// ==========================================
// NOTICE / ANNOUNCEMENT SCHEMA & MODEL
// ==========================================
const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Notice content is required']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'student', 'faculty', 'admin'],
      default: 'all'
    },
    department: {
      type: String,
      default: 'All'
    },
    category: {
      type: String,
      enum: ['Academic', 'Examination', 'Holiday', 'Event', 'General'],
      default: 'Academic'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

noticeSchema.index({ isPublished: 1, targetAudience: 1, createdAt: -1 });

const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);

module.exports = Notice;
