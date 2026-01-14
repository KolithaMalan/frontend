import React from 'react';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiNavigation,
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiCheck,
  FiX,
  FiMap,
  FiAlertTriangle,
  FiTruck,  // ✅ ADD THIS
} from 'react-icons/fi';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatTime, formatDistance, formatPhone, formatAddress } from '../../utils/formatters';
import { RIDE_TYPE_LABELS, PM_APPROVAL_THRESHOLD_KM, VEHICLE_TYPE_LABELS } from '../../utils/constants';

const PMApprovalCard = ({ ride, onApprove, onReject, onViewMap, loading = false }) => {
  const exceedsThreshold = ride.calculatedDistance > PM_APPROVAL_THRESHOLD_KM;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Ride #{ride.rideId}</h3>
              <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium">
                {RIDE_TYPE_LABELS[ride.rideType]}
              </span>
            </div>
            <p className="text-amber-100 text-sm mt-1">Approval Required</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatDistance(ride.calculatedDistance)}</p>
            <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium mt-1 inline-block">
              Awaiting PM Approval
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Long Distance Alert */}
        {exceedsThreshold && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <FiAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Long Distance Alert</p>
              <p className="text-sm text-amber-700">
                This {ride.rideType === 'return' ? 'return trip' : 'ride'} is {formatDistance(ride.calculatedDistance)}, 
                exceeding the {PM_APPROVAL_THRESHOLD_KM}km threshold and requires your approval.
              </p>
            </div>
          </div>
        )}

        {/* ✅ NEW: Required Vehicle Type Display */}
        {ride.requiredVehicleType && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiTruck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Required Vehicle Type</p>
              <p className="text-lg font-bold text-gray-900">
                {VEHICLE_TYPE_LABELS[ride.requiredVehicleType] || ride.requiredVehicleType}
              </p>
            </div>
          </div>
        )}

        {/* Requester Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase mb-3">Requester Details</p>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {ride.requester?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Name</p>
                <p className="font-semibold text-gray-900">{ride.requester?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                <div className="flex items-center gap-1.5">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 text-sm">{ride.requester?.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Phone</p>
                <div className="flex items-center gap-1.5">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 text-sm">{formatPhone(ride.requester?.phone)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-3">
          {/* Pickup */}
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiMapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-600 uppercase mb-1">Pickup Location</p>
              <p className="text-gray-900 leading-relaxed">{ride.pickupLocation?.address}</p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiNavigation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-600 uppercase mb-1">Destination</p>
              <p className="text-gray-900 leading-relaxed">{ride.destinationLocation?.address}</p>
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: Schedule with Vehicle Type */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Requested Date</p>
              <p className="font-semibold text-gray-900">{formatDate(ride.scheduledDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-semibold text-gray-900">{formatTime(ride.scheduledTime)}</p>
            </div>
          </div>
          {/* ✅ NEW: Vehicle Type in Schedule Grid */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Vehicle Type</p>
              <p className="font-semibold text-gray-900">
                {VEHICLE_TYPE_LABELS[ride.requiredVehicleType] || '-'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:justify-end">
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm text-gray-600">{formatDate(ride.createdAt, 'dd/MM/yyyy hh:mm a')}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onApprove?.(ride)}
            disabled={loading}
            className="btn btn-success flex-1"
          >
            <FiCheck className="w-5 h-5 mr-2" />
            Approve Ride
          </button>
          <button
            onClick={() => onReject?.(ride)}
            disabled={loading}
            className="btn btn-danger flex-1"
          >
            <FiX className="w-5 h-5 mr-2" />
            Reject Ride
          </button>
          <button
            onClick={() => onViewMap?.(ride)}
            disabled={loading}
            className="btn btn-outline sm:w-auto"
            title="View on Map"
          >
            <FiMap className="w-5 h-5 sm:mr-0 mr-2" />
            <span className="sm:hidden">View Map</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PMApprovalCard;
