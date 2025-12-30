import React from 'react';
import { motion } from 'framer-motion';
import {
  FiTruck,
  FiMapPin,
  FiUsers,
  FiSettings,
  FiActivity,
  FiClock,
} from 'react-icons/fi';

const tabs = [
  { id: 'rides', label: 'Ride Management', icon: FiTruck },
  { id: 'tracking', label: 'Live Tracking', icon: FiMapPin, badge: null },
  { id: 'users', label: 'User Management', icon: FiUsers },
  { id: 'vehicles', label: 'Vehicle Management', icon: FiSettings },
  { id: 'mileage', label: 'Vehicle Mileage', icon: FiActivity },
  { id: 'history', label: 'History', icon: FiClock },
];

const AdminTabs = ({ activeTab, onTabChange, badges = {} }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge = badges[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              
              {badge !== undefined && badge !== null && (
                <span
                  className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ${
                    isActive
                      ? 'bg-white text-primary-600'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTabs;