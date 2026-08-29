import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchLogs();
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [filter, page]);

  const fetchLogs = async () => {
    try {
      const endpoint = user?.role === 'admin' || user?.role === 'security'
        ? '/api/activitylogs'
        : '/api/activitylogs/my-activity';

      const params = { page, limit: 20 };
      if (filter !== 'all') params.action = filter;

      const response = await axios.get(endpoint, { params });
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/activitylogs/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      create_visitor: 'bg-blue-100 text-blue-800',
      issue_pass: 'bg-purple-100 text-purple-800',
      checkin: 'bg-green-100 text-green-800',
      checkout: 'bg-yellow-100 text-yellow-800',
      approve_appointment: 'bg-green-100 text-green-800',
      reject_appointment: 'bg-red-100 text-red-800',
      blacklist_visitor: 'bg-red-100 text-red-800',
      revoke_pass: 'bg-red-100 text-red-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const formatAction = (action) => {
    return action.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'admin' || user?.role === 'security'
            ? 'Monitor all system activities'
            : 'View your activity history'}
        </p>
      </div>

      {}
      {user?.role === 'admin' && stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <p className="text-sm font-medium text-gray-600">Total Activities</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-gray-600">Failed Activities</p>
            <p className="text-2xl font-bold text-red-600">{stats.failedActivities}</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-gray-600">Most Active</p>
            <p className="text-sm font-semibold text-gray-900">
              {stats.activityByUser[0]?._id?.name || 'N/A'}
            </p>
          </div>
        </div>
      )}

      {}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {['all', 'login', 'create_visitor', 'issue_pass', 'checkin', 'checkout', 'approve_appointment'].map((action) => (
            <button
              key={action}
              onClick={() => { setFilter(action); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === action ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {action === 'all' ? 'All' : formatAction(action)}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.user?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">{log.user?.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.details || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {logs.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No activity logs found</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
