import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiTruck,
  FiCheck,
  FiAlertCircle,
  FiMapPin,
  FiNavigation,
  FiCalendar,
  FiClock,
} from 'react-icons/fi';
import Modal from '../common/Modal';
import { ridesAPI } from '../../services/api';
import { formatDate, formatTime, formatDistance, formatAddress } from '../../utils/formatters';
import { RIDE_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

const AssignmentForm = ({ ride, isOpen, onClose, onSuccess, isReassign = false }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && ride) {
      fetchAvailableResources();
    }
  }, [isOpen, ride]);

  const fetchAvailableResources = async () => {
    setLoadingData(true);
    try {
      const dateStr = new Date(ride.scheduledDate).toISOString().split('T')[0];
      
      // Fetch available drivers and vehicles for the specific date/time
      const [driversRes, vehiclesRes] = await Promise.all([
        ridesAPI.getAvailableDrivers({ 
          date: dateStr, 
          time: ride.scheduledTime,
          excludeRideId: isReassign ? ride._id : undefined
        }),
        ridesAPI.getAvailableVehicles({ 
          date: dateStr, 
          time: ride.scheduledTime,
          excludeRideId: isReassign ? ride._id : undefined
        }),
      ]);

      setDrivers(driversRes.data.drivers);
      setVehicles(vehiclesRes.data.vehicles);

      // Pre-select current assignment if reassigning
      if (isReassign && ride.assignedDriver) {
        setSelectedDriver(ride.assignedDriver._id || ride.assignedDriver);
      }
      if (isReassign && ride.assignedVehicle) {
        setSelectedVehicle(ride.assignedVehicle._id || ride.assignedVehicle);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast.error('Failed to load available drivers and vehicles');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!selectedDriver) {
      newErrors.driver = 'Please select a driver';
    }
    if (!selectedVehicle) {
      newErrors.vehicle = 'Please select a vehicle';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const data = {
        driverId: selectedDriver,
        vehicleId: selectedVehicle,
      };

      if (isReassign) {
        await ridesAPI.reassign(ride._id, data);
        toast.success('Ride reassigned successfully! All parties have been notified.');
      } else {
        await ridesAPI.assign(ride._id, data);
        toast.success('Driver and vehicle assigned successfully!');
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign ride';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDriver('');
    setSelectedVehicle('');
    setErrors({});
    onClose();
  };

  if (!ride) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={isReassign ? 'Reassign Driver & Vehicle' : 'Assign Driver & Vehicle'} 
      size="lg"
    >
      <div className="p-6">
        {/* Ride Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold text-gray-900">Ride #{ride.rideId}</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                {RIDE_TYPE_LABELS[ride.rideType]}
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {formatDistance(ride.calculatedDistance)}
            </span>
          </div>

          {/* Requester */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
            <FiUser className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Requester:</span>
            <span className="text-sm font-medium text-gray-900">{ride.requester?.name}</span>
            <span className="text-sm text-gray-500">({ride.requester?.email})</span>
          </div>

          {/* Locations */}
          <div className="space-y-2 text-sm mb-3">
            <div className="flex items-start gap-2">
              <FiMapPin className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500">From:</span>
                <p className="text-gray-700">{formatAddress(ride.pickupLocation?.address, 60)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FiNavigation className="w-4 h-4 text-red-500 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500">To:</span>
                <p className="text-gray-700">{formatAddress(ride.destinationLocation?.address, 60)}</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{formatDate(ride.scheduledDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{formatTime(ride.scheduledTime)}</span>
            </div>
          </div>
        </div>

        {/* Current Assignment (for reassign) */}
        {isReassign && ride.assignedDriver && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-amber-800 mb-2">Current Assignment</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-900">{ride.assignedDriver.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTruck className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-900">{ride.assignedVehicle?.vehicleNumber}</span>
              </div>
            </div>
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Driver Selection */}
            <div className="mb-6">
              <label className="label">
                Select Driver <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {drivers.map((driver) => (
                  <button
                    key={driver._id}
                    type="button"
                    onClick={() => {
                      if (driver.isAvailable) {
                        setSelectedDriver(driver._id);
                        setErrors({ ...errors, driver: '' });
                      }
                    }}
                    disabled={!driver.isAvailable}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedDriver === driver._id
                        ? 'border-primary-500 bg-primary-50'
                        : driver.isAvailable
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedDriver === driver._id
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <FiUser className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-sm text-gray-500">{driver.phone}</p>
                      </div>
                      {selectedDriver === driver._id && (
                        <FiCheck className="w-5 h-5 text-primary-600" />
                      )}
                      {!driver.isAvailable && (
                        <span className="text-xs text-red-500">Busy</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.driver && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.driver}
                </p>
              )}
              {drivers.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  No drivers available for this date/time
                </p>
              )}
            </div>

            {/* Vehicle Selection */}
            <div className="mb-6">
              <label className="label">
                Select Vehicle <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle._id}
                    type="button"
                    onClick={() => {
                      if (vehicle.isAvailable) {
                        setSelectedVehicle(vehicle._id);
                        setErrors({ ...errors, vehicle: '' });
                      }
                    }}
                    disabled={!vehicle.isAvailable}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedVehicle === vehicle._id
                        ? 'border-primary-500 bg-primary-50'
                        : vehicle.isAvailable
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedVehicle === vehicle._id
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <FiTruck className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{vehicle.vehicleNumber}</p>
                        <p className="text-sm text-gray-500">{vehicle.type}</p>
                      </div>
                      {selectedVehicle === vehicle._id && (
                        <FiCheck className="w-5 h-5 text-primary-600" />
                      )}
                      {!vehicle.isAvailable && (
                        <span className="text-xs text-red-500">
                          {vehicle.status === 'maintenance' ? 'Maintenance' : 'Busy'}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.vehicle && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.vehicle}
                </p>
              )}
              {vehicles.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  No vehicles available for this date/time
                </p>
              )}
            </div>

            {/* Warning for reassign */}
            {isReassign && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Important</p>
                    <p className="text-sm text-amber-700">
                      Reassigning this ride will notify the requester, new driver, and the previously assigned driver.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedDriver || !selectedVehicle}
                className={`flex-1 ${isReassign ? 'btn btn-warning' : 'btn btn-primary'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {isReassign ? 'Reassigning...' : 'Assigning...'}
                  </span>
                ) : (
                  <>
                    <FiCheck className="w-5 h-5 mr-2" />
                    {isReassign ? 'Reassign' : 'Assign'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AssignmentForm;