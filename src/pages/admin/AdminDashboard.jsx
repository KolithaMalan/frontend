import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiClock,
  FiActivity,
  FiUsers,
  FiTruck,
  FiCheckCircle,
  FiNavigation,
  FiRefreshCw,
  FiPlus,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { reportsAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import UserForm from '../../components/admin/UserFormModal';
import RideRequestForm from '../../components/rides/RideRequestForm';

import LiveTrackingTab from '../../components/admin/tabs/LiveTrackingTab';

// Tab Components
import RideManagementTab from '../../components/admin/tabs/RideManagementTab';
import UserManagementTab from '../../components/admin/tabs/UserManagementTab';
import VehicleManagementTab from '../../components/admin/tabs/VehicleManagementTab';
import VehicleMileageTab from '../../components/admin/tabs/VehicleMileageTab';
import HistoryTab from '../../components/admin/tabs/HistoryTab';

import toast from 'react-hot-toast';

const TABS = [
  { id: 'rides', label: 'Ride Management', icon: FiActivity },
  { id: 'tracking', label: 'Live Tracking', icon: FiNavigation },
  { id: 'users', label: 'User Management', icon: FiUsers },
  { id: 'vehicles', label: 'Vehicle Management', icon: FiTruck },
  { id: 'mileage', label: 'Vehicle Mileage', icon: FiNavigation },
  { id: 'history', label: 'History', icon: FiClock },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('rides');
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    liveRides: 0,
    totalDrivers: 0,
    availableDrivers: 0,
    totalVehicles: 0,
    availableVehicles: 0,
    activeRides: 0,
    completedToday: 0,
    monthlyMileage: 0,
  });

  // Modal states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showRideModal, setShowRideModal] = useState(false);

  const fetchStats = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const response = await reportsAPI.getDashboardStats();
      const data = response.data.stats;

      setStats({
        pendingApprovals: data.pendingApprovals || 0,
        liveRides: data.liveRides || 0,
        totalDrivers: data.drivers?.total || 0,
        availableDrivers: data.drivers?.available || 0,
        totalVehicles: data.vehicles?.total || 0,
        availableVehicles: data.vehicles?.available || 0,
        activeRides: data.activeRides || 0,
        completedToday: data.completedToday || 0,
        monthlyMileage: data.monthlyMileage || 0,
        activeVehicles: data.vehicles?.active || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Auto refresh every 60 seconds
    const interval = setInterval(() => {
      fetchStats(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchStats(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rides':
        return <RideManagementTab />;
      case 'tracking':
      return <LiveTrackingTab />;
      case 'users':
        return <UserManagementTab />;
      case 'vehicles':
        return <VehicleManagementTab />;
      case 'mileage':
        return <VehicleMileageTab />;
      case 'history':
        return <HistoryTab />;
      default:
        return <RideManagementTab />;
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading admin dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage rides, users, and vehicles</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline"
          >
            <FiRefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateUser(true)}
            className="btn btn-secondary"
          >
            <FiUsers className="w-5 h-5 mr-2" />
            Create User
          </button>
          <button
            onClick={() => setShowRideModal(true)}
            className="btn btn-primary"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Request Ride
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={FiClock}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
            onClick={() => setActiveTab('rides')}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Live Rides"
            value={stats.liveRides}
            icon={FiActivity}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() => setActiveTab('tracking')}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            subtitle={`${stats.availableDrivers} available`}
            icon={FiUsers}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            onClick={() => setActiveTab('users')}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Vehicles"
            value={stats.availableVehicles}
            subtitle={`of ${stats.totalVehicles} total`}
            icon={FiTruck}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            onClick={() => setActiveTab('vehicles')}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <StatCard
            title="Active Rides"
            value={stats.activeRides}
            icon={FiNavigation}
            iconBgColor="bg-cyan-100"
            iconColor="text-cyan-600"
            className="hover:shadow-lg transition-shadow"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={FiCheckCircle}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            onClick={() => setActiveTab('history')}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <StatCard
            title="Monthly Mileage"
            value={`${(stats.monthlyMileage / 1000).toFixed(1)}k km`}
            subtitle={`${stats.activeVehicles} vehicles`}
            icon={FiNavigation}
            iconBgColor="bg-rose-100"
            iconColor="text-rose-600"
            onClick={() => setActiveTab('mileage')}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          />
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <nav className="flex gap-1 overflow-x-auto px-4 pt-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap 
                border-b-2 transition-all duration-200 relative
                ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'tracking' && stats.liveRides > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full font-semibold">
                  {stats.liveRides}
                </span>
              )}
              {tab.id === 'rides' && stats.pendingApprovals > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-600 rounded-full font-semibold">
                  {stats.pendingApprovals}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>

      {/* Create User Modal */}
      <UserForm
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSuccess={() => {
          setShowCreateUser(false);
          toast.success('User created successfully!');
        }}
      />

      {/* Request Ride Modal */}
      <RideRequestForm
        isOpen={showRideModal}
        onClose={() => setShowRideModal(false)}
        onSuccess={() => {
          setShowRideModal(false);
          toast.success('Ride request submitted successfully!');
        }}
      />
    </div>
  );
};

export default AdminDashboard;