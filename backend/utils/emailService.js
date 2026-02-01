const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email
exports.sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `Visitor Pass System <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
exports.appointmentInviteEmail = (visitorName, hostName, date, time, purpose) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Visitor Appointment Invitation</h2>
      <p>Dear ${visitorName},</p>
      <p>You have been invited for an appointment by <strong>${hostName}</strong>.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
      </div>
      <p>Please arrive on time and bring a valid ID proof.</p>
      <p>Best regards,<br>Visitor Pass Management System</p>
    </div>
  `;
};

exports.appointmentApprovedEmail = (visitorName, date, time) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Appointment Approved</h2>
      <p>Dear ${visitorName},</p>
      <p>Your appointment has been approved!</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
      </div>
      <p>Your visitor pass will be issued upon arrival.</p>
      <p>Best regards,<br>Visitor Pass Management System</p>
    </div>
  `;
};

exports.passIssuedEmail = (visitorName, passNumber, validFrom, validUntil) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">Visitor Pass Issued</h2>
      <p>Dear ${visitorName},</p>
      <p>Your visitor pass has been issued successfully.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Pass Number:</strong> ${passNumber}</p>
        <p><strong>Valid From:</strong> ${validFrom}</p>
        <p><strong>Valid Until:</strong> ${validUntil}</p>
      </div>
      <p>Please present this pass at the security desk.</p>
      <p>Best regards,<br>Visitor Pass Management System</p>
    </div>
  `;
};
