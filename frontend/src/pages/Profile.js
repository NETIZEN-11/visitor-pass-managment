import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });
  const [loading, setLoading] = useState(false);

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
      await axios.put(`/api/users/${user.id}`, formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input bg-gray-100"
              value={user?.email}
              disabled
            />
            <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="label">Role</label>
            <input
              type="text"
              className="input bg-gray-100"
              value={user?.role}
              disabled
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              name="phone"
              className="input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Department</label>
            <input
              type="text"
              name="department"
              className="input"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
