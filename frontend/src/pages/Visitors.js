import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  NoSymbolIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { exportToCSV } from '../utils/exportUtils';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVisitors();
    // eslint-disable-next-line
  }, [page, search]);

  const fetchVisitors = async () => {
    try {
      const response = await axios.get('/api/visitors', {
        params: { page, search, limit: 10 }
      });
      setVisitors(response.data.visitors || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this visitor?')) {
      try {
        await axios.delete(`/api/visitors/${id}`);
        toast.success('Visitor deleted successfully');
        fetchVisitors();
      } catch (error) {
        toast.error('Failed to delete visitor');
      }
    }
  };

  const handleToggleBlacklist = async (visitor) => {
    const reason = !visitor.isBlacklisted ? window.prompt('Enter reason for blacklisting:') : null;
    if (!visitor.isBlacklisted && reason === null) return; // cancelled

    try {
      if (visitor.isBlacklisted) {
        await axios.put(`/api/visitors/${visitor._id}/whitelist`);
        toast.success('Visitor removed from blacklist');
      } else {
        await axios.put(`/api/visitors/${visitor._id}/blacklist`, { blacklistReason: reason || 'Security concern' });
        toast.warning('Visitor blacklisted');
      }
      fetchVisitors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Blacklist operation failed');
    }
  };

  const handleExport = () => {
    const exportData = visitors.map(v => ({
      'Name': v.name,
      'Email': v.email,
      'Phone': v.phone,
      'Company': v.company || 'N/A',
      'ID Proof': v.idProof || 'N/A',
      'ID Number': v.idProofNumber || 'N/A',
      'Status': v.isBlacklisted ? 'Blacklisted' : 'Active',
      'Registered At': new Date(v.createdAt).toLocaleString()
    }));
    exportToCSV(exportData, `visitors-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (loading && visitors.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Visitors Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Manage registered visitor profiles, photos and blacklist status</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn btn-secondary flex items-center text-sm">
            <DocumentArrowDownIcon className="h-5 w-5 mr-1.5" />
            Export CSV
          </button>
          <Link to="/visitors/new" className="btn btn-primary flex items-center text-sm">
            <PlusIcon className="h-5 w-5 mr-1.5" />
            Add Visitor
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search visitors by name, email, phone or company..."
            className="input pl-10 text-sm"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Visitors Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Proof
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visitors.map((visitor) => (
                <tr key={visitor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {visitor.photo ? (
                        <img className="h-10 w-10 rounded-full object-cover border" src={visitor.photo} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {visitor.name.charAt(0)}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{visitor.name}</div>
                        <div className="text-xs text-gray-400">ID: {visitor._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{visitor.email}</div>
                    <div className="text-xs text-gray-500">{visitor.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {visitor.company || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                    {visitor.idProof ? `${visitor.idProof}: ${visitor.idProofNumber || ''}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                      visitor.isBlacklisted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {visitor.isBlacklisted ? 'BLACKLISTED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleToggleBlacklist(visitor)}
                      title={visitor.isBlacklisted ? 'Whitelist visitor' : 'Blacklist visitor'}
                      className={`p-1 rounded ${
                        visitor.isBlacklisted ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'
                      }`}
                    >
                      {visitor.isBlacklisted ? (
                        <CheckCircleIcon className="h-5 w-5 inline" />
                      ) : (
                        <NoSymbolIcon className="h-5 w-5 inline" />
                      )}
                    </button>
                    <Link to={`/visitors/edit/${visitor._id}`} className="text-blue-600 hover:text-blue-900 p-1">
                      <PencilIcon className="h-5 w-5 inline" />
                    </Link>
                    <button onClick={() => handleDelete(visitor._id)} className="text-red-600 hover:text-red-900 p-1">
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn btn-secondary disabled:opacity-50 text-xs"
            >
              Previous
            </button>
            <span className="text-xs text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn btn-secondary disabled:opacity-50 text-xs"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {visitors.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No visitors found</p>
        </div>
      )}
    </div>
  );
};

export default Visitors;
