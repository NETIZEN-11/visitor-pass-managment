import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [formData, setFormData] = useState({
    visitorId: '',
    scheduledDate: '',
    scheduledTime: '',
    purpose: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await axios.get('/api/visitors');
      setVisitors(response.data.visitors);
    } catch (error) {
      toast.error('Failed to fetch visitors');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/appointments', formData);
      toast.success('Appointment created successfully');
      navigate('/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Select Visitor *</label>
            <select
              name="visitorId"
              required
              className="input"
              value={formData.visitorId}
              onChange={handleChange}
            >
              <option value="">Choose a visitor</option>
              {visitors.map((visitor) => (
                <option key={visitor._id} value={visitor._id}>
                  {visitor.name} - {visitor.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                name="scheduledDate"
                required
                className="input"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="label">Time *</label>
              <input
                type="time"
                name="scheduledTime"
                required
                className="input"
                value={formData.scheduledTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Purpose *</label>
            <input
              type="text"
              name="purpose"
              required
              className="input"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="e.g., Business meeting, Interview"
            />
          </div>

          <div>
            <label className="label">Location</label>
            <input
              type="text"
              name="location"
              className="input"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Conference Room A"
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              rows="3"
              className="input"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
