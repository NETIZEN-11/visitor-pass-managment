const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
