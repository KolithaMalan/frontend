import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiNavigation,
  FiCalendar,
  FiClock,
  FiUser,
  FiTruck,
  FiCheck,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';
import StatusBadge from '../common/StatusBadge';
import { ridesAPI } from '../../services/api';
import { formatDate, formatTime, formatDistance } from '../../utils/formatters';
import { RIDE_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const AssignmentCard = ({ ride, drivers = [], vehicles = [], onAssigned, onReassigned }) => {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const isAssigned = ride.status === 'assigned';

  // Pre-select current driver and vehicle if ride is already assigned
  useEffect(() => {
    if (isAssigned && ride.assignedDriver && ride.assignedVehicle) {
      setSelectedDriver(ride.assignedDriver._id);
      setSelectedVehicle(ride.assignedVehicle._id);
    }
  }, [isAssigned, ride.assignedDriver, ride.assignedVehicle]);

  useEffect(() => {
    if (ride.scheduledDate && ride.scheduledTime) {
      fetchAvailability();
    }
  }, [ride.scheduledDate, ride.scheduledTime, ride._id]);

  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    try {
      const date = new Date(ride.scheduledDate).toISOString().split('T')[0];
      
      console.log('🔍 Fetching availability for:', { date, time: ride.scheduledTime, rideId: ride._id });
      
      const [driversRes, vehiclesRes] = await Promise.all([
        ridesAPI.getAvailableDrivers({ date, time: ride.scheduledTime, excludeRideId: ride._id }),
        ridesAPI.getAvailableVehicles({ date, time: ride.scheduledTime, excludeRideId: ride._id }),
      ]);

      console.log('✅ Available drivers:', driversRes.data.drivers);
      console.log('✅ Available vehicles:', vehiclesRes.data.vehicles);

      setAvailableDrivers(driversRes.data.drivers || []);
      setAvailableVehicles(vehiclesRes.data.vehicles || []);
    } catch (error) {
      console.error('❌ Failed to fetch availability:', error);
      toast.error('Failed to load available drivers/vehicles');
      // Fallback to provided lists
      setAvailableDrivers(drivers);
      setAvailableVehicles(vehicles);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriver || !selectedVehicle) {
      toast.error('Please select both driver and vehicle');
      return;
    }

    console.log('🚀 Assignment action:', {
      isReassign: isAssigned,
      rideId: ride._id,
      driverId: selectedDriver,
      vehicleId: selectedVehicle
    });

    setLoading(true);
    try {
      if (isAssigned) {
        // REASSIGN
        console.log('🔄 Calling reassign API...');
        const response = await ridesAPI.reassign(ride._id, {
          driverId: selectedDriver,
          vehicleId: selectedVehicle,
        });
        console.log('✅ Reassign response:', response.data);
        toast.success('Ride reassigned successfully! All parties notified.');
        onReassigned?.(response.data.ride);
      } else {
        // ASSIGN
        console.log('✨ Calling assign API...');
        const response = await ridesAPI.assign(ride._id, {
          driverId: selectedDriver,
          vehicleId: selectedVehicle,
        });
        console.log('✅ Assign response:', response.data);
        toast.success('Driver and vehicle assigned successfully!');
        onAssigned?.(response.data.ride);
      }
    } catch (error) {
      console.error('❌ Assignment error:', error);
      console.error('Error response:', error.response?.data);
      
      const message = error.response?.data?.message || `Failed to ${isAssigned ? 'reassign' : 'assign'}`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Ride #{ride.rideId}
            </h3>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {RIDE_TYPE_LABELS[ride.rideType] || ride.rideType}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              {formatDate(ride.scheduledDate)}
            </span>
            <span className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              {formatTime(ride.scheduledTime)}
            </span>
            <span className="font-medium text-gray-700">
              {formatDistance(ride.calculatedDistance)}
            </span>
          </div>
        </div>

        <StatusBadge status={ride.status} type="ride" />
      </div>

      {/* Locations - Compact */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FiMapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="truncate text-gray-700">{ride.pickupLocation?.address}</span>
        </div>
        <span className="text-gray-400">→</span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FiNavigation className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="truncate text-gray-700">{ride.destinationLocation?.address}</span>
        </div>
      </div>

      {/* Requester */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <FiUser className="w-4 h-4 text-gray-400" />
        <span className="text-gray-500">Requester:</span>
        <span className="font-medium text-gray-900">{ride.requester?.name}</span>
        <span className="text-gray-400">({ride.requester?.email})</span>
      </div>

      {/* Current Assignment (if assigned) */}
      {isAssigned && ride.assignedDriver && ride.assignedVehicle && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs font-medium text-purple-600 uppercase mb-2 flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4" />
            Currently Assigned
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{ride.assignedDriver.name}</p>
                <StatusBadge status={ride.assignedDriver.status} type="driver" size="sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiTruck className="w-4 h-4 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{ride.assignedVehicle.vehicleNumber}</p>
                <StatusBadge status={ride.assignedVehicle.status} type="vehicle" size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Driver Selection */}
        <div>
          <label className="label flex items-center gap-2">
            <FiUser className="w-4 h-4" />
            {isAssigned ? 'Change Driver' : 'Select Driver'}
            {loadingAvailability && (
              <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></span>
            )}
          </label>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="select"
            disabled={loadingAvailability}
          >
            <option value="">Choose a driver...</option>
            {availableDrivers.map((driver) => (
              <option
                key={driver._id}
                value={driver._id}
                disabled={!driver.isAvailable && driver._id !== ride.assignedDriver?._id}
              >
                {driver.name} {driver.isAvailable ? '✓ Available' : driver._id === ride.assignedDriver?._id ? '(Current)' : '✗ Busy'}
              </option>
            ))}
          </select>
          {selectedDriver && (
            <p className="text-xs text-gray-500 mt-1">
              {availableDrivers.find(d => d._id === selectedDriver)?.isAvailable 
                ? '✓ This driver is available at the scheduled time' 
                : 'ℹ️ This driver may have other rides at this time'}
            </p>
          )}
        </div>

        {/* Vehicle Selection */}
        <div>
          <label className="label flex items-center gap-2">
            <FiTruck className="w-4 h-4" />
            {isAssigned ? 'Change Vehicle' : 'Select Vehicle'}
          </label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="select"
            disabled={loadingAvailability}
          >
            <option value="">Choose a vehicle...</option>
            {availableVehicles.map((vehicle) => (
              <option
                key={vehicle._id}
                value={vehicle._id}
                disabled={!vehicle.isAvailable && vehicle._id !== ride.assignedVehicle?._id}
              >
                {vehicle.vehicleNumber} ({vehicle.type}) {vehicle.isAvailable ? '✓ Available' : vehicle._id === ride.assignedVehicle?._id ? '(Current)' : '✗ Busy'}
              </option>
            ))}
          </select>
          {selectedVehicle && (
            <p className="text-xs text-gray-500 mt-1">
              {availableVehicles.find(v => v._id === selectedVehicle)?.isAvailable 
                ? '✓ This vehicle is available at the scheduled time' 
                : 'ℹ️ This vehicle may be assigned to other rides'}
            </p>
          )}
        </div>
      </div>

      {/* Assign/Reassign Button - FIXED UI */}
      {/* Assign/Reassign Button - BEAUTIFUL WARNING COLOR */}
      <button
        onClick={handleAssign}
        disabled={loading || !selectedDriver || !selectedVehicle || loadingAvailability}
        className={`w-full ${isAssigned ? 'btn btn-warning' : 'btn btn-primary'}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {isAssigned ? 'Reassigning...' : 'Assigning...'}
          </span>
        ) : (
          <>
            {isAssigned ? (
              <>
                <FiRefreshCw className="w-5 h-5 mr-2" />
                Reassign Driver & Vehicle
              </>
            ) : (
              <>
                <FiCheck className="w-5 h-5 mr-2" />
                Assign Driver & Vehicle
              </>
            )}
          </>
        )}
      </button>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <p>🐛 Debug: Ride Status = <strong>{ride.status}</strong></p>
          <p>🐛 Is Assigned? <strong>{isAssigned ? 'YES' : 'NO'}</strong></p>
          <p>🐛 Selected Driver: <strong>{selectedDriver || 'None'}</strong></p>
          <p>🐛 Selected Vehicle: <strong>{selectedVehicle || 'None'}</strong></p>
        </div>
      )}
    </motion.div>
  );
};

export default AssignmentCard;