import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  CalendarIcon,
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Visitors',
      value: stats?.stats?.totalVisitors || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      link: '/visitors'
    },
    {
      name: 'Today Check-ins',
      value: stats?.stats?.todayCheckIns || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      link: '/checklogs'
    },
    {
      name: 'Currently Checked In',
      value: stats?.stats?.currentlyCheckedIn || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      link: '/checklogs'
    },
    {
      name: 'Pending Appointments',
      value: stats?.stats?.pendingAppointments || 0,
      icon: CalendarIcon,
      color: 'bg-purple-500',
      link: '/appointments'
    },
    {
      name: 'Active Passes',
      value: stats?.stats?.activePasses || 0,
      icon: TicketIcon,
      color: 'bg-indigo-500',
      link: '/passes'
    },
    {
      name: 'Today Appointments',
      value: stats?.stats?.todayAppointments || 0,
      icon: CalendarIcon,
      color: 'bg-pink-500',
      link: '/appointments'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to Visitor Pass Management System</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn btn-secondary flex items-center"
        >
          <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.name} to={stat.link} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Check-ins */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Check-ins</h2>
            <Link to="/checklogs" className="text-sm text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentActivity?.recentCheckIns?.length > 0 ? (
              stats.recentActivity.recentCheckIns.map((log) => (
                <div key={log._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    {log.visitor?.photo ? (
                      <img
                        src={log.visitor.photo}
                        alt={log.visitor.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{log.visitor?.name}</p>
                      <p className="text-xs text-gray-500">Pass: {log.pass?.passNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(log.checkInTime).toLocaleTimeString()}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'checked-in' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent check-ins</p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-sm text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentActivity?.upcomingAppointments?.length > 0 ? (
              stats.recentActivity.upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    {appointment.visitor?.photo ? (
                      <img
                        src={appointment.visitor.photo}
                        alt={appointment.visitor.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{appointment.visitor?.name}</p>
                      <p className="text-xs text-gray-500">Host: {appointment.host?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{appointment.scheduledTime}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {stats?.breakdown && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Appointments by Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointments by Status</h2>
            <div className="space-y-3">
              {stats.breakdown.appointmentsByStatus?.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{item._id}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
              {stats.breakdown.appointmentsByStatus?.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </div>

          {/* Passes by Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Passes by Status</h2>
            <div className="space-y-3">
              {stats.breakdown.passesByStatus?.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{item._id}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
              {stats.breakdown.passesByStatus?.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
