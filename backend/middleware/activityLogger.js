const ActivityLog = require('../models/ActivityLog');

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

exports.autoLogActivity = (action, getDetails = null) => {
  return async (req, res, next) => {

    const originalSend = res.send;

    res.send = function(data) {

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

      originalSend.call(this, data);
    };

    next();
  };
};
