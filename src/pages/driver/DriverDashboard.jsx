import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiTruck,
  FiCheckCircle,
  FiPlay,
  FiMapPin,
  FiNavigation,
  FiUser,
  FiPhone,
  FiCalendar,
  FiClock,
  FiRefreshCw,
  FiPlus,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ridesAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import RideRequestForm from '../../components/rides/RideRequestForm';
import { formatDate, formatTime, formatDistance, formatRideId } from '../../utils/formatters';
import { RIDE_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [assignedRides, setAssignedRides] = useState([]);
  const [dailyRides, setDailyRides] = useState([]);
  const [dailyStats, setDailyStats] = useState({ active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('assigned');
  
  // Mileage modals
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [mileage, setMileage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Request Ride modal
  const [showRideForm, setShowRideForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignedRes, dailyRes] = await Promise.all([
        ridesAPI.getDriverAssigned(),
        ridesAPI.getDriverDaily(),
      ]);

      setAssignedRides(assignedRes.data.rides);
      setDailyRides(dailyRes.data.rides);
      setDailyStats(dailyRes.data.stats);
    } catch (error) {
      toast.error('Failed to load rides');
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
    setShowRideForm(false);
    toast.success('Ride request submitted successfully!');
    fetchData();
  };

  const handleStartRide = async () => {
    if (!mileage || isNaN(parseFloat(mileage))) {
      toast.error('Please enter a valid start mileage');
      return;
    }

    setActionLoading(true);
    try {
      await ridesAPI.startRide(selectedRide._id, parseFloat(mileage));
      toast.success('Ride started successfully!');
      setShowStartModal(false);
      setMileage('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!mileage || isNaN(parseFloat(mileage))) {
      toast.error('Please enter a valid end mileage');
      return;
    }

    if (parseFloat(mileage) < selectedRide.startMileage) {
      toast.error('End mileage cannot be less than start mileage');
      return;
    }

    setActionLoading(true);
    try {
      await ridesAPI.completeRide(selectedRide._id, parseFloat(mileage));
      toast.success('Ride completed successfully!');
      setShowCompleteModal(false);
      setMileage('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete ride');
    } finally {
      setActionLoading(false);
    }
  };

  const openStartModal = (ride) => {
    setSelectedRide(ride);
    setMileage('');
    setShowStartModal(true);
  };

  const openCompleteModal = (ride) => {
    setSelectedRide(ride);
    setMileage('');
    setShowCompleteModal(true);
  };

  if (loading) {
    return <Loader fullScreen text="Loading your rides..." />;
  }

  const tabs = [
    { id: 'assigned', label: 'My Assigned Rides', count: assignedRides.length },
    { id: 'daily', label: 'My Daily Rides', count: dailyRides.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600">Manage your assigned rides</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline"
          >
            <FiRefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowRideForm(true)}
            className="btn btn-primary"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Request Ride
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Active Rides"
            value={dailyStats.active}
            icon={FiTruck}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            subtitle="Today"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Completed Rides"
            value={dailyStats.completed}
            icon={FiCheckCircle}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            subtitle="Today"
          />
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <nav className="flex gap-2 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm
                transition-all duration-200 flex-1
                ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {tab.id === 'assigned' ? (
                <FiTruck className="w-4 h-4" />
              ) : (
                <FiCalendar className="w-4 h-4" />
              )}
              <span>{tab.label}</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                }
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Ride Cards */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {activeTab === 'assigned' && (
          assignedRides.length > 0 ? (
            assignedRides.map((ride) => (
              <DriverRideCard
                key={ride._id}
                ride={ride}
                onStart={() => openStartModal(ride)}
                onComplete={() => openCompleteModal(ride)}
              />
            ))
          ) : (
            <div className="card">
              <EmptyState
                icon={FiTruck}
                title="No Assigned Rides"
                description="You don't have any rides assigned at the moment. Check back later!"
              />
            </div>
          )
        )}

        {activeTab === 'daily' && (
          dailyRides.length > 0 ? (
            dailyRides.map((ride) => (
              <DriverRideCard
                key={ride._id}
                ride={ride}
                onStart={() => openStartModal(ride)}
                onComplete={() => openCompleteModal(ride)}
              />
            ))
          ) : (
            <div className="card">
              <EmptyState
                icon={FiCalendar}
                title="No Rides Today"
                description="You don't have any rides scheduled for today."
              />
            </div>
          )
        )}
      </motion.div>

      {/* Start Ride Modal */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Start Ride"
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
            <FiPlay className="w-5 h-5 text-blue-600" />
            <p className="text-blue-900 font-medium">Starting Ride #{selectedRide?.rideId}</p>
          </div>
          
          <p className="text-gray-600 mb-4">
            Enter the current odometer reading to start this ride.
          </p>
          
          <div className="mb-6">
            <label className="label">Start Mileage (km)</label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="e.g., 45230.5"
              className="input"
              step="0.1"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowStartModal(false)}
              className="btn btn-outline flex-1"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleStartRide}
              className="btn btn-success flex-1"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                <>
                  <FiPlay className="w-5 h-5 mr-2" />
                  Start Ride
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Complete Ride Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Ride"
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-lg">
            <FiCheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-900 font-medium">Completing Ride #{selectedRide?.rideId}</p>
          </div>

          <p className="text-gray-600 mb-2">
            Enter the final odometer reading to complete this ride.
          </p>
          
          {selectedRide && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-600">Start mileage</p>
              <p className="text-lg font-bold text-gray-900">{selectedRide.startMileage} km</p>
            </div>
          )}
          
          <div className="mb-6">
            <label className="label">End Mileage (km)</label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="e.g., 45245.8"
              className="input"
              step="0.1"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowCompleteModal(false)}
              className="btn btn-outline flex-1"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteRide}
              className="btn btn-success flex-1"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Completing...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                  Complete Ride
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Request Ride Modal */}
      <RideRequestForm
        isOpen={showRideForm}
        onClose={() => setShowRideForm(false)}
        onSuccess={handleRideCreated}
      />
    </div>
  );
};

// Driver Ride Card Component
const DriverRideCard = ({ ride, onStart, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="font-semibold text-gray-900 text-lg">
          Ride {formatRideId(ride.rideId)}
        </span>
        <span className="text-gray-400">•</span>
        <span className="badge badge-info">{RIDE_TYPE_LABELS[ride.rideType]}</span>
        <StatusBadge status={ride.status} type="ride" />
      </div>

      {/* Scheduled Date */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
        <FiCalendar className="w-4 h-4" />
        <span>Scheduled for {formatDate(ride.scheduledDate)} at {formatTime(ride.scheduledTime)}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left - Location Details */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {ride.requester?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">
                {ride.requester?.name || 'Customer'}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <FiPhone className="w-3.5 h-3.5" />
                {ride.requester?.phone}
              </p>
            </div>
          </div>

          {/* Pickup */}
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <FiMapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-600 font-semibold uppercase mb-1">Pickup Location</p>
              <p className="text-sm text-gray-900 leading-relaxed">{ride.pickupLocation?.address}</p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <FiNavigation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-600 font-semibold uppercase mb-1">Destination</p>
              <p className="text-sm text-gray-900 leading-relaxed">{ride.destinationLocation?.address}</p>
            </div>
          </div>
        </div>

        {/* Right - Vehicle & Actions */}
        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <FiTruck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-purple-900 text-lg">
                  {ride.assignedVehicle?.vehicleNumber}
                </p>
                <p className="text-sm text-purple-700">{ride.assignedVehicle?.type}</p>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
          </div>

          {/* Distance & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Distance</p>
              <p className="text-lg font-bold text-gray-900">
                {formatDistance(ride.calculatedDistance)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Time</p>
              <p className="text-lg font-bold text-gray-900">
                {formatTime(ride.scheduledTime)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {ride.status === 'assigned' && (
            <button
              onClick={onStart}
              className="btn btn-success w-full py-3"
            >
              <FiPlay className="w-5 h-5 mr-2" />
              Start Ride
            </button>
          )}

          {ride.status === 'in_progress' && (
            <button
              onClick={onComplete}
              className="btn btn-primary w-full py-3"
            >
              <FiCheckCircle className="w-5 h-5 mr-2" />
              Complete Ride
            </button>
          )}

          {ride.status === 'completed' && (
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-green-900 font-bold mb-1">Ride Completed</p>
              {ride.actualDistance && (
                <p className="text-sm text-green-700">
                  Distance traveled: {formatDistance(ride.actualDistance)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DriverDashboard;