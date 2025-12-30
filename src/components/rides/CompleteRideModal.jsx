import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiNavigation } from 'react-icons/fi';
import Modal from '../common/Modal';
import { ridesAPI } from '../../services/api';
import { formatDate, formatTime, formatDistance } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CompleteRideModal = ({ ride, isOpen, onClose, onSuccess }) => {
  const [endMileage, setEndMileage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateActualDistance = () => {
    if (!endMileage || !ride?.startMileage) return null;
    const end = parseFloat(endMileage);
    const start = ride.startMileage;
    if (isNaN(end) || end < start) return null;
    return (end - start).toFixed(1);
  };

  const actualDistance = calculateActualDistance();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!endMileage) {
      setError('End mileage is required');
      return;
    }

    const mileageValue = parseFloat(endMileage);
    if (isNaN(mileageValue) || mileageValue < 0) {
      setError('Please enter a valid mileage');
      return;
    }

    if (mileageValue < ride.startMileage) {
      setError('End mileage cannot be less than start mileage');
      return;
    }

    setLoading(true);
    try {
      await ridesAPI.completeRide(ride._id, mileageValue);
      toast.success('Ride completed successfully!');
      onSuccess?.();
      handleClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to complete ride';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEndMileage('');
    setError('');
    onClose();
  };

  if (!ride) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Complete Ride" size="md">
      <div className="p-6">
        {/* Ride Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900">Ride #{ride.rideId}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              In Progress
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></span>
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="text-gray-700">{ride.pickupLocation?.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></span>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-gray-700">{ride.destinationLocation?.address}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="font-medium text-gray-900">{ride.requester?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Vehicle</p>
              <p className="font-medium text-gray-900">{ride.assignedVehicle?.vehicleNumber}</p>
            </div>
          </div>
        </div>

        {/* Start Mileage Info */}
        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Start Mileage</p>
              <p className="text-2xl font-bold text-green-900">{ride.startMileage?.toFixed(1)} km</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-800">Started At</p>
              <p className="text-sm text-green-700">
                {formatDate(ride.startTime, 'dd/MM/yyyy hh:mm a')}
              </p>
            </div>
          </div>
        </div>

        {/* Mileage Input */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">
              End Odometer Reading (km) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min={ride.startMileage || 0}
              value={endMileage}
              onChange={(e) => {
                setEndMileage(e.target.value);
                setError('');
              }}
              placeholder="Enter current vehicle mileage"
              className={`input text-lg ${error ? 'input-error' : ''}`}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Distance Calculation */}
          {actualDistance && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiNavigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Actual Distance Traveled</p>
                    <p className="text-2xl font-bold text-blue-900">{actualDistance} km</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">Estimated</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {formatDistance(ride.calculatedDistance)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Important</p>
                <p className="text-sm text-amber-700">
                  This mileage will be added to the vehicle's total mileage record. Please ensure accuracy.
                </p>
              </div>
            </div>
          </div>

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
              disabled={loading || !actualDistance}
              className="btn-success flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Completing...
                </span>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                  Complete Ride
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CompleteRideModal;