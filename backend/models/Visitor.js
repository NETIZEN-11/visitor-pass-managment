const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  photo: {
    type: String,
    default: null
  },
  idProof: {
    type: String,
    trim: true
  },
  idProofNumber: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  blacklistReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visitor', visitorSchema);
