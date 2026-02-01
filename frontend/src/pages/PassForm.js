import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PassForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    visitorId: '',
    hostId: '',
    validFrom: '',
    validUntil: '',
    purpose: ''
  });

  useEffect(() => {
    fetchVisitors();
    fetchEmployees();
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await axios.get('/api/visitors');
      setVisitors(response.data.visitors);
    } catch (error) {
      toast.error('Failed to fetch visitors');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/users/role/employees');
      setEmployees(response.data.employees);
    } catch (error) {
      toast.error('Failed to fetch employees');
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
      await axios.post('/api/passes', formData);
      toast.success('Pass issued successfully');
      navigate('/passes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue pass');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Issue Visitor Pass</h2>

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

          <div>
            <label className="label">Select Host *</label>
            <select
              name="hostId"
              required
              className="input"
              value={formData.hostId}
              onChange={handleChange}
            >
              <option value="">Choose a host</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} - {employee.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="label">Valid From *</label>
              <input
                type="datetime-local"
                name="validFrom"
                required
                className="input"
                value={formData.validFrom}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Valid Until *</label>
              <input
                type="datetime-local"
                name="validUntil"
                required
                className="input"
                value={formData.validUntil}
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
              placeholder="Purpose of visit"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/passes')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Issuing...' : 'Issue Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassForm;
