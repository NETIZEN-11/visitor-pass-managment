const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Pass = require('../models/Pass');
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');
const { generateQRCode } = require('../utils/qrGenerator');
const { generatePassPDF } = require('../utils/pdfGenerator');
const { sendEmail, passIssuedEmail } = require('../utils/emailService');
const { sendSMS, passIssuedSMS } = require('../utils/smsService');

// @route   POST /api/passes
// @desc    Issue a new pass
// @access  Private (Security, Admin)
router.post('/', protect, authorize('security', 'admin'), [
  body('visitorId').notEmpty().withMessage('Visitor ID is required'),
  body('hostId').notEmpty().withMessage('Host ID is required'),
  body('validFrom').notEmpty().withMessage('Valid from date is required'),
  body('validUntil').notEmpty().withMessage('Valid until date is required'),
  body('purpose').notEmpty().withMessage('Purpose is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { visitorId, hostId, appointmentId, validFrom, validUntil, purpose } = req.body;

    // Check if visitor exists
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    // Check if visitor is blacklisted
    if (visitor.isBlacklisted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot issue pass for blacklisted visitor'
      });
    }

    // Create pass
    const pass = new Pass({
      visitor: visitorId,
      host: hostId,
      appointment: appointmentId || null,
      issuedBy: req.user._id,
      validFrom,
      validUntil,
      purpose
    });

    // Generate QR code
    const qrData = {
      passNumber: pass.passNumber,
      visitorId: visitor._id,
      visitorName: visitor.name,
      validFrom: pass.validFrom,
      validUntil: pass.validUntil
    };

    const qrCode = await generateQRCode(qrData);
    pass.qrCode = qrCode;

    await pass.save();
    await pass.populate('visitor host issuedBy');

    // Generate PDF
    const pdfData = {
      passNumber: pass.passNumber,
      visitorName: visitor.name,
      visitorEmail: visitor.email,
      visitorPhone: visitor.phone,
      visitorCompany: visitor.company,
      hostName: pass.host.name,
      purpose: pass.purpose,
      validFrom: pass.validFrom,
      validUntil: pass.validUntil
    };

    const pdfPath = await generatePassPDF(pdfData, qrCode);
    pass.pdfPath = pdfPath;
    await pass.save();

    // Send notification
    const emailHtml = passIssuedEmail(
      visitor.name,
      pass.passNumber,
      new Date(pass.validFrom).toLocaleString(),
      new Date(pass.validUntil).toLocaleString()
    );

    await sendEmail({
      email: visitor.email,
      subject: 'Visitor Pass Issued',
      html: emailHtml,
      attachments: [{
        filename: `pass_${pass.passNumber}.pdf`,
        path: `.${pdfPath}`
      }]
    });

    await sendSMS(visitor.phone, passIssuedSMS(visitor.name, pass.passNumber));

    res.status(201).json({
      success: true,
      pass
    });
  } catch (error) {
    console.error('Issue pass error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/passes
// @desc    Get all passes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, visitorId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (visitorId) query.visitor = visitorId;
    
    if (search) {
      const visitors = await Visitor.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      query.visitor = { $in: visitors.map(v => v._id) };
    }

    const passes = await Pass.find(query)
      .populate('visitor', 'name email phone photo company')
      .populate('host', 'name email department')
      .populate('issuedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Pass.countDocuments(query);

    res.json({
      success: true,
      passes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get passes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/passes/:id
// @desc    Get pass by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('visitor', 'name email phone photo company idProof idProofNumber')
      .populate('host', 'name email department phone')
      .populate('issuedBy', 'name email')
      .populate('appointment');
    
    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    res.json({
      success: true,
      pass
    });
  } catch (error) {
    console.error('Get pass error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/passes/number/:passNumber
// @desc    Get pass by pass number (for QR scan)
// @access  Private
router.get('/number/:passNumber', protect, async (req, res) => {
  try {
    const pass = await Pass.findOne({ passNumber: req.params.passNumber })
      .populate('visitor', 'name email phone photo company')
      .populate('host', 'name email department');
    
    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Check if pass is valid
    const now = new Date();
    const isExpired = now > new Date(pass.validUntil);
    
    res.json({
      success: true,
      pass,
      isValid: pass.status === 'active' && !isExpired
    });
  } catch (error) {
    console.error('Get pass by number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/passes/:id/revoke
// @desc    Revoke a pass
// @access  Private (Security, Admin)
router.put('/:id/revoke', protect, authorize('security', 'admin'), async (req, res) => {
  try {
    const { revocationReason } = req.body;

    const pass = await Pass.findById(req.params.id);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    if (pass.status === 'revoked') {
      return res.status(400).json({
        success: false,
        message: 'Pass is already revoked'
      });
    }

    pass.status = 'revoked';
    pass.revokedBy = req.user._id;
    pass.revokedAt = new Date();
    pass.revocationReason = revocationReason;

    await pass.save();

    res.json({
      success: true,
      pass,
      message: 'Pass revoked successfully'
    });
  } catch (error) {
    console.error('Revoke pass error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/passes/:id
// @desc    Delete pass
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const pass = await Pass.findByIdAndDelete(req.params.id);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    res.json({
      success: true,
      message: 'Pass deleted successfully'
    });
  } catch (error) {
    console.error('Delete pass error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
