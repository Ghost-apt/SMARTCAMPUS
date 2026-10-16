const mongoose = require('mongoose');

// ==========================================
// AUDIT LOG SCHEMA & MODEL
// ==========================================
const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actorName: String,
    actorRole: String,
    action: {
      type: String,
      required: true
    },
    resourceType: String,
    resourceId: String,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
