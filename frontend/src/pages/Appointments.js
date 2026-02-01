import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/api/appointments', { params });
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/appointments/${id}/approve`);
      toast.success('Appointment approved');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to approve appointment');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await axios.put(`/api/appointments/${id}/reject`, { rejectionReason: reason });
        toast.success('Appointment rejected');
        fetchAppointments();
      } catch (error) {
        toast.error('Failed to reject appointment');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
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
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <Link to="/appointments/new" className="btn btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Appointment
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex space-x-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {appointments.map((appointment) => (
          <div key={appointment._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                {appointment.visitor?.photo ? (
                  <img src={appointment.visitor.photo} alt="" className="h-12 w-12 rounded-full" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                )}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold">{appointment.visitor?.name}</h3>
                  <p className="text-sm text-gray-500">{appointment.visitor?.email}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Host:</span> {appointment.host?.name}</p>
              <p><span className="font-medium">Date:</span> {new Date(appointment.scheduledDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Time:</span> {appointment.scheduledTime}</p>
              <p><span className="font-medium">Purpose:</span> {appointment.purpose}</p>
              {appointment.location && <p><span className="font-medium">Location:</span> {appointment.location}</p>}
            </div>

            {appointment.status === 'pending' && (
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleApprove(appointment._id)}
                  className="btn btn-success flex-1 flex items-center justify-center"
                >
                  <CheckIcon className="h-5 w-5 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(appointment._id)}
                  className="btn btn-danger flex-1 flex items-center justify-center"
                >
                  <XMarkIcon className="h-5 w-5 mr-1" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}
    </div>
  );
};

export default Appointments;
