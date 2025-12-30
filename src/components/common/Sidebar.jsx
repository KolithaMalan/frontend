import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiTruck,
  FiSettings,
  FiBell,
  FiLogOut,
  FiCheckCircle,
  FiClipboard,
  FiCalendar,
  FiX,
  FiMap,
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import { ROLE_LABELS, ROLES } from '../../utils/constants';
import { getRoleBadgeColor } from '../../utils/formatters';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /* =========================
     Role-based Navigation
  ========================= */
  const getNavItems = () => {
    const role = user?.role;

    switch (role) {
      case ROLES.USER:
        return [
          { path: '/user', label: 'My Rides', icon: FiTruck },
        ];

      case ROLES.DRIVER:
        return [
          { path: '/driver', label: 'Assigned Rides', icon: FiClipboard },
          { path: '/driver/daily', label: 'My Daily Rides', icon: FiCalendar },
        ];

      case ROLES.ADMIN:
        return [
          { path: '/admin', label: 'Admin Panel', icon: FiHome },
          { path: '/admin/map', label: 'Map View', icon: FiMap },
        ];

      case ROLES.PROJECT_MANAGER:
        return [
          { path: '/pm', label: 'Approvals', icon: FiCheckCircle },
          { path: '/pm/map', label: 'Map View', icon: FiMap },
        ];

      default:
        return [];
    }
  };

  const quickActions = [
    { path: '/alerts', label: 'Alerts', icon: FiBell },
    { path: '/settings', label: 'Settings', icon: FiSettings },
  ];

  const getRoleGradient = (role) => {
    const gradients = {
      user: 'from-blue-500 to-blue-700',
      driver: 'from-purple-500 to-purple-700',
      admin: 'from-green-500 to-green-700',
      project_manager: 'from-amber-500 to-amber-700',
    };
    return gradients[role] || gradients.user;
  };

  /* =========================
     Sidebar Content
  ========================= */
  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <FiTruck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">RideManager</h1>
            <p className="text-xs text-gray-500">Transport Solutions</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRoleGradient(
              user?.role
            )} flex items-center justify-center text-white font-semibold`}
          >
            {getInitials(user?.name)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <span
              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getRoleBadgeColor(
                user?.role
              )}`}
            >
              {ROLE_LABELS[user?.role]}
            </span>
          </div>

          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {getNavItems().map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
            onClick={() => onClose?.()}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Quick Actions */}
        <div className="pt-6">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Quick Actions
          </p>

          {quickActions.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={() => onClose?.()}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  /* =========================
     Desktop + Mobile Wrapper
  ========================= */
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        {sidebarContent}
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />

            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>

              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
