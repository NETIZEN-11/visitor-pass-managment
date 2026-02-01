const ActivityLog = require('../models/ActivityLog');

// Log activity
exports.logActivity = async (userId, action, details = null, targetModel = null, targetId = null, req = null) => {
  try {
    const logData = {
      user: userId,
      action,
      details,
      targetModel,
      targetId,
      status: 'success'
    };

    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('user-agent');
    }

    await ActivityLog.create(logData);
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};

// Log failed activity
exports.logFailedActivity = async (userId, action, errorMessage, req = null) => {
  try {
    const logData = {
      user: userId,
      action,
      status: 'failed',
      errorMessage
    };

    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('user-agent');
    }

    await ActivityLog.create(logData);
  } catch (error) {
    console.error('Failed activity logging error:', error);
  }
};

// Middleware to automatically log certain actions
exports.autoLogActivity = (action, getDetails = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    res.send = function(data) {
      // Log only on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const details = getDetails ? getDetails(req, res) : null;
        exports.logActivity(
          req.user._id,
          action,
          details,
          null,
          null,
          req
        ).catch(err => console.error('Auto-log error:', err));
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};
