import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  QrCodeIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const DigitalPass = () => {
  const { passNumber } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputPassNum, setInputPassNum] = useState(passNumber || '');

  useEffect(() => {
    if (passNumber) {
      fetchPass(passNumber);
    } else {
      setLoading(false);
    }
  }, [passNumber]);

  const fetchPass = async (num) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/passes/public/${num}`);
      setPass(response.data.pass);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pass not found');
      setPass(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputPassNum.trim()) {
      fetchPass(inputPassNum.trim());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (pass?._id) {
      window.open(`/api/passes/${pass._id}/pdf`, '_blank');
    }
  };

  const getStatusBadge = () => {
    if (!pass) return null;
    const now = new Date();
    const isExpired = now > new Date(pass.validUntil);

    if (pass.status === 'revoked') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <XCircleIcon className="w-4 h-4 mr-1" />
          Revoked
        </span>
      );
    }
    if (isExpired || pass.status === 'expired') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
          <ClockIcon className="w-4 h-4 mr-1" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <CheckBadgeIcon className="w-4 h-4 mr-1" />
        Valid & Active Pass
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link to="/login" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Portal
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Digital Badge View
          </span>
        </div>

        {/* Pass Lookup Input if not directly loaded */}
        <div className="card mb-6 print:hidden">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="label text-xs font-bold text-gray-700">Enter Visitor Pass Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. VP-1001 or VP-1002"
                className="input flex-1"
                value={inputPassNum}
                onChange={(e) => setInputPassNum(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Verify Pass
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-500 font-medium">Quick Demo Passes:</span>
              <button
                type="button"
                onClick={() => { setInputPassNum('VP-1001'); fetchPass('VP-1001'); }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200"
              >
                VP-1001
              </button>
              <button
                type="button"
                onClick={() => { setInputPassNum('VP-1002'); fetchPass('VP-1002'); }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200"
              >
                VP-1002
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="card flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : pass ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200" id="printable-badge">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 text-center relative">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BuildingOfficeIcon className="w-7 h-7 text-blue-200" />
                <span className="text-lg font-bold tracking-wide">ORGANIZATION VISITOR PASS</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">#{pass.passNumber}</h1>
              <div className="mt-2">{getStatusBadge()}</div>
            </div>

            <div className="p-6 space-y-6">
              {/* Visitor Profile & Photo */}
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-blue-500 flex-shrink-0 flex items-center justify-center">
                  {pass.visitor?.photo ? (
                    <img src={pass.visitor.photo} alt={pass.visitor.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{pass.visitor?.name}</h2>
                  <p className="text-sm text-gray-600">{pass.visitor?.company || 'Independent Visitor'}</p>
                  <p className="text-xs text-gray-500 mt-1">{pass.visitor?.email} • {pass.visitor?.phone}</p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                {pass.qrCode ? (
                  <img src={pass.qrCode} alt="Pass QR Code" className="w-48 h-48 rounded-lg shadow-sm" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                    <QrCodeIcon className="w-24 h-24 text-gray-400" />
                  </div>
                )}
                <p className="text-xs font-semibold text-gray-600 mt-3 uppercase tracking-wider">
                  Scan at Security Checkpoint
                </p>
              </div>

              {/* Pass Information Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs font-medium text-gray-500 block">Host Name</span>
                  <span className="font-semibold text-gray-900">{pass.host?.name || 'Staff Member'}</span>
                  <span className="text-xs text-gray-500 block">{pass.host?.department}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 block">Visit Purpose</span>
                  <span className="font-semibold text-gray-900">{pass.purpose}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 block">Valid From</span>
                  <span className="font-medium text-gray-800 text-xs">
                    {new Date(pass.validFrom).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 block">Valid Until</span>
                  <span className="font-medium text-gray-800 text-xs">
                    {new Date(pass.validUntil).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2 print:hidden">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 btn btn-primary flex items-center justify-center py-2.5 text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Download PDF Badge
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 btn btn-secondary flex items-center justify-center py-2.5 text-sm"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print Pass
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500">Please enter a valid pass number above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalPass;
