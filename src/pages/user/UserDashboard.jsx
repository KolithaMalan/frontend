import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiNavigation,
  FiCalendar,
  FiTrash2,
  FiXCircle,
  FiAlertTriangle,
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
      const [statsRes, ridesRes] = await Promise.allSettled([
        ridesAPI.getMyStats(),
        ridesAPI.getAll({ limit: 20 }),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.stats);
      }
      if (ridesRes.status === 'fulfilled') {
        setRecentRides(ridesRes.value.data.rides);
      }
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

  const handleDeleteRide = async (rideId) => {
    try {
      await ridesAPI.delete(rideId);
      toast.success('Ride request deleted successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete ride';
      toast.error(message);
    }
  };

  const handleCancelRide = async (rideId) => {
    try {
      await ridesAPI.cancel(rideId);
      toast.success('Ride cancelled successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel ride';
      toast.error(message);
    }
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
          <h2 className="text-lg font-semibold text-gray-900">My Rides</h2>
        </div>

        {recentRides.length > 0 ? (
          <div className="space-y-4">
            {recentRides.map((ride) => (
              <RideCard
                key={ride._id}
                ride={ride}
                onDelete={handleDeleteRide}
                onCancel={handleCancelRide}
              />
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
const RideCard = ({ ride, onDelete, onCancel }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Determine if ride can be deleted (pending states + cancelled + rejected)
  const canDelete = ['pending', 'awaiting_pm', 'awaiting_admin', 'cancelled', 'rejected'].includes(ride.status);
  // Determine if ride can be cancelled (only pending states, not already cancelled)
  const canCancel = ['pending', 'awaiting_pm', 'awaiting_admin'].includes(ride.status);

  const handleDelete = async () => {
    setActionLoading(true);
    await onDelete(ride._id);
    setActionLoading(false);
    setShowDeleteConfirm(false);
  };

  const handleCancel = async () => {
    setActionLoading(true);
    await onCancel(ride._id);
    setActionLoading(false);
    setShowCancelConfirm(false);
  };

  return (
    <div className={`border rounded-xl p-4 hover:shadow-md transition-shadow relative ${
      canCancel ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'
    }`}>
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
        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-2">
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

      {/* ========== ACTION BUTTONS - Full Width Bar ========== */}
      {(canCancel || canDelete) && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
          {canCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-orange-700 bg-orange-100 border-2 border-orange-300 rounded-xl hover:bg-orange-200 transition-colors"
            >
              <FiXCircle className="w-4 h-4" />
              Cancel Ride
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-100 border-2 border-red-300 rounded-xl hover:bg-red-200 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete Ride
            </button>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Ride</h3>
                  <p className="text-sm text-gray-500">Ride {formatRideId(ride.rideId)}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this ride request? The ride will be marked as cancelled.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn btn-outline flex-1"
                  disabled={actionLoading}
                >
                  Keep Ride
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FiXCircle className="w-4 h-4" />
                      Cancel Ride
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Ride</h3>
                  <p className="text-sm text-gray-500">Ride {formatRideId(ride.rideId)}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to permanently delete this ride request? This action cannot be undone and the ride will be removed from the system.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-outline flex-1"
                  disabled={actionLoading}
                >
                  Keep Ride
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
