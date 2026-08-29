import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { exportToCSV } from '../utils/exportUtils';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAppointments();

  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/api/appointments', { params });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/appointments/${id}/approve`);
      toast.success('Appointment approved successfully');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve appointment');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      await axios.put(`/api/appointments/${id}/reject`, { rejectionReason: reason || 'Not available' });
      toast.info('Appointment rejected');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject appointment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`/api/appointments/${id}`);
        toast.success('Appointment deleted');
        fetchAppointments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete appointment');
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredAppointments.map(a => ({
      'Visitor Name': a.visitor?.name || 'N/A',
      'Visitor Email': a.visitor?.email || 'N/A',
      'Visitor Phone': a.visitor?.phone || 'N/A',
      'Host Name': a.host?.name || 'N/A',
      'Scheduled Date': new Date(a.scheduledDate).toLocaleDateString(),
      'Scheduled Time': a.scheduledTime,
      'Purpose': a.purpose,
      'Status': a.status,
      'Location': a.location || 'Office'
    }));
    exportToCSV(exportData, `appointments-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredAppointments = appointments.filter(a => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      a.visitor?.name?.toLowerCase().includes(term) ||
      a.host?.name?.toLowerCase().includes(term) ||
      a.purpose?.toLowerCase().includes(term)
    );
  });

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments & Invites</h1>
          <p className="mt-1 text-sm text-gray-500">Manage pre-registered visits and visitor invitations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn btn-secondary flex items-center text-sm">
            <DocumentArrowDownIcon className="h-5 w-5 mr-1.5" />
            Export CSV
          </button>
          <Link to="/appointments/new" className="btn btn-primary flex items-center text-sm">
            <PlusIcon className="h-5 w-5 mr-1.5" />
            New Appointment
          </Link>
        </div>
      </div>

      {}
      <div className="card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search visitor, host or purpose..."
            className="input pl-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredAppointments.map((appointment) => (
          <div key={appointment._id} className="card flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  {appointment.visitor?.photo ? (
                    <img src={appointment.visitor.photo} alt="" className="h-12 w-12 rounded-full object-cover border" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      {appointment.visitor?.name?.charAt(0) || 'V'}
                    </div>
                  )}
                  <div className="ml-3">
                    <h3 className="text-lg font-bold text-gray-900">{appointment.visitor?.name}</h3>
                    <p className="text-xs text-gray-500">{appointment.visitor?.email} • {appointment.visitor?.phone}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-700 bg-gray-50 p-3.5 rounded-xl mb-4">
                <p><span className="font-semibold text-gray-900">Host:</span> {appointment.host?.name} ({appointment.host?.department || 'Staff'})</p>
                <p><span className="font-semibold text-gray-900">Date & Time:</span> {new Date(appointment.scheduledDate).toLocaleDateString()} at {appointment.scheduledTime}</p>
                <p><span className="font-semibold text-gray-900">Purpose:</span> {appointment.purpose}</p>
                {appointment.notes && <p><span className="font-semibold text-gray-900">Notes:</span> {appointment.notes}</p>}
              </div>
            </div>

            {}
            <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2 flex-1">
                {appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(appointment._id)}
                      className="btn btn-success text-xs py-1.5 px-3 flex items-center"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(appointment._id)}
                      className="btn btn-danger text-xs py-1.5 px-3 flex items-center"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </>
                )}
                {appointment.status === 'approved' && (
                  <Link
                    to="/passes/new"
                    className="btn btn-primary text-xs py-1.5 px-3 flex items-center"
                  >
                    <TicketIcon className="h-4 w-4 mr-1" />
                    Issue Pass
                  </Link>
                )}
              </div>

              <button
                onClick={() => handleDelete(appointment._id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}
    </div>
  );
};

export default Appointments;
