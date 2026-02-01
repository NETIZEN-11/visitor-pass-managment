import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VisitorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idProof: '',
    idProofNumber: '',
    company: '',
    address: '',
    purpose: ''
  });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (id) {
      fetchVisitor();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchVisitor = async () => {
    try {
      const response = await axios.get(`/api/visitors/${id}`);
      setFormData(response.data.visitor);
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
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (photo) {
        data.append('photo', photo);
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
                <option value="">Select ID Proof</option>
                <option value="Passport">Passport</option>
                <option value="Driver License">Driver License</option>
                <option value="National ID">National ID</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">ID Proof Number</label>
              <input
                type="text"
                name="idProofNumber"
                className="input"
                value={formData.idProofNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <textarea
              name="address"
              rows="3"
              className="input"
              value={formData.address}
              onChange={handleChange}
            ></textarea>
          </div>

          <div>
            <label className="label">Purpose of Visit</label>
            <input
              type="text"
              name="purpose"
              className="input"
              value={formData.purpose}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="input"
            />
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
