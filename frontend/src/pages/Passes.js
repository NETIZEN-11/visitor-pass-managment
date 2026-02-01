import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusIcon, QrCodeIcon } from '@heroicons/react/24/outline';

const Passes = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      const response = await axios.get('/api/passes');
      setPasses(response.data.passes);
    } catch (error) {
      toast.error('Failed to fetch passes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800',
      used: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Visitor Passes</h1>
        <Link to="/passes/new" className="btn btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Issue Pass
        </Link>
      </div>

      {/* Passes Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {passes.map((pass) => (
          <div key={pass._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Pass #{pass.passNumber}</h3>
                <p className="text-sm text-gray-500">{pass.visitor?.name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pass.status)}`}>
                {pass.status}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p><span className="font-medium">Host:</span> {pass.host?.name}</p>
              <p><span className="font-medium">Purpose:</span> {pass.purpose}</p>
              <p><span className="font-medium">Valid From:</span> {new Date(pass.validFrom).toLocaleString()}</p>
              <p><span className="font-medium">Valid Until:</span> {new Date(pass.validUntil).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setSelectedPass(pass)}
              className="w-full btn btn-secondary flex items-center justify-center"
            >
              <QrCodeIcon className="h-5 w-5 mr-2" />
              View QR Code
            </button>
          </div>
        ))}
      </div>

      {passes.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No passes found</p>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedPass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedPass(null)}>
          <div className="bg-white p-8 rounded-lg max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-center">Pass #{selectedPass.passNumber}</h3>
            <div className="flex justify-center mb-4">
              {selectedPass.qrCode && (
                <img src={selectedPass.qrCode} alt="QR Code" className="w-64 h-64" />
              )}
            </div>
            <p className="text-center text-sm text-gray-600 mb-4">{selectedPass.visitor?.name}</p>
            <button onClick={() => setSelectedPass(null)} className="w-full btn btn-primary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Passes;
