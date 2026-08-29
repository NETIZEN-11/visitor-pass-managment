import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CameraIcon, UserIcon } from '@heroicons/react/24/outline';

const VisitorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idProof: 'National ID',
    idProofNumber: '',
    company: '',
    address: '',
    purpose: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchVisitor();
    }
    return () => {
      stopCamera();
    };

  }, [id]);

  const fetchVisitor = async () => {
    try {
      const response = await axios.get(`/api/visitors/${id}`);
      setFormData(response.data.visitor);
      if (response.data.visitor.photo) {
        setPhotoPreview(response.data.visitor.photo);
      }
    } catch (error) {
      toast.error('Failed to fetch visitor');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
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
      setPhoto(null);
      stopCamera();
      toast.success('Live photo captured!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key] || '');
      });
      if (photo) {
        data.append('photo', photo);
      } else if (photoPreview && photoPreview.startsWith('data:image')) {
        data.append('photoBase64', photoPreview);
      }

      if (id) {
        await axios.put(`/api/visitors/${id}`, data);
        toast.success('Visitor updated successfully');
      } else {
        await axios.post('/api/visitors', data);
        toast.success('Visitor created successfully');
      }
      navigate('/visitors');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {id ? 'Edit Visitor' : 'Add New Visitor'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                className="input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Phone *</label>
              <input
                type="tel"
                name="phone"
                required
                className="input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Company</label>
              <input
                type="text"
                name="company"
                className="input"
                value={formData.company || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">ID Proof Type</label>
              <select
                name="idProof"
                className="input"
                value={formData.idProof || 'National ID'}
                onChange={handleChange}
              >
                <option value="National ID">National ID / Aadhaar</option>
                <option value="Passport">Passport</option>
                <option value="Driver License">Driver License</option>
                <option value="Employee ID">Employee ID</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">ID Proof Number</label>
              <input
                type="text"
                name="idProofNumber"
                className="input"
                value={formData.idProofNumber || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <textarea
              name="address"
              rows="2"
              className="input"
              value={formData.address || ''}
              onChange={handleChange}
            ></textarea>
          </div>

          <div>
            <label className="label">Purpose of Visit</label>
            <input
              type="text"
              name="purpose"
              className="input"
              value={formData.purpose || ''}
              onChange={handleChange}
            />
          </div>

          {}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <label className="label font-semibold">Visitor Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center border border-gray-300">
                {photoPreview ? (
                  <img src={photoPreview} alt="Visitor" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="btn btn-secondary cursor-pointer text-xs">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn btn-primary text-xs flex items-center"
                  >
                    <CameraIcon className="w-4 h-4 mr-1" />
                    Webcam Capture
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="btn btn-primary text-xs"
                    >
                      Snap Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="btn btn-danger text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isCameraActive && (
              <div className="mt-2">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-48 h-36 bg-black rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/visitors')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : id ? 'Update Visitor' : 'Create Visitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitorForm;
