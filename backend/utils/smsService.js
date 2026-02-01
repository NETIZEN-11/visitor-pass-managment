let client;

// Initialize Twilio client only if credentials are provided
try {
  if (process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_AUTH_TOKEN && 
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log('Twilio not configured. SMS functionality disabled.');
}

// Send SMS
exports.sendSMS = async (phone, message) => {
  try {
    if (!client) {
      console.log('Twilio not configured. SMS not sent.');
      return { success: false, error: 'Twilio not configured' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log('SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
};

// SMS templates
exports.appointmentInviteSMS = (visitorName, date, time) => {
  return `Hi ${visitorName}, you have an appointment on ${date} at ${time}. Please bring valid ID. - Visitor Pass System`;
};

exports.appointmentApprovedSMS = (visitorName, date, time) => {
  return `Hi ${visitorName}, your appointment on ${date} at ${time} has been approved. - Visitor Pass System`;
};

exports.passIssuedSMS = (visitorName, passNumber) => {
  return `Hi ${visitorName}, your visitor pass ${passNumber} has been issued. Please present it at security. - Visitor Pass System`;
};
