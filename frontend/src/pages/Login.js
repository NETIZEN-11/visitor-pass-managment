import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  QrCodeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickLogin = (email, password) => {
    setFormData({ email, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-100">
        <div>
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Visitor Pass System
          </h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            Sign in to access organization portal
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="label text-xs font-bold uppercase tracking-wider text-gray-600">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="label text-xs font-bold uppercase tracking-wider text-gray-600">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-2.5 font-semibold text-sm shadow-md"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-2 text-center">Quick Demo Login (Click to Fill):</p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@example.com', 'admin123')}
              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded border border-blue-200 text-center transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('security@example.com', 'security123')}
              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded border border-indigo-200 text-center transition"
            >
              Security
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('john@example.com', 'employee123')}
              className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded border border-purple-200 text-center transition"
            >
              Employee
            </button>
          </div>
        </div>

        {}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
          <Link
            to="/pre-register"
            className="flex items-center justify-between text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white p-2 rounded-lg border shadow-sm transition"
          >
            <span className="flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-1.5 text-blue-600" />
              Visitor Pre-Registration Form
            </span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/pass-view"
            className="flex items-center justify-between text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white p-2 rounded-lg border shadow-sm transition"
          >
            <span className="flex items-center">
              <QrCodeIcon className="w-4 h-4 mr-1.5 text-indigo-600" />
              View & Verify Digital Pass (e.g. VP-1001)
            </span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="text-center">
          <Link to="/register" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            Don't have an account? Register new staff here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
