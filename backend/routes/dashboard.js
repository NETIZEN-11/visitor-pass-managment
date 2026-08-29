const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const Pass = require('../models/Pass');
const CheckLog = require('../models/CheckLog');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalVisitors = await Visitor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalPasses = await Pass.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    const todayCheckIns = await CheckLog.countDocuments({
      checkInTime: { $gte: today, $lt: tomorrow }
    });

    const currentlyCheckedIn = await CheckLog.countDocuments({
      status: 'checked-in'
    });

    const todayAppointments = await Appointment.countDocuments({
      scheduledDate: { $gte: today, $lt: tomorrow }
    });

    const pendingAppointments = await Appointment.countDocuments({
      status: 'pending'
    });

    const activePasses = await Pass.countDocuments({
      status: 'active',
      validUntil: { $gte: new Date() }
    });

    const recentCheckIns = await CheckLog.find()
      .populate('visitor', 'name photo')
      .populate('pass', 'passNumber')
      .sort({ checkInTime: -1 })
      .limit(5);

    const upcomingAppointments = await Appointment.find({
      scheduledDate: { $gte: today },
      status: 'approved'
    })
      .populate('visitor', 'name email photo')
      .populate('host', 'name')
      .sort({ scheduledDate: 1 })
      .limit(5);

    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const passesByStatus = await Pass.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalVisitors,
        totalAppointments,
        totalPasses,
        activeUsers,
        todayCheckIns,
        currentlyCheckedIn,
        todayAppointments,
        pendingAppointments,
        activePasses
      },
      recentActivity: {
        recentCheckIns,
        upcomingAppointments
      },
      breakdown: {
        appointmentsByStatus,
        passesByStatus
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.checkInTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const visitorsByDay = await CheckLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$checkInTime' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const peakHours = await CheckLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $hour: '$checkInTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const avgDuration = await CheckLog.aggregate([
      {
        $match: {
          status: 'checked-out',
          checkOutTime: { $exists: true }
        }
      },
      {
        $project: {
          duration: {
            $subtract: ['$checkOutTime', '$checkInTime']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    const topVisitors = await CheckLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$visitor',
          visitCount: { $sum: 1 }
        }
      },
      { $sort: { visitCount: -1 } },
      { $limit: 10 }
    ]);

    await CheckLog.populate(topVisitors, {
      path: '_id',
      select: 'name email company'
    });

    res.json({
      success: true,
      analytics: {
        visitorsByDay,
        peakHours,
        avgDuration: avgDuration[0]?.avgDuration || 0,
        topVisitors
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/export', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    let data;
    let filename;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    switch (type) {
      case 'visitors':
        data = await Visitor.find(dateFilter).lean();
        filename = 'visitors.csv';
        break;
      case 'appointments':
        data = await Appointment.find(dateFilter)
          .populate('visitor', 'name email')
          .populate('host', 'name')
          .lean();
        filename = 'appointments.csv';
        break;
      case 'passes':
        data = await Pass.find(dateFilter)
          .populate('visitor', 'name email')
          .populate('host', 'name')
          .lean();
        filename = 'passes.csv';
        break;
      case 'checklogs':
        data = await CheckLog.find(dateFilter)
          .populate('visitor', 'name email')
          .populate('pass', 'passNumber')
          .lean();
        filename = 'checklogs.csv';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data to export'
      });
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
