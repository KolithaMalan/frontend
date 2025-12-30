import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import {
  FiCalendar,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { ridesAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import DriverRideCard from '../../components/rides/DriverRideCard';
import StartRideModal from '../../components/rides/StartRideModal';
import CompleteRideModal from '../../components/rides/CompleteRideModal';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const DailyRides = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
  });

  // Modal states
  const [selectedRide, setSelectedRide] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const fetchRides = useCallback(async (date, showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const response = await ridesAPI.getAll({
        startDate: date.toISOString().split('T')[0],
        endDate: date.toISOString().split('T')[0],
      });

      const allRides = response.data.rides;
      
      // Calculate stats
      const completed = allRides.filter(r => r.status === 'completed').length;
      const active = allRides.filter(r => ['assigned', 'in_progress'].includes(r.status)).length;

      setRides(allRides);
      setStats({
        total: allRides.length,
        completed,
        active,
      });

    } catch (error) {
      console.error('Failed to fetch rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRides(selectedDate);
  }, [selectedDate, fetchRides]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleRefresh = () => {
    fetchRides(selectedDate, false);
  };

  const handleStartRide = (ride) => {
    setSelectedRide(ride);
    setShowStartModal(true);
  };

  const handleCompleteRide = (ride) => {
    setSelectedRide(ride);
    setShowCompleteModal(true);
  };

  const handleRideActionComplete = () => {
    fetchRides(selectedDate, false);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return <Loader fullScreen text="Loading rides..." />;
  }

  // Group rides by status
  const inProgressRides = rides.filter(r => r.status === 'in_progress');
  const assignedRides = rides.filter(r => r.status === 'assigned');
  const completedRides = rides.filter(r => r.status === 'completed');
  const otherRides = rides.filter(r => !['in_progress', 'assigned', 'completed'].includes(r.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Daily Rides</h1>
          <p className="text-gray-500">View and manage your rides by date</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-outline btn-sm"
        >
          <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Date Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="EEEE, MMMM d, yyyy"
                className="input pl-10 pr-4 text-center font-medium min-w-[280px]"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>

          {!isToday(selectedDate) && (
            <button
              onClick={handleToday}
              className="btn btn-outline btn-sm"
            >
              Today
            </button>
          )}
        </div>

        {/* Date Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Rides</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
      </motion.div>

      {/* Rides List */}
      {rides.length > 0 ? (
        <div className="space-y-6">
          {/* In Progress */}
          {inProgressRides.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                In Progress ({inProgressRides.length})
              </h2>
              <div className="space-y-4">
                {inProgressRides.map((ride) => (
                  <DriverRideCard
                    key={ride._id}
                    ride={ride}
                    onComplete={handleCompleteRide}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Assigned */}
          {assignedRides.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiClock className="w-5 h-5 text-purple-500" />
                Assigned ({assignedRides.length})
              </h2>
              <div className="space-y-4">
                {assignedRides.map((ride) => (
                  <DriverRideCard
                    key={ride._id}
                    ride={ride}
                    onStart={handleStartRide}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedRides.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiCheckCircle className="w-5 h-5 text-green-500" />
                Completed ({completedRides.length})
              </h2>
              <div className="space-y-4">
                {completedRides.map((ride) => (
                  <DriverRideCard
                    key={ride._id}
                    ride={ride}
                    showVehicle={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Status */}
          {otherRides.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Other ({otherRides.length})
              </h2>
              <div className="space-y-4">
                {otherRides.map((ride) => (
                  <DriverRideCard
                    key={ride._id}
                    ride={ride}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <EmptyState
            icon={FiCalendar}
            title="No rides for this date"
            description={`You don't have any rides scheduled for ${formatDate(selectedDate, 'MMMM d, yyyy')}.`}
          />
        </motion.div>
      )}

      {/* Start Ride Modal */}
      <StartRideModal
        ride={selectedRide}
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false);
          setSelectedRide(null);
        }}
        onSuccess={handleRideActionComplete}
      />

      {/* Complete Ride Modal */}
      <CompleteRideModal
        ride={selectedRide}
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedRide(null);
        }}
        onSuccess={handleRideActionComplete}
      />
    </div>
  );
};

export default DailyRides;