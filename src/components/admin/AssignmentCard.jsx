// Updated AssignmentCard.jsx
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
  FiZap,
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
      const [driversRes, vehiclesRes] = await Promise.all([
        ridesAPI.getAvailableDrivers({ date, time: ride.scheduledTime, excludeRideId: ride._id }),
        ridesAPI.getAvailableVehicles({ date, time: ride.scheduledTime, excludeRideId: ride._id }),
      ]);
      setAvailableDrivers(driversRes.data.drivers || []);
      setAvailableVehicles(vehiclesRes.data.vehicles || []);
    } catch (error) {
      console.error('❌ Failed to fetch availability:', error);
      toast.error('Failed to load available drivers/vehicles');
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

    setLoading(true);
    try {
      if (isAssigned) {
        const response = await ridesAPI.reassign(ride._id, {
          driverId: selectedDriver,
          vehicleId: selectedVehicle,
        });
        toast.success('Ride reassigned successfully! All parties notified.');
        onReassigned?.(response.data.ride);
      } else {
        const response = await ridesAPI.assign(ride._id, {
          driverId: selectedDriver,
          vehicleId: selectedVehicle,
        });
        toast.success('Driver and vehicle assigned successfully!');
        onAssigned?.(response.data.ride);
      }
    } catch (error) {
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
      className="relative rounded-xl overflow-hidden border-2 border-violet-300 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* ===== TOP COLOR STRIPE - ASSIGNED INDICATOR ===== */}
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

      {/* ===== ASSIGNED BADGE - Top Right Corner ===== */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-600 text-white text-xs font-bold rounded-full shadow-lg">
          <FiTruck className="w-3 h-3" />
          ASSIGNED
        </span>
      </div>

      {/* Card Body */}
      <div className="bg-gradient-to-br from-violet-50 via-white to-purple-50/60 p-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pr-24">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Ride #{ride.rideId}
              </h3>
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                {RIDE_TYPE_LABELS[ride.rideType] || ride.rideType}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4 text-violet-400" />
                {formatDate(ride.scheduledDate)}
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="w-4 h-4 text-violet-400" />
                {formatTime(ride.scheduledTime)}
              </span>
              <span className="font-medium text-gray-700">
                {formatDistance(ride.calculatedDistance)}
              </span>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-violet-50 border border-violet-100 rounded-lg text-sm">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiMapPin className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span className="truncate text-gray-700">{ride.pickupLocation?.address}</span>
          </div>
          <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xs">→</span>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiNavigation className="w-3.5 h-3.5 text-red-500" />
            </div>
            <span className="truncate text-gray-700">{ride.destinationLocation?.address}</span>
          </div>
        </div>

        {/* Requester */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <FiUser className="w-4 h-4 text-violet-400" />
          <span className="text-gray-500">Requester:</span>
          <span className="font-medium text-gray-900">{ride.requester?.name}</span>
          <span className="text-gray-400">({ride.requester?.email})</span>
        </div>

        {/* Current Assignment Block */}
        {isAssigned && ride.assignedDriver && ride.assignedVehicle && (
          <div className="mb-4 p-3 bg-violet-100 border-2 border-violet-300 rounded-lg">
            <p className="text-xs font-bold text-violet-700 uppercase mb-2 flex items-center gap-1.5">
              <FiAlertCircle className="w-3.5 h-3.5" />
              Currently Assigned To
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-violet-200">
                <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {ride.assignedDriver.name}
                  </p>
                  <StatusBadge status={ride.assignedDriver.status} type="driver" size="sm" />
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-violet-200">
                <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center">
                  <FiTruck className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {ride.assignedVehicle.vehicleNumber}
                  </p>
                  <StatusBadge status={ride.assignedVehicle.status} type="vehicle" size="sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Driver */}
          <div>
            <label className="label flex items-center gap-2 text-violet-700">
              <FiUser className="w-4 h-4" />
              Change Driver
              {loadingAvailability && (
                <span className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              )}
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="select border-violet-200 focus:border-violet-400 focus:ring-violet-300"
              disabled={loadingAvailability}
            >
              <option value="">Choose a driver...</option>
              {availableDrivers.map((driver) => (
                <option
                  key={driver._id}
                  value={driver._id}
                  disabled={!driver.isAvailable && driver._id !== ride.assignedDriver?._id}
                >
                  {driver.name}{' '}
                  {driver.isAvailable
                    ? '✓ Available'
                    : driver._id === ride.assignedDriver?._id
                    ? '(Current)'
                    : '✗ Busy'}
                </option>
              ))}
            </select>
            {selectedDriver && (
              <p className="text-xs text-violet-500 mt-1">
                {availableDrivers.find((d) => d._id === selectedDriver)?.isAvailable
                  ? '✓ Available at scheduled time'
                  : 'ℹ️ May have other rides at this time'}
              </p>
            )}
          </div>

          {/* Vehicle */}
          <div>
            <label className="label flex items-center gap-2 text-violet-700">
              <FiTruck className="w-4 h-4" />
              Change Vehicle
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="select border-violet-200 focus:border-violet-400 focus:ring-violet-300"
              disabled={loadingAvailability}
            >
              <option value="">Choose a vehicle...</option>
              {availableVehicles.map((vehicle) => (
                <option
                  key={vehicle._id}
                  value={vehicle._id}
                  disabled={!vehicle.isAvailable && vehicle._id !== ride.assignedVehicle?._id}
                >
                  {vehicle.vehicleNumber} ({vehicle.type}){' '}
                  {vehicle.isAvailable
                    ? '✓ Available'
                    : vehicle._id === ride.assignedVehicle?._id
                    ? '(Current)'
                    : '✗ Busy'}
                </option>
              ))}
            </select>
            {selectedVehicle && (
              <p className="text-xs text-violet-500 mt-1">
                {availableVehicles.find((v) => v._id === selectedVehicle)?.isAvailable
                  ? '✓ Available at scheduled time'
                  : 'ℹ️ May be assigned to other rides'}
              </p>
            )}
          </div>
        </div>

        {/* Reassign Button */}
        <button
          onClick={handleAssign}
          disabled={loading || !selectedDriver || !selectedVehicle || loadingAvailability}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
            bg-gradient-to-r from-violet-600 to-purple-600 text-white
            hover:from-violet-700 hover:to-purple-700 hover:shadow-lg hover:shadow-violet-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Reassigning...
            </>
          ) : (
            <>
              <FiRefreshCw className="w-4 h-4" />
              Reassign Driver & Vehicle
            </>
          )}
        </button>

        {/* Dev Debug */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 p-2 bg-gray-100 rounded text-xs space-y-0.5">
            <p>🐛 Status: <strong>{ride.status}</strong></p>
            <p>🐛 Driver: <strong>{selectedDriver || 'None'}</strong></p>
            <p>🐛 Vehicle: <strong>{selectedVehicle || 'None'}</strong></p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AssignmentCard;
