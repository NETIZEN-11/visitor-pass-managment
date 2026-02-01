const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail, appointmentInviteEmail, appointmentApprovedEmail } = require('../utils/emailService');
const { sendSMS, appointmentInviteSMS, appointmentApprovedSMS } = require('../utils/smsService');

// @route   POST /api/appointments
// @desc    Create appointment
// @access  Private (Employee, Admin)
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

    // Send notification
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

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, hostId } = req.query;
    
    const query = {};
    
    // Filter by host for employees
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

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
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

// @route   PUT /api/appointments/:id/approve
// @desc    Approve appointment
// @access  Private (Employee, Admin, Security)
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

    // Send notification
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

// @route   PUT /api/appointments/:id/reject
// @desc    Reject appointment
// @access  Private (Employee, Admin, Security)
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

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Only host or admin can update
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

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private (Admin or Host)
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Only host or admin can delete
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
