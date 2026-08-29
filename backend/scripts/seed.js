const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const Pass = require('../models/Pass');
const CheckLog = require('../models/CheckLog');
const { generateQRCode } = require('../utils/qrGenerator');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Visitor.deleteMany({});
    await Appointment.deleteMany({});
    await Pass.deleteMany({});
    await CheckLog.deleteMany({});

    console.log('Existing data cleared');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1234567890',
        department: 'Administration'
      },
      {
        name: 'Security Guard',
        email: 'security@example.com',
        password: 'security123',
        role: 'security',
        phone: '+1234567891',
        department: 'Security'
      },
      {
        name: 'John Employee',
        email: 'john@example.com',
        password: 'employee123',
        role: 'employee',
        phone: '+1234567892',
        department: 'Engineering'
      },
      {
        name: 'Jane Employee',
        email: 'jane@example.com',
        password: 'employee123',
        role: 'employee',
        phone: '+1234567893',
        department: 'Marketing'
      }
    ]);

    console.log('Users created');

    // Create visitors
    const visitors = await Visitor.create([
      {
        name: 'Alice Visitor',
        email: 'alice@visitor.com',
        phone: '+1234567894',
        idProof: 'Passport',
        idProofNumber: 'P12345678',
        company: 'Tech Corp',
        address: '123 Main St, City',
        purpose: 'Business Meeting'
      },
      {
        name: 'Bob Visitor',
        email: 'bob@visitor.com',
        phone: '+1234567895',
        idProof: 'Driver License',
        idProofNumber: 'DL987654',
        company: 'Design Studio',
        address: '456 Oak Ave, Town',
        purpose: 'Interview'
      },
      {
        name: 'Charlie Visitor',
        email: 'charlie@visitor.com',
        phone: '+1234567896',
        idProof: 'National ID',
        idProofNumber: 'NID456789',
        company: 'Consulting Inc',
        address: '789 Pine Rd, Village',
        purpose: 'Consultation'
      }
    ]);

    console.log('Visitors created');

    // Create appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    await Appointment.create([
      {
        visitor: visitors[0]._id,
        host: users[2]._id,
        scheduledDate: tomorrow,
        scheduledTime: '10:00 AM',
        purpose: 'Product Demo',
        location: 'Conference Room A',
        status: 'approved',
        approvedBy: users[0]._id,
        approvalDate: new Date()
      },
      {
        visitor: visitors[1]._id,
        host: users[3]._id,
        scheduledDate: nextWeek,
        scheduledTime: '2:00 PM',
        purpose: 'Job Interview',
        location: 'HR Office',
        status: 'pending'
      },
      {
        visitor: visitors[2]._id,
        host: users[2]._id,
        scheduledDate: tomorrow,
        scheduledTime: '3:00 PM',
        purpose: 'Technical Consultation',
        location: 'Meeting Room B',
        status: 'approved',
        approvedBy: users[0]._id,
        approvalDate: new Date()
      }
    ]);

    console.log('Appointments created');

    // Create Passes
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 8);

    const qr1 = await generateQRCode({
      passNumber: 'VP-1001',
      visitorId: visitors[0]._id,
      visitorName: visitors[0].name,
      validFrom,
      validUntil
    });

    const qr2 = await generateQRCode({
      passNumber: 'VP-1002',
      visitorId: visitors[2]._id,
      visitorName: visitors[2].name,
      validFrom,
      validUntil
    });

    const passes = await Pass.create([
      {
        passNumber: 'VP-1001',
        visitor: visitors[0]._id,
        host: users[2]._id,
        issuedBy: users[1]._id,
        validFrom,
        validUntil,
        purpose: 'Product Demo & Meeting',
        qrCode: qr1,
        status: 'active'
      },
      {
        passNumber: 'VP-1002',
        visitor: visitors[2]._id,
        host: users[2]._id,
        issuedBy: users[1]._id,
        validFrom,
        validUntil,
        purpose: 'Technical Consultation',
        qrCode: qr2,
        status: 'active'
      }
    ]);

    console.log('Passes created');

    // Create Check-in Log
    await CheckLog.create({
      pass: passes[0]._id,
      visitor: visitors[0]._id,
      checkInBy: users[1]._id,
      checkInTime: new Date(),
      location: 'Main Gate Reception',
      temperature: 98.6,
      status: 'checked-in',
      notes: 'Checked in for demo'
    });

    console.log('Check logs created');

    console.log('\n=== Seed Data Summary ===');
    console.log('\nUsers:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Security: security@example.com / security123');
    console.log('Employee 1: john@example.com / employee123');
    console.log('Employee 2: jane@example.com / employee123');
    console.log('\nVisitors: 3 visitors created');
    console.log('Appointments: 3 appointments created');
    console.log('Passes: VP-1001 (Active), VP-1002 (Active)');
    console.log('CheckLogs: 1 active check-in');
    console.log('\n=========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();

