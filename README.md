# Visitor Pass Management System (MERN)

<cite index="1-1,1-2">A comprehensive Visitor Pass Management System built using the MERN stack (MongoDB, Express, React, Node.js) that allows organizations to register, issue, and verify visitor passes digitally.</cite>

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Seeding Demo Data](#seeding-demo-data)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

<cite index="1-5,1-6,1-7,1-8,1-9,1-10,1-11,1-12">### Core Features

1. **Authentication & Authorization** - JWT-based authentication with role-based access control
2. **Visitor Registration** - Register visitors with details and photo upload
3. **Appointments / Pre-Registration** - Invite visitors, approve appointments, and send notifications
4. **Pass Issuance** - Generate QR code-based visitor passes with PDF badges
5. **Check-In / Check-Out** - QR code scanning for visitor entry and exit logging
6. **Notifications** - Email and SMS notifications for appointments and passes
7. **Dashboard & Reports** - Analytics, search, filter, and export functionality</cite>

### Additional Features

- Real-time visitor tracking
- Blacklist management
- Multi-role support (Admin, Security, Employee, Visitor)
- Responsive design for mobile and desktop
- Photo capture for visitor identification
- Pass validity management
- Audit logs for all check-ins/check-outs

## 🛠 Tech Stack

<cite index="1-12,1-13,1-14">**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- QR code generation
- PDF generation (PDFKit)
- Email service (Nodemailer)
- SMS service (Twilio)

**Frontend:**
- React 18
- React Router v6
- Axios for API calls
- Tailwind CSS for styling
- Heroicons for icons
- React Toastify for notifications
- QR code scanner and generator</cite>

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd visitor-pass-management
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/visitor-pass-management
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App Passwords
3. Use the generated password in `EMAIL_PASSWORD`

### SMS Setup (Twilio)

1. Sign up for a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number for sending SMS
4. Add credentials to `.env` file

### MongoDB Setup

**Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in `.env`

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

## 🌱 Seeding Demo Data

<cite index="1-15,1-18">To populate the database with demo data:</cite>

```bash
cd backend
npm run seed
```

This will create:
- 4 users (Admin, Security, 2 Employees)
- 3 visitors
- 3 appointments

**Demo Credentials:**
```
Admin:
Email: admin@example.com
Password: admin123

Security:
Email: security@example.com
Password: security123

Employee:
Email: john@example.com
Password: employee123
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user
```

### Visitor Endpoints

```
GET /api/visitors - Get all visitors
POST /api/visitors - Create visitor
GET /api/visitors/:id - Get visitor by ID
PUT /api/visitors/:id - Update visitor
DELETE /api/visitors/:id - Delete visitor
PUT /api/visitors/:id/blacklist - Blacklist/unblacklist visitor
```

### Appointment Endpoints

```
GET /api/appointments - Get all appointments
POST /api/appointments - Create appointment
GET /api/appointments/:id - Get appointment by ID
PUT /api/appointments/:id - Update appointment
PUT /api/appointments/:id/approve - Approve appointment
PUT /api/appointments/:id/reject - Reject appointment
DELETE /api/appointments/:id - Delete appointment
```

### Pass Endpoints

```
GET /api/passes - Get all passes
POST /api/passes - Issue new pass
GET /api/passes/:id - Get pass by ID
GET /api/passes/number/:passNumber - Get pass by number
PUT /api/passes/:id/revoke - Revoke pass
DELETE /api/passes/:id - Delete pass
```

### Check Log Endpoints

```
GET /api/checklogs - Get all check logs
POST /api/checklogs/checkin - Check-in visitor
POST /api/checklogs/checkout - Check-out visitor
POST /api/checklogs/scan - Scan QR code
GET /api/checklogs/:id - Get check log by ID
GET /api/checklogs/visitor/:visitorId - Get logs by visitor
```

### Dashboard Endpoints

```
GET /api/dashboard/stats - Get dashboard statistics
GET /api/dashboard/analytics - Get analytics data
GET /api/dashboard/export - Export data to CSV
```

## 👥 User Roles

<cite index="1-5">### Admin
- Full system access
- Manage users, visitors, appointments, passes
- View analytics and reports
- Export data

### Security/Frontdesk
- Issue visitor passes
- Scan QR codes for check-in/check-out
- View visitor information
- Manage check logs

### Employee/Host
- Invite visitors
- Create appointments
- Approve/reject visitor requests
- View own appointments

### Visitor
- Pre-register for visits
- View digital pass
- Access appointment details</cite>

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Visitor Registration
![Visitor Registration](screenshots/visitor-registration.png)

### Pass Issuance
![Pass Issuance](screenshots/pass-issuance.png)

### QR Scanner
![QR Scanner](screenshots/qr-scanner.png)

## 🐳 Deployment

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/visitor-pass-management
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Run with Docker:
```bash
docker-compose up -d
```

### Heroku Deployment

**Backend:**
```bash
cd backend
heroku create your-app-name-backend
heroku addons:create mongolab
git push heroku main
```

**Frontend:**
```bash
cd frontend
# Update API URL in axios configuration
npm run build
# Deploy build folder to Netlify/Vercel
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Project Structure

```
visitor-pass-management/
├── backend/
│   ├── config/
│   │   └── multer.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Visitor.js
│   │   ├── Appointment.js
│   │   ├── Pass.js
│   │   └── CheckLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── visitors.js
│   │   ├── appointments.js
│   │   ├── passes.js
│   │   ├── checkLogs.js
│   │   └── dashboard.js
│   ├── scripts/
│   │   └── seed.js
│   ├── utils/
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   ├── qrGenerator.js
│   │   └── pdfGenerator.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Visitors.js
│   │   │   ├── Appointments.js
│   │   │   ├── Passes.js
│   │   │   ├── CheckLogs.js
│   │   │   ├── QRScanner.js
│   │   │   └── Users.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- MongoDB for database
- Express.js for backend framework
- React for frontend library
- Node.js for runtime environment
- Tailwind CSS for styling
- All open-source contributors

## 📞 Support

For support, email support@example.com or create an issue in the repository.

## 🔮 Future Enhancements

- Mobile app (React Native)
- Facial recognition integration
- Multi-language support
- Advanced analytics dashboard
- Integration with access control systems
- Visitor badge printing
- Real-time notifications via WebSocket
- Multi-organization/multi-location support

---

