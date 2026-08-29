import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  TicketIcon,
  ClipboardDocumentListIcon,
  QrCodeIcon,
  UsersIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'security', 'employee'] },
    { name: 'Visitors', href: '/visitors', icon: UserGroupIcon, roles: ['admin', 'security', 'employee'] },
    { name: 'Appointments', href: '/appointments', icon: CalendarIcon, roles: ['admin', 'security', 'employee'] },
    { name: 'Passes', href: '/passes', icon: TicketIcon, roles: ['admin', 'security', 'employee'] },
    { name: 'Check Logs', href: '/checklogs', icon: ClipboardDocumentListIcon, roles: ['admin', 'security'] },
    { name: 'QR Scanner', href: '/scanner', icon: QrCodeIcon, roles: ['admin', 'security'] },
    { name: 'Activity Logs', href: '/activitylogs', icon: ClipboardDocumentListIcon, roles: ['admin', 'security', 'employee'] },
    { name: 'Users', href: '/users', icon: UsersIcon, roles: ['admin'] }
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
          <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
            <span className="text-xl font-bold text-white">Visitor Pass</span>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 bg-blue-600">
            <span className="text-xl font-bold text-white">Visitor Pass</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {}
      <div className="lg:pl-64">
        {}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center justify-between flex-1 px-4">
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name} ({user?.role})
              </span>
              <Link to="/profile" className="text-gray-500 hover:text-gray-700">
                <UserCircleIcon className="h-6 w-6" />
              </Link>
              <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
