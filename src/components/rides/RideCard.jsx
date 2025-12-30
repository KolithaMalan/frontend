import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiMapPin, 
  FiCalendar, 
  FiClock, 
  FiNavigation,
  FiUser,
  FiTruck,
  FiEye,
  FiX
} from 'react-icons/fi';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatTime, formatDistance, formatAddress } from '../../utils/formatters';
import { RIDE_TYPE_LABELS } from '../../utils/constants';

const RideCard = ({ 
  ride, 
  onView, 
  onCancel, 
  showRequester = false,
  showDriver = false,
  showActions = true,
  compact = false 
}) => {
  const isOngoing = ['assigned', 'in_progress'].includes(ride.status);
  const canCancel = ['pending', 'awaiting_pm', 'awaiting_admin'].includes(ride.status);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onView?.(ride)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Ride #{ride.rideId}</p>
              <p className="text-sm text-gray-500">
                {formatDate(ride.scheduledDate)} at {formatTime(ride.scheduledTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              {formatDistance(ride.calculatedDistance)}
            </span>
            <StatusBadge status={ride.status} type="ride" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Ride #{ride.rideId}
            </h3>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {RIDE_TYPE_LABELS[ride.rideType]}
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
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatDistance(ride.calculatedDistance)}
            </p>
            <p className="text-xs text-gray-500">
              {ride.calculatedDistance > 15 ? 'Long Distance' : 'Short Distance'}
            </p>
          </div>
          <StatusBadge status={ride.status} type="ride" size="md" />
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-3 mb-4">
        {/* Pickup */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiMapPin className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-green-600 uppercase">Pickup</p>
            <p className="text-sm text-gray-700 truncate" title={ride.pickupLocation?.address}>
              {formatAddress(ride.pickupLocation?.address, 80)}
            </p>
          </div>
        </div>

        {/* Route Line */}
        <div className="ml-4 border-l-2 border-dashed border-gray-200 h-4"></div>

        {/* Destination */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiNavigation className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-600 uppercase">Destination</p>
            <p className="text-sm text-gray-700 truncate" title={ride.destinationLocation?.address}>
              {formatAddress(ride.destinationLocation?.address, 80)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {(showRequester || showDriver) && (
        <div className="flex flex-wrap gap-4 py-3 border-t border-gray-100">
          {showRequester && ride.requester && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Requester</p>
                <p className="text-sm font-medium text-gray-900">{ride.requester.name}</p>
              </div>
            </div>
          )}
          
          {showDriver && ride.assignedDriver && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Driver</p>
                <p className="text-sm font-medium text-gray-900">{ride.assignedDriver.name}</p>
              </div>
            </div>
          )}

          {ride.assignedVehicle && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FiTruck className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Vehicle</p>
                <p className="text-sm font-medium text-gray-900">{ride.assignedVehicle.vehicleNumber}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView?.(ride)}
            className="btn btn-outline btn-sm flex-1"
          >
            <FiEye className="w-4 h-4 mr-1" />
            View Details
          </button>
          
          {canCancel && (
            <button
              onClick={() => onCancel?.(ride)}
              className="btn btn-sm text-red-600 hover:bg-red-50 border border-red-200"
            >
              <FiX className="w-4 h-4 mr-1" />
              Cancel
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default RideCard;