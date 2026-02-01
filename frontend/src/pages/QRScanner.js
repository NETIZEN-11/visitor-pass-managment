import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const QRScanner = () => {
  const [passNumber, setPassNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!passNumber.trim()) {
      toast.error('Please enter a pass number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/checklogs/scan', {
        passNumber: passNumber.trim()
      });
      
      setScanResult(response.data);
      toast.success(response.data.message);
      setPassNumber('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Scan failed');
      setScanResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="mt-2 text-gray-600">Scan visitor pass QR code for check-in/out</p>
      </div>

      <div className="card">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="label">Enter Pass Number</label>
            <input
              type="text"
              className="input"
              placeholder="Enter or scan pass number"
              value={passNumber}
              onChange={(e) => setPassNumber(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Processing...' : 'Scan Pass'}
          </button>
        </form>
      </div>

      {scanResult && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Scan Result</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              scanResult.action === 'checkin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {scanResult.action === 'checkin' ? 'Checked In' : 'Checked Out'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              {scanResult.pass?.visitor?.photo ? (
                <img
                  src={scanResult.pass.visitor.photo}
                  alt={scanResult.pass.visitor.name}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300"></div>
              )}
              <div className="ml-4">
                <h3 className="text-lg font-semibold">{scanResult.pass?.visitor?.name}</h3>
                <p className="text-sm text-gray-500">{scanResult.pass?.visitor?.email}</p>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <p><span className="font-medium">Pass Number:</span> {scanResult.pass?.passNumber}</p>
              <p><span className="font-medium">Host:</span> {scanResult.pass?.host?.name}</p>
              <p><span className="font-medium">Purpose:</span> {scanResult.pass?.purpose}</p>
              <p><span className="font-medium">Valid Until:</span> {new Date(scanResult.pass?.validUntil).toLocaleString()}</p>
            </div>

            {scanResult.action === 'checkin' && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Check-in Time:</strong> {new Date(scanResult.checkLog?.checkInTime).toLocaleString()}
                </p>
              </div>
            )}

            {scanResult.action === 'checkout' && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Check-out Time:</strong> {new Date(scanResult.checkLog?.checkOutTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
