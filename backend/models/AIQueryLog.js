const mongoose = require('mongoose');

// ==========================================
// AI QUERY LOG SCHEMA & MODEL
// ==========================================
const aiQueryLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    query: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Academic', 'Campus_Info', 'Timetable', 'General', 'Technical'],
      default: 'General'
    },
    source: {
      type: String,
      enum: ['fastapi-ai', 'rule-fallback', 'mock'],
      default: 'fastapi-ai'
    }
  },
  {
    timestamps: true
  }
);

const AIQueryLog = mongoose.models.AIQueryLog || mongoose.model('AIQueryLog', aiQueryLogSchema);

module.exports = AIQueryLog;
