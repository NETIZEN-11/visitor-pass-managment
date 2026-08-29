const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const { sendEmail, appointmentInviteEmail, appointmentApprovedEmail } = require('../utils/emailService');
const { sendSMS, appointmentInviteSMS, appointmentApprovedSMS } = require('../utils/smsService');

router.post('/pre-register', upload.single('photo'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('hostId').notEmpty().withMessage('Host is required'),
  body('scheduledDate').notEmpty().withMessage('Scheduled date is required'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required'),
  body('purpose').notEmpty().withMessage('Purpose is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name,
      email,
      phone,
      idProof,
      idProofNumber,
      company,
      address,
      hostId,
      scheduledDate,
      scheduledTime,
      purpose,
      notes,
      photoBase64
    } = req.body;

    const host = await User.findById(hostId);
    if (!host || !host.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Selected host not found or inactive'
      });
    }

    let photoPath = null;
    if (req.file) {
      photoPath = `/uploads/photos/${req.file.filename}`;
    } else if (photoBase64 && photoBase64.startsWith('data:image')) {
      const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, '');
      const filename = `visitor-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
      const fullPath = path.join(__dirname, '../uploads/photos', filename);
      fs.writeFileSync(fullPath, base64Data, 'base64');
      photoPath = `/uploads/photos/${filename}`;
    }

    let visitor = await Visitor.findOne({ email: email.toLowerCase() });
    if (visitor) {
      if (visitor.isBlacklisted) {
        return res.status(403).json({
          success: false,
          message: 'Unable to process pre-registration. Please contact administration.'
        });
      }
      visitor.name = name;
      visitor.phone = phone;
      if (idProof) visitor.idProof = idProof;
      if (idProofNumber) visitor.idProofNumber = idProofNumber;
      if (company) visitor.company = company;
      if (address) visitor.address = address;
      if (purpose) visitor.purpose = purpose;
      if (photoPath) visitor.photo = photoPath;
      await visitor.save();
    } else {
      visitor = await Visitor.create({
        name,
        email: email.toLowerCase(),
        phone,
        idProof: idProof || 'Other',
        idProofNumber: idProofNumber || 'N/A',
        company,
        address,
        purpose,
        photo: photoPath
      });
    }

    const appointment = await Appointment.create({
      visitor: visitor._id,
      host: hostId,
      scheduledDate,
      scheduledTime,
      purpose,
      notes: notes || 'Pre-registered online by visitor',
      status: 'pending'
    });

    await appointment.populate('visitor host');

    await sendEmail({
      email: host.email,
      subject: 'New Visitor Pre-Registration Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Visitor Pre-Registration</h2>
          <p>A visitor has pre-registered for an appointment with you.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p><strong>Visitor:</strong> ${visitor.name} (${visitor.email}, ${visitor.phone})</p>
            <p><strong>Company:</strong> ${visitor.company || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${scheduledTime}</p>
            <p><strong>Purpose:</strong> ${purpose}</p>
          </div>
          <p>Please log in to your dashboard to review and approve or reject this request.</p>
        </div>
      `
    });

    await sendEmail({
      email: visitor.email,
      subject: 'Pre-Registration Received - Visitor Pass System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Pre-Registration Received</h2>
          <p>Dear ${visitor.name},</p>
          <p>Thank you for pre-registering your visit with <strong>${host.name}</strong>.</p>
          <p>Your request is pending host approval. You will receive an update once it is confirmed.</p>
        </div>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Pre-registration submitted successfully! Your host has been notified for approval.',
      appointment
    });
  } catch (error) {
    console.error('Pre-register appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.post('/', protect, authorize('employee', 'admin'), [
  body('visitorId').notEmpty().withMessage('Visitor ID is required'),
  body('scheduledDate').notEmpty().withMessage('Scheduled date is required'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required'),
  body('purpose').notEmpty().withMessage('Purpose is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { visitorId, scheduledDate, scheduledTime, purpose, location, notes } = req.body;

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    if (visitor.isBlacklisted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create appointment for blacklisted visitor'
      });
    }

    const appointment = await Appointment.create({
      visitor: visitorId,
      host: req.user._id,
      scheduledDate,
      scheduledTime,
      purpose,
      location,
      notes
    });

    await appointment.populate('visitor host');

    const emailHtml = appointmentInviteEmail(
      visitor.name,
      req.user.name,
      new Date(scheduledDate).toLocaleDateString(),
      scheduledTime,
      purpose
    );

    await sendEmail({
      email: visitor.email,
      subject: 'Visitor Appointment Invitation',
      html: emailHtml
    });

    await sendSMS(
      visitor.phone,
      appointmentInviteSMS(visitor.name, new Date(scheduledDate).toLocaleDateString(), scheduledTime)
    );

    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, hostId } = req.query;

    const query = {};

    if (req.user.role === 'employee') {
      query.host = req.user._id;
    } else if (hostId) {
      query.host = hostId;
    }

    if (status) query.status = status;

    if (search) {
      const visitors = await Visitor.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      query.visitor = { $in: visitors.map(v => v._id) };
    }

    const appointments = await Appointment.find(query)
      .populate('visitor', 'name email phone photo company')
      .populate('host', 'name email department')
      .populate('approvedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: -1, createdAt: -1 });

    const count = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor', 'name email phone photo company idProof idProofNumber')
      .populate('host', 'name email department phone')
      .populate('approvedBy', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/:id/approve', protect, authorize('employee', 'admin', 'security'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor')
      .populate('host');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is not pending'
      });
    }

    appointment.status = 'approved';
    appointment.approvedBy = req.user._id;
    appointment.approvalDate = new Date();
    await appointment.save();

    const emailHtml = appointmentApprovedEmail(
      appointment.visitor.name,
      new Date(appointment.scheduledDate).toLocaleDateString(),
      appointment.scheduledTime
    );

    await sendEmail({
      email: appointment.visitor.email,
      subject: 'Appointment Approved',
      html: emailHtml
    });

    await sendSMS(
      appointment.visitor.phone,
      appointmentApprovedSMS(
        appointment.visitor.name,
        new Date(appointment.scheduledDate).toLocaleDateString(),
        appointment.scheduledTime
      )
    );

    res.json({
      success: true,
      appointment,
      message: 'Appointment approved successfully'
    });
  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/:id/reject', protect, authorize('employee', 'admin', 'security'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is not pending'
      });
    }

    appointment.status = 'rejected';
    appointment.rejectionReason = rejectionReason;
    await appointment.save();

    res.json({
      success: true,
      appointment,
      message: 'Appointment rejected'
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    const { scheduledDate, scheduledTime, purpose, location, notes } = req.body;

    if (scheduledDate) appointment.scheduledDate = scheduledDate;
    if (scheduledTime) appointment.scheduledTime = scheduledTime;
    if (purpose) appointment.purpose = purpose;
    if (location) appointment.location = location;
    if (notes) appointment.notes = notes;

    await appointment.save();

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment'
      });
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
