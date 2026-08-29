const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const CheckLog = require('../models/CheckLog');
const Pass = require('../models/Pass');
const { protect, authorize } = require('../middleware/auth');

router.post('/checkin', protect, authorize('security', 'admin'), [
  body('passId').notEmpty().withMessage('Pass ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { passId, location, temperature, notes } = req.body;

    const pass = await Pass.findById(passId).populate('visitor');
    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    if (pass.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Pass is ${pass.status}`
      });
    }

    const now = new Date();
    if (now < new Date(pass.validFrom) || now > new Date(pass.validUntil)) {
      return res.status(400).json({
        success: false,
        message: 'Pass is not valid for current time'
      });
    }

    const existingCheckIn = await CheckLog.findOne({
      pass: passId,
      status: 'checked-in'
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Visitor is already checked in'
      });
    }

    const checkLog = await CheckLog.create({
      pass: passId,
      visitor: pass.visitor._id,
      checkInBy: req.user._id,
      location,
      temperature,
      notes,
      status: 'checked-in'
    });

    await checkLog.populate('pass visitor checkInBy');

    res.status(201).json({
      success: true,
      checkLog,
      message: 'Visitor checked in successfully'
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/checkout', protect, authorize('security', 'admin'), [
  body('checkLogId').notEmpty().withMessage('Check log ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { checkLogId, notes } = req.body;

    const checkLog = await CheckLog.findById(checkLogId);
    if (!checkLog) {
      return res.status(404).json({
        success: false,
        message: 'Check log not found'
      });
    }

    if (checkLog.status === 'checked-out') {
      return res.status(400).json({
        success: false,
        message: 'Visitor is already checked out'
      });
    }

    checkLog.checkOutTime = new Date();
    checkLog.checkOutBy = req.user._id;
    checkLog.status = 'checked-out';
    if (notes) checkLog.notes = notes;

    await checkLog.save();
    await checkLog.populate('pass visitor checkInBy checkOutBy');

    res.json({
      success: true,
      checkLog,
      message: 'Visitor checked out successfully'
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/scan', protect, authorize('security', 'admin'), [
  body('passNumber').notEmpty().withMessage('Pass number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { passNumber, location, temperature, notes } = req.body;

    const pass = await Pass.findOne({ passNumber }).populate('visitor host');
    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Invalid pass number'
      });
    }

    if (pass.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Pass is ${pass.status}`,
        pass
      });
    }

    const now = new Date();
    if (now < new Date(pass.validFrom) || now > new Date(pass.validUntil)) {
      return res.status(400).json({
        success: false,
        message: 'Pass has expired or not yet valid',
        pass
      });
    }

    const existingCheckIn = await CheckLog.findOne({
      pass: pass._id,
      status: 'checked-in'
    });

    let checkLog;
    let action;

    if (existingCheckIn) {

      existingCheckIn.checkOutTime = new Date();
      existingCheckIn.checkOutBy = req.user._id;
      existingCheckIn.status = 'checked-out';
      if (notes) existingCheckIn.notes = notes;
      await existingCheckIn.save();
      await existingCheckIn.populate('pass visitor checkInBy checkOutBy');
      checkLog = existingCheckIn;
      action = 'checkout';
    } else {

      checkLog = await CheckLog.create({
        pass: pass._id,
        visitor: pass.visitor._id,
        checkInBy: req.user._id,
        location,
        temperature,
        notes,
        status: 'checked-in'
      });
      await checkLog.populate('pass visitor checkInBy');
      action = 'checkin';
    }

    res.json({
      success: true,
      checkLog,
      action,
      pass,
      message: action === 'checkin' ? 'Visitor checked in successfully' : 'Visitor checked out successfully'
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, date } = req.query;

    const query = {};
    if (status) query.status = status;

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.checkInTime = { $gte: startDate, $lte: endDate };
    }

    const checkLogs = await CheckLog.find(query)
      .populate('visitor', 'name email phone photo company')
      .populate('pass', 'passNumber purpose validFrom validUntil')
      .populate('checkInBy', 'name email')
      .populate('checkOutBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ checkInTime: -1 });

    const count = await CheckLog.countDocuments(query);

    res.json({
      success: true,
      checkLogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get check logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const checkLog = await CheckLog.findById(req.params.id)
      .populate('visitor', 'name email phone photo company')
      .populate('pass', 'passNumber purpose validFrom validUntil')
      .populate('checkInBy', 'name email')
      .populate('checkOutBy', 'name email');

    if (!checkLog) {
      return res.status(404).json({
        success: false,
        message: 'Check log not found'
      });
    }

    res.json({
      success: true,
      checkLog
    });
  } catch (error) {
    console.error('Get check log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/visitor/:visitorId', protect, async (req, res) => {
  try {
    const checkLogs = await CheckLog.find({ visitor: req.params.visitorId })
      .populate('pass', 'passNumber purpose')
      .populate('checkInBy', 'name')
      .populate('checkOutBy', 'name')
      .sort({ checkInTime: -1 });

    res.json({
      success: true,
      checkLogs
    });
  } catch (error) {
    console.error('Get visitor check logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
