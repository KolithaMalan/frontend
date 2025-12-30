import React from 'react';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiNavigation,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiTruck,
  FiPlay,
  FiCheckCircle,
  FiCircle,
} from 'react-icons/fi';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatTime, formatDistance, formatPhone, formatAddress } from '../../utils/formatters';
import { RIDE_TYPE_LABELS } from '../../utils/constants';

const DriverRideCard = ({ ride, onStart, onComplete, showVehicle = true }) => {
  const isAssigned = ride.status === 'assigned';
  const isInProgress = ride.status === 'in_progress';
  const isCompleted = ride.status === 'completed';

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
          <p className="text-sm text-gray-500">
            Requested on {formatDate(ride.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Distance Circle */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#e5e7eb"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke={isCompleted ? '#22c55e' : '#3b82f6'}
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(isCompleted ? 100 : 70) * 1.76} 176`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-900">
                {ride.actualDistance?.toFixed(1) || ride.calculatedDistance}
              </span>
              <span className="text-xs text-gray-500">km</span>
            </div>
          </div>
          <StatusBadge status={ride.status} type="ride" size="md" />
        </div>
      </div>

      {/* Vehicle Info */}
      {showVehicle && ride.assignedVehicle && (
        <div className="bg-blue-50 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Assigned Vehicle</p>
              <p className="text-lg font-bold text-blue-900">
                {ride.assignedVehicle.vehicleNumber}
              </p>
            </div>
            <div className="ml-auto text-right">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {ride.assignedVehicle.type}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Customer Info */}
      <div className="bg-purple-50 rounded-xl p-3 mb-4">
        <p className="text-xs font-medium text-purple-600 uppercase mb-2">Customer</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{ride.requester?.name}</p>
              <p className="text-sm text-gray-500">{ride.requester?.email}</p>
            </div>
          </div>
          {ride.requester?.phone && (
            <a
              href={`tel:${ride.requester.phone}`}
              className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <FiPhone className="w-4 h-4" />
              <span className="text-sm font-medium">{formatPhone(ride.requester.phone)}</span>
            </a>
          )}
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
            <p className="text-xs font-medium text-green-600 uppercase">Pickup Location</p>
            <p className="text-sm text-gray-700">{ride.pickupLocation?.address}</p>
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
            <p className="text-sm text-gray-700">{ride.destinationLocation?.address}</p>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="flex items-center gap-6 py-3 border-t border-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{formatDate(ride.scheduledDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{formatTime(ride.scheduledTime)}</span>
        </div>
      </div>

      {/* Mileage Info (for in-progress or completed) */}
      {(isInProgress || isCompleted) && ride.startMileage && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Start Mileage</p>
              <p className="font-semibold text-gray-900">{ride.startMileage?.toFixed(1)} km</p>
            </div>
            {isCompleted && (
              <>
                <div>
                  <p className="text-xs text-gray-500">End Mileage</p>
                  <p className="font-semibold text-gray-900">{ride.endMileage?.toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Actual Distance</p>
                  <p className="font-semibold text-green-600">{ride.actualDistance?.toFixed(1)} km</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {(isAssigned || isInProgress) && (
        <div className="pt-3 border-t border-gray-100">
          {isAssigned && (
            <button
              onClick={() => onStart?.(ride)}
              className="btn-success w-full"
            >
              <FiPlay className="w-5 h-5 mr-2" />
              Start Ride
            </button>
          )}
          
          {isInProgress && (
            <button
              onClick={() => onComplete?.(ride)}
              className="btn-primary w-full"
            >
              <FiCheckCircle className="w-5 h-5 mr-2" />
              Complete Ride
            </button>
          )}
        </div>
      )}

      {/* Completed Badge */}
      {isCompleted && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-lg text-green-700">
            <FiCheckCircle className="w-5 h-5" />
            <span className="font-medium">Completed on {formatDate(ride.endTime, 'dd/MM/yyyy hh:mm a')}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DriverRideCard;