import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  UserIcon,
  CameraIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const PreRegister = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    idProof: 'National ID',
    idProofNumber: '',
    address: '',
    hostId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    purpose: '',
    notes: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    fetchHosts();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchHosts = async () => {
    try {
      const response = await axios.get('/api/users/public/hosts');
      setHosts(response.data.hosts || []);
      if (response.data.hosts && response.data.hosts.length > 0) {
        setFormData(prev => ({ ...prev, hostId: response.data.hosts[0]._id }));
      }
    } catch (error) {
      console.error('Failed to load hosts:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Unable to access camera. Please use file upload instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 320;
      canvas.height = videoRef.current.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/png');
      setPhotoPreview(base64);
      setPhotoFile(null);
      stopCamera();
      toast.success('Photo captured successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hostId) {
      toast.error('Please select a host to visit');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (photoFile) {
        data.append('photo', photoFile);
      } else if (photoPreview && photoPreview.startsWith('data:image')) {
        data.append('photoBase64', photoPreview);
      }

      const response = await axios.post('/api/appointments/pre-register', data);
      setAppointmentData(response.data.appointment);
      setSubmitted(true);
      toast.success('Pre-registration submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pre-registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pre-Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment request has been sent to <strong>{appointmentData?.host?.name || 'the Host'}</strong> for approval.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <p><span className="font-semibold text-gray-700">Visitor:</span> {formData.name}</p>
            <p><span className="font-semibold text-gray-700">Email:</span> {formData.email}</p>
            <p><span className="font-semibold text-gray-700">Scheduled Date:</span> {formData.scheduledDate}</p>
            <p><span className="font-semibold text-gray-700">Scheduled Time:</span> {formData.scheduledTime}</p>
            <p><span className="font-semibold text-gray-700">Purpose:</span> {formData.purpose}</p>
            <p><span className="font-semibold text-gray-700">Status:</span> <span className="text-yellow-700 font-bold uppercase">Pending Approval</span></p>
          </div>

          <div className="text-xs text-gray-500 mb-6">
            You will receive an email confirmation once the host approves your request. Upon arrival, present your confirmation at the reception desk.
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  company: '',
                  idProof: 'National ID',
                  idProofNumber: '',
                  address: '',
                  hostId: hosts[0]?._id || '',
                  scheduledDate: new Date().toISOString().split('T')[0],
                  scheduledTime: '10:00',
                  purpose: '',
                  notes: ''
                });
                setPhotoPreview(null);
              }}
              className="flex-1 btn btn-secondary"
            >
              Register Another
            </button>
            <Link to="/login" className="flex-1 btn btn-primary flex items-center justify-center">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/login" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Visitor Portal
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-9 w-9 text-blue-200" />
              <div>
                <h1 className="text-2xl font-bold">Visitor Pre-Registration</h1>
                <p className="text-blue-100 text-sm mt-0.5">Pre-register your visit for express entry and digital pass badge</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                1. Visitor Details
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+1234567890"
                    className="input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Company / Organization</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Acme Corp"
                    className="input"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">ID Proof Type</label>
                  <select
                    name="idProof"
                    className="input"
                    value={formData.idProof}
                    onChange={handleChange}
                  >
                    <option value="National ID">National ID / Aadhaar</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver's License</option>
                    <option value="Employee ID">Company Employee ID</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">ID Proof Number</label>
                  <input
                    type="text"
                    name="idProofNumber"
                    placeholder="e.g. DL-1234567"
                    className="input"
                    value={formData.idProofNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Residential / Office Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="City, State"
                    className="input"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                2. Visit Information & Host
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Whom to Visit (Host / Employee) *</label>
                  <select
                    name="hostId"
                    required
                    className="input"
                    value={formData.hostId}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Host --</option>
                    {hosts.map(h => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.department || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Visit Date *</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    required
                    className="input"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Visit Time *</label>
                  <input
                    type="time"
                    name="scheduledTime"
                    required
                    className="input"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="label">Purpose of Visit *</label>
                  <input
                    type="text"
                    name="purpose"
                    required
                    placeholder="e.g. Business Meeting, Interview, Delivery"
                    className="input"
                    value={formData.purpose}
                    onChange={handleChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Additional Notes</label>
                  <textarea
                    name="notes"
                    rows="2"
                    placeholder="Any specific instructions or items you are carrying"
                    className="input"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center">
                <CameraIcon className="h-5 w-5 mr-2 text-blue-600" />
                3. Visitor Photo (Badge & Identification)
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {}
                <div className="w-32 h-32 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <label className="btn btn-secondary cursor-pointer inline-flex items-center text-sm">
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {!isCameraActive ? (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="btn btn-primary inline-flex items-center text-sm"
                      >
                        <CameraIcon className="w-4 h-4 mr-1.5" />
                        Take Selfie / Camera
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="btn btn-primary text-sm"
                        >
                          Snap Photo
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="btn btn-danger text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {isCameraActive && (
                    <div className="mt-3">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-48 h-36 bg-black rounded-lg object-cover"
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    A clear photo helps security quickly identify and issue your digital badge upon arrival.
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-base font-semibold shadow-md"
              >
                {loading ? 'Submitting Pre-Registration...' : 'Submit Pre-Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreRegister;
