const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  passNumber: {
    type: String,
    required: true,
    unique: true
  },
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  qrCode: {
    type: String,
    required: true
  },
  pdfPath: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'used'],
    default: 'active'
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revocationReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate pass number
passSchema.pre('save', async function(next) {
  if (!this.passNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.passNumber = `VP${year}${month}${day}${random}`;
  }
  next();
});

module.exports = mongoose.model('Pass', passSchema);
