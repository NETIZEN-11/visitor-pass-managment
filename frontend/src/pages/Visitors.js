import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVisitors();
  }, [page, search]);

  const fetchVisitors = async () => {
    try {
      const response = await axios.get('/api/visitors', {
        params: { page, search, limit: 10 }
      });
      setVisitors(response.data.visitors);
      setTotalPages(response.data.totalPages);
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visitors</h1>
          <p className="mt-2 text-gray-600">Manage visitor information</p>
        </div>
        <Link to="/visitors/new" className="btn btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Visitor
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search visitors by name, email, or phone..."
            className="input pl-10"
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
                <tr key={visitor._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {visitor.photo ? (
                        <img className="h-10 w-10 rounded-full" src={visitor.photo} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{visitor.email}</div>
                    <div className="text-sm text-gray-500">{visitor.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {visitor.company || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {visitor.idProof ? `${visitor.idProof}: ${visitor.idProofNumber}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      visitor.isBlacklisted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {visitor.isBlacklisted ? 'Blacklisted' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/visitors/edit/${visitor._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      <PencilIcon className="h-5 w-5 inline" />
                    </Link>
                    <button onClick={() => handleDelete(visitor._id)} className="text-red-600 hover:text-red-900">
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
    </div>
  );
};

export default Visitors;
