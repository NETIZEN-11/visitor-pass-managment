const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema({
  pass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pass',
    required: true
  },
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  checkInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  location: {
    type: String,
    trim: true
  },
  temperature: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out'],
    default: 'checked-in'
  }
});

module.exports = mongoose.model('CheckLog', checkLogSchema);
