const mongoose = require('mongoose');

// ==========================================
// NOTIFICATION SCHEMA & MODEL
// ==========================================
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'ASSIGNMENT_DEADLINE',
        'NEW_ASSIGNMENT',
        'ATTENDANCE_WARNING',
        'NOTICE',
        'RESULT_PUBLISHED',
        'FEE_DUE',
        'SYSTEM'
      ],
      default: 'SYSTEM'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;
