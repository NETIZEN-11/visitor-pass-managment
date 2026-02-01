import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CheckLogs = () => {
  const [checkLogs, setCheckLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCheckLogs();
  }, [filter]);

  const fetchCheckLogs = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/api/checklogs', { params });
      setCheckLogs(response.data.checkLogs);
    } catch (error) {
      toast.error('Failed to fetch check logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Check-In/Out Logs</h1>

      {/* Filters */}
      <div className="card">
        <div className="flex space-x-2">
          {['all', 'checked-in', 'checked-out'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status === 'all' ? 'All' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pass</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {checkLogs.map((log) => (
                <tr key={log._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {log.visitor?.photo ? (
                        <img className="h-10 w-10 rounded-full" src={log.visitor.photo} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{log.visitor?.name}</div>
                        <div className="text-sm text-gray-500">{log.visitor?.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.pass?.passNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(log.checkInTime).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">By: {log.checkInBy?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.checkOutTime ? (
                      <>
                        <div className="text-sm text-gray-900">{new Date(log.checkOutTime).toLocaleString()}</div>
                        <div className="text-sm text-gray-500">By: {log.checkOutBy?.name}</div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.status === 'checked-in' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {checkLogs.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No check logs found</p>
        </div>
      )}
    </div>
  );
};

export default CheckLogs;
