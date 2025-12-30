import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiAlertCircle } from 'react-icons/fi';
import Modal from '../common/Modal';
import { ridesAPI } from '../../services/api';
import { formatDate, formatTime, formatDistance } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StartRideModal = ({ ride, isOpen, onClose, onSuccess }) => {
  const [startMileage, setStartMileage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!startMileage) {
      setError('Start mileage is required');
      return;
    }

    const mileageValue = parseFloat(startMileage);
    if (isNaN(mileageValue) || mileageValue < 0) {
      setError('Please enter a valid mileage');
      return;
    }

    setLoading(true);
    try {
      await ridesAPI.startRide(ride._id, mileageValue);
      toast.success('Ride started successfully!');
      onSuccess?.();
      handleClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start ride';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStartMileage('');
    setError('');
    onClose();
  };

  if (!ride) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Start Ride" size="md">
      <div className="p-6">
        {/* Ride Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900">Ride #{ride.rideId}</span>
            <span className="text-sm text-gray-500">{formatDistance(ride.calculatedDistance)}</span>
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
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium text-gray-900">{formatDate(ride.scheduledDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-medium text-gray-900">{formatTime(ride.scheduledTime)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="font-medium text-gray-900">{ride.requester?.name}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        {ride.assignedVehicle && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-blue-800 mb-2">Assigned Vehicle</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-900">
                {ride.assignedVehicle.vehicleNumber}
              </span>
              <span className="text-sm text-blue-700">{ride.assignedVehicle.type}</span>
            </div>
          </div>
        )}

        {/* Mileage Input */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="label">
              Current Odometer Reading (km) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={startMileage}
              onChange={(e) => {
                setStartMileage(e.target.value);
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
            <p className="mt-2 text-sm text-gray-500">
              Please enter the exact odometer reading before starting the trip.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Important</p>
                <p className="text-sm text-amber-700">
                  Make sure to record the exact odometer reading. This will be used to calculate the actual distance traveled.
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
              disabled={loading}
              className="btn-success flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Starting...
                </span>
              ) : (
                <>
                  <FiPlay className="w-5 h-5 mr-2" />
                  Start Ride
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default StartRideModal;