const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Visitor = require('../models/Visitor');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

// @route   POST /api/visitors
// @desc    Register a new visitor
// @access  Private
router.post('/', protect, upload.single('photo'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, idProof, idProofNumber, company, address, purpose } = req.body;

    const visitorData = {
      name,
      email,
      phone,
      idProof,
      idProofNumber,
      company,
      address,
      purpose
    };

    if (req.file) {
      visitorData.photo = `/uploads/photos/${req.file.filename}`;
    }

    const visitor = await Visitor.create(visitorData);

    res.status(201).json({
      success: true,
      visitor
    });
  } catch (error) {
    console.error('Create visitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/visitors
// @desc    Get all visitors
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, page = 1, limit = 10, isBlacklisted } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (typeof isBlacklisted !== 'undefined') {
      query.isBlacklisted = isBlacklisted === 'true';
    }

    const visitors = await Visitor.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Visitor.countDocuments(query);

    res.json({
      success: true,
      visitors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/visitors/:id
// @desc    Get visitor by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.json({
      success: true,
      visitor
    });
  } catch (error) {
    console.error('Get visitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/visitors/:id
// @desc    Update visitor
// @access  Private
router.put('/:id', protect, upload.single('photo'), async (req, res) => {
  try {
    const { name, email, phone, idProof, idProofNumber, company, address, purpose } = req.body;

    const updateData = {
      name,
      email,
      phone,
      idProof,
      idProofNumber,
      company,
      address,
      purpose
    };

    if (req.file) {
      updateData.photo = `/uploads/photos/${req.file.filename}`;
    }

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.json({
      success: true,
      visitor
    });
  } catch (error) {
    console.error('Update visitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/visitors/:id/blacklist
// @desc    Blacklist/unblacklist visitor
// @access  Private (Admin, Security)
router.put('/:id/blacklist', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const { isBlacklisted, blacklistReason } = req.body;

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { isBlacklisted, blacklistReason },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.json({
      success: true,
      visitor,
      message: isBlacklisted ? 'Visitor blacklisted' : 'Visitor removed from blacklist'
    });
  } catch (error) {
    console.error('Blacklist visitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/visitors/:id
// @desc    Delete visitor
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.json({
      success: true,
      message: 'Visitor deleted successfully'
    });
  } catch (error) {
    console.error('Delete visitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
