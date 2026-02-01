const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'create_visitor',
      'update_visitor',
      'delete_visitor',
      'create_appointment',
      'approve_appointment',
      'reject_appointment',
      'issue_pass',
      'revoke_pass',
      'checkin',
      'checkout',
      'blacklist_visitor',
      'unblacklist_visitor',
      'create_user',
      'update_user',
      'delete_user',
      'export_data',
      'view_analytics'
    ]
  },
  targetModel: {
    type: String,
    enum: ['User', 'Visitor', 'Appointment', 'Pass', 'CheckLog', null],
    default: null
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  details: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  errorMessage: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
