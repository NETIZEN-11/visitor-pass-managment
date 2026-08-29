import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PreRegister from './pages/PreRegister';
import DigitalPass from './pages/DigitalPass';
import Dashboard from './pages/Dashboard';
import Visitors from './pages/Visitors';
import VisitorForm from './pages/VisitorForm';
import Appointments from './pages/Appointments';
import AppointmentForm from './pages/AppointmentForm';
import Passes from './pages/Passes';
import PassForm from './pages/PassForm';
import CheckLogs from './pages/CheckLogs';
import QRScanner from './pages/QRScanner';
import ActivityLogs from './pages/ActivityLogs';
import Users from './pages/Users';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pre-register" element={<PreRegister />} />
          <Route path="/pass-view" element={<DigitalPass />} />
          <Route path="/pass-view/:passNumber" element={<DigitalPass />} />
          <Route path="/verify/:passNumber" element={<DigitalPass />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>

            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="visitors/new" element={<VisitorForm />} />
            <Route path="visitors/edit/:id" element={<VisitorForm />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/new" element={<AppointmentForm />} />
            <Route path="appointments/edit/:id" element={<AppointmentForm />} />
            <Route path="passes" element={<Passes />} />
            <Route path="passes/new" element={<PassForm />} />
            <Route path="checklogs" element={<CheckLogs />} />
            <Route path="scanner" element={<QRScanner />} />
            <Route path="activitylogs" element={<ActivityLogs />} />
            <Route path="users" element={<Users />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
