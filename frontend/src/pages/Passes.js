import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  NoSymbolIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { exportToCSV } from '../utils/exportUtils';

const Passes = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPasses();

  }, [statusFilter]);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await axios.get('/api/passes', { params });
      setPasses(response.data.passes || []);
    } catch (error) {
      toast.error('Failed to fetch passes');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (passId) => {
    const reason = window.prompt('Please enter the reason for revoking this pass:');
    if (reason === null) return;

    try {
      await axios.put(`/api/passes/${passId}/revoke`, { revocationReason: reason || 'Revoked by authority' });
      toast.success('Pass revoked successfully');
      fetchPasses();
      if (selectedPass?._id === passId) {
        setSelectedPass(prev => ({ ...prev, status: 'revoked' }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke pass');
    }
  };

  const handleExport = () => {
    const exportData = filteredPasses.map(p => ({
      'Pass Number': p.passNumber,
      'Visitor Name': p.visitor?.name || 'N/A',
      'Visitor Email': p.visitor?.email || 'N/A',
      'Visitor Phone': p.visitor?.phone || 'N/A',
      'Host Name': p.host?.name || 'N/A',
      'Host Department': p.host?.department || 'N/A',
      'Purpose': p.purpose,
      'Valid From': new Date(p.validFrom).toLocaleString(),
      'Valid Until': new Date(p.validUntil).toLocaleString(),
      'Status': p.status,
      'Issued At': new Date(p.createdAt).toLocaleString()
    }));
    exportToCSV(exportData, `visitor-passes-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      revoked: 'bg-gray-200 text-gray-800 border-gray-300',
      used: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredPasses = passes.filter(p => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.passNumber?.toLowerCase().includes(term) ||
      p.visitor?.name?.toLowerCase().includes(term) ||
      p.host?.name?.toLowerCase().includes(term) ||
      p.purpose?.toLowerCase().includes(term)
    );
  });

  if (loading && passes.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Visitor Passes</h1>
          <p className="mt-1 text-sm text-gray-500">Generate, view, download PDF badges and manage passes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn btn-secondary flex items-center text-sm">
            <DocumentArrowDownIcon className="h-5 w-5 mr-1.5" />
            Export CSV
          </button>
          <Link to="/passes/new" className="btn btn-primary flex items-center text-sm">
            <PlusIcon className="h-5 w-5 mr-1.5" />
            Issue Pass
          </Link>
        </div>
      </div>

      {}
      <div className="card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search passes, visitors, hosts..."
            className="input pl-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
          {['all', 'active', 'expired', 'revoked'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredPasses.map((pass) => (
          <div key={pass._id} className="card hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Pass #{pass.passNumber}</h3>
                  <p className="text-sm font-medium text-blue-600">{pass.visitor?.name}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(pass.status)}`}>
                  {pass.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                <p><span className="font-semibold text-gray-800">Host:</span> {pass.host?.name} ({pass.host?.department || 'Staff'})</p>
                <p><span className="font-semibold text-gray-800">Purpose:</span> {pass.purpose}</p>
                <p><span className="font-semibold text-gray-800">Valid From:</span> {new Date(pass.validFrom).toLocaleString()}</p>
                <p><span className="font-semibold text-gray-800">Valid Until:</span> {new Date(pass.validUntil).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedPass(pass)}
                className="btn btn-secondary flex items-center justify-center text-xs py-2"
              >
                <QrCodeIcon className="h-4 w-4 mr-1 text-blue-600" />
                View Badge & QR
              </button>
              <button
                onClick={() => window.open(`/api/passes/${pass._id}/pdf`, '_blank')}
                className="btn btn-secondary flex items-center justify-center text-xs py-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1 text-green-600" />
                PDF Badge
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPasses.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No passes found</p>
        </div>
      )}

      {}
      {selectedPass && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPass(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Digital Pass Badge #{selectedPass.passNumber}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedPass.status)}`}>
                {selectedPass.status.toUpperCase()}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-center">
                {selectedPass.qrCode ? (
                  <img src={selectedPass.qrCode} alt="Pass QR" className="w-52 h-52 border p-2 rounded-xl bg-white shadow-sm" />
                ) : (
                  <div className="w-52 h-52 bg-gray-100 flex items-center justify-center rounded-xl">
                    <QrCodeIcon className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-1.5">
                <p><span className="font-bold text-gray-700">Visitor:</span> {selectedPass.visitor?.name} ({selectedPass.visitor?.phone})</p>
                <p><span className="font-bold text-gray-700">Company:</span> {selectedPass.visitor?.company || 'N/A'}</p>
                <p><span className="font-bold text-gray-700">Host:</span> {selectedPass.host?.name} ({selectedPass.host?.department})</p>
                <p><span className="font-bold text-gray-700">Purpose:</span> {selectedPass.purpose}</p>
                <p><span className="font-bold text-gray-700">Valid From:</span> {new Date(selectedPass.validFrom).toLocaleString()}</p>
                <p><span className="font-bold text-gray-700">Valid Until:</span> {new Date(selectedPass.validUntil).toLocaleString()}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => window.open(`/api/passes/${selectedPass._id}/pdf`, '_blank')}
                  className="flex-1 btn btn-primary flex items-center justify-center text-xs py-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  Download PDF
                </button>
                <Link
                  to={`/pass-view/${selectedPass.passNumber}`}
                  target="_blank"
                  className="flex-1 btn btn-secondary flex items-center justify-center text-xs py-2"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-1" />
                  Public Digital Pass
                </Link>
                {selectedPass.status === 'active' && (
                  <button
                    onClick={() => handleRevoke(selectedPass._id)}
                    className="btn btn-danger flex items-center justify-center text-xs py-2"
                  >
                    <NoSymbolIcon className="w-4 h-4 mr-1" />
                    Revoke
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-100 px-6 py-3 text-right">
              <button onClick={() => setSelectedPass(null)} className="btn btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Passes;
