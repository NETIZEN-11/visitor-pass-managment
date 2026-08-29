import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { exportToCSV } from '../utils/exportUtils';

const CheckLogs = () => {
  const [checkLogs, setCheckLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCheckLogs();

  }, [filter]);

  const fetchCheckLogs = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/api/checklogs', { params });
      setCheckLogs(response.data.checkLogs || []);
    } catch (error) {
      toast.error('Failed to fetch check logs');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckOut = async (checkLogId) => {
    try {
      await axios.post('/api/checklogs/checkout', {
        checkLogId,
        notes: 'Manual desk check-out'
      });
      toast.success('Visitor checked out successfully');
      fetchCheckLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const handleExport = () => {
    const exportData = filteredLogs.map(l => ({
      'Visitor Name': l.visitor?.name || 'N/A',
      'Visitor Company': l.visitor?.company || 'N/A',
      'Pass Number': l.pass?.passNumber || 'N/A',
      'Check-In Time': new Date(l.checkInTime).toLocaleString(),
      'Check-In By': l.checkInBy?.name || 'N/A',
      'Check-Out Time': l.checkOutTime ? new Date(l.checkOutTime).toLocaleString() : 'Still Checked In',
      'Check-Out By': l.checkOutBy?.name || 'N/A',
      'Location': l.location || 'Reception',
      'Status': l.status
    }));
    exportToCSV(exportData, `check-logs-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredLogs = checkLogs.filter(log => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      log.visitor?.name?.toLowerCase().includes(term) ||
      log.pass?.passNumber?.toLowerCase().includes(term) ||
      log.checkInBy?.name?.toLowerCase().includes(term)
    );
  });

  if (loading && checkLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Check-In / Out Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Real-time visitor entry and exit tracking records</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary flex items-center text-sm">
          <DocumentArrowDownIcon className="h-5 w-5 mr-1.5" />
          Export CSV Report
        </button>
      </div>

      {}
      <div className="card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search visitor, pass number..."
            className="input pl-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
          {['all', 'checked-in', 'checked-out'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('-', ' ')}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {log.visitor?.photo ? (
                        <img className="h-10 w-10 rounded-full object-cover border" src={log.visitor.photo} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {log.visitor?.name?.charAt(0) || 'V'}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{log.visitor?.name}</div>
                        <div className="text-xs text-gray-500">{log.visitor?.company || 'Visitor'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-medium">
                    {log.pass?.passNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(log.checkInTime).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">By: {log.checkInBy?.name || 'Security'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.checkOutTime ? (
                      <>
                        <div className="text-sm text-gray-900">{new Date(log.checkOutTime).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">By: {log.checkOutBy?.name || 'Security'}</div>
                      </>
                    ) : (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded font-medium">Inside Premises</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                      log.status === 'checked-in' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status === 'checked-in' ? 'CHECKED IN' : 'CHECKED OUT'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {log.status === 'checked-in' && (
                      <button
                        onClick={() => handleManualCheckOut(log._id)}
                        className="btn btn-secondary text-xs py-1 px-2.5 inline-flex items-center text-blue-700 hover:bg-blue-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-3.5 h-3.5 mr-1" />
                        Check-Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No check logs found</p>
        </div>
      )}
    </div>
  );
};

export default CheckLogs;
