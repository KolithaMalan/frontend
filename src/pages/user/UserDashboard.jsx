import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiNavigation,
  FiCalendar,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ridesAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import RideRequestForm from '../../components/rides/RideRequestForm';
import { formatDate, formatTime, formatDistance, formatRideId } from '../../utils/formatters';
import { RIDE_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRides: 0,
    completedRides: 0,
    pendingRides: 0,
    totalDistance: 0,
  });
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRideModal, setShowRideModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ridesRes] = await Promise.all([
        ridesAPI.getMyStats(),
        ridesAPI.getAll({ limit: 5 }),
      ]);

      setStats(statsRes.data.stats);
      setRecentRides(ridesRes.data.rides);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleRideCreated = () => {
    setShowRideModal(false);
    fetchData();
  };

  if (loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Rides</h1>
          <p className="text-gray-600">Manage and track your ride requests</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline"
          >
            <FiRefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => setShowRideModal(true)} className="btn btn-primary">
            <FiPlus className="w-5 h-5 mr-2" />
            Request New Ride
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Total Rides"
            value={stats.totalRides}
            icon={FiTruck}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            subtitle="All time"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Completed Rides"
            value={stats.completedRides}
            icon={FiCheckCircle}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            subtitle="Successfully finished"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            title="Pending Rides"
            value={stats.pendingRides}
            icon={FiClock}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
            subtitle="Awaiting action"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            title="Total Distance"
            value={`${stats.totalDistance} km`}
            icon={FiNavigation}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            subtitle="Kilometers traveled"
          />
        </motion.div>
      </div>

      {/* Recent Rides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Rides</h2>
          <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </a>
        </div>

        {recentRides.length > 0 ? (
          <div className="space-y-4">
            {recentRides.map((ride) => (
              <RideCard key={ride._id} ride={ride} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FiTruck className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No rides yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't requested any rides yet. Click the button below to request your first ride.
            </p>
            <button 
              onClick={() => setShowRideModal(true)} 
              className="btn btn-primary inline-flex items-center"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Request New Ride
            </button>
          </div>
        )}
      </motion.div>

      {/* Ride Request Modal */}
      <RideRequestForm
        isOpen={showRideModal}
        onClose={() => setShowRideModal(false)}
        onSuccess={handleRideCreated}
      />
    </div>
  );
};

// Ride Card Component
const RideCard = ({ ride }) => {
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Ride Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-semibold text-gray-900">
              Ride {formatRideId(ride.rideId)}
            </span>
            <StatusBadge status={ride.status} type="ride" />
            <span className="badge badge-info">
              {RIDE_TYPE_LABELS[ride.rideType]}
            </span>
          </div>

          {/* Status Message */}
          <p className="text-sm text-gray-600 mb-4">
            {getStatusMessage(ride)}
          </p>

          {/* Locations */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiMapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">PICKUP</p>
                <p className="text-sm text-gray-900 truncate" title={ride.pickupLocation?.address}>
                  {ride.pickupLocation?.address}
                </p>
              </div>
            </div>

            {/* Destination */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiNavigation className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">DESTINATION</p>
                <p className="text-sm text-gray-900 truncate" title={ride.destinationLocation?.address}>
                  {ride.destinationLocation?.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side info */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-2 text-right">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
            <FiNavigation className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-900">
              {formatDistance(ride.calculatedDistance)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FiCalendar className="w-4 h-4" />
            <span>{formatDate(ride.scheduledDate)}</span>
            <span>{formatTime(ride.scheduledTime)}</span>
          </div>
        </div>
      </div>

      {/* Driver Info (if assigned) */}
      {ride.assignedDriver && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-700 font-semibold text-sm">
                {ride.assignedDriver.name?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {ride.assignedDriver.name}
              </p>
              <p className="text-xs text-gray-500">
                {ride.assignedVehicle?.vehicleNumber} • {ride.assignedDriver.phone}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for status messages
const getStatusMessage = (ride) => {
  const messages = {
    pending: 'Your ride request is being processed.',
    awaiting_pm: 'Awaiting Plant Manager approval (Long distance ride).',
    awaiting_admin: 'Awaiting Admin approval.',
    pm_approved: 'Approved by PM. Waiting for driver assignment.',
    approved: 'Approved. Waiting for driver assignment.',
    assigned: 'Driver assigned – Waiting to start.',
    in_progress: 'Your ride is in progress.',
    completed: 'Ride completed successfully.',
    rejected: 'Your ride request was rejected.',
    cancelled: 'Ride was cancelled.',
  };
  return messages[ride.status] || 'Status unknown';
};

export default UserDashboard;
