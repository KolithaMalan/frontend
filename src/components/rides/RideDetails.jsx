import React from 'react';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiNavigation,
  FiCalendar,
  FiClock,
  FiUser,
  FiTruck,
  FiPhone,
  FiMail,
  FiActivity,
} from 'react-icons/fi';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import MapComponent from '../maps/MapComponent';
import { formatDate, formatTime, formatDistance, formatPhone } from '../../utils/formatters';
import { RIDE_TYPE_LABELS, RIDE_STATUS_LABELS } from '../../utils/constants';

const RideDetails = ({ ride, isOpen, onClose }) => {
  if (!ride) return null;

  const getStatusMessage = () => {
    switch (ride.status) {
      case 'pending':
        return 'Your ride request is being processed.';
      case 'awaiting_pm':
        return 'Waiting for Plant Manager approval (distance > 15km).';
      case 'awaiting_admin':
        return 'Waiting for Admin approval.';
      case 'approved':
      case 'pm_approved':
        return 'Approved! Waiting for driver and vehicle assignment.';
      case 'assigned':
        return 'Driver and vehicle assigned. Ready for pickup.';
      case 'in_progress':
        return 'Ride is currently in progress.';
      case 'completed':
        return 'Ride completed successfully.';
      case 'rejected':
        return 'This ride request was rejected.';
      case 'cancelled':
        return 'This ride was cancelled.';
      default:
        return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ride #${ride.rideId}`} size="lg">
      <div className="p-6 space-y-6">
        {/* Status Banner */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <StatusBadge status={ride.status} type="ride" size="md" />
            <p className="text-sm text-gray-600 mt-2">{getStatusMessage()}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatDistance(ride.calculatedDistance)}</p>
            <span className="text-sm text-gray-500">
              {RIDE_TYPE_LABELS[ride.rideType]}
            </span>
          </div>
        </div>

        {/* Map */}
        <MapComponent
          pickup={ride.pickupLocation}
          destination={ride.destinationLocation}
          height="200px"
        />

        {/* Locations */}
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiMapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Pickup Location</p>
              <p className="text-gray-900">{ride.pickupLocation?.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiNavigation className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-red-600 uppercase mb-1">Destination</p>
              <p className="text-gray-900">{ride.destinationLocation?.address}</p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FiCalendar className="w-4 h-4" />
              <span className="text-sm">Scheduled Date</span>
            </div>
            <p className="font-semibold text-gray-900">{formatDate(ride.scheduledDate)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FiClock className="w-4 h-4" />
              <span className="text-sm">Scheduled Time</span>
            </div>
            <p className="font-semibold text-gray-900">{formatTime(ride.scheduledTime)}</p>
          </div>
        </div>

        {/* Driver & Vehicle Info (if assigned) */}
        {ride.assignedDriver && (
          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-purple-600" />
              Assigned Driver
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{ride.assignedDriver.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{formatPhone(ride.assignedDriver.phone)}</p>
              </div>
            </div>
          </div>
        )}

        {ride.assignedVehicle && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiTruck className="w-5 h-5 text-blue-600" />
              Assigned Vehicle
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Vehicle Number</p>
                <p className="font-medium text-gray-900">{ride.assignedVehicle.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium text-gray-900">{ride.assignedVehicle.type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mileage Info (if completed) */}
        {ride.status === 'completed' && (
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-green-600" />
              Trip Details
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Start Mileage</p>
                <p className="font-medium text-gray-900">{ride.startMileage?.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Mileage</p>
                <p className="font-medium text-gray-900">{ride.endMileage?.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Actual Distance</p>
                <p className="font-medium text-gray-900">{formatDistance(ride.actualDistance)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason (if rejected) */}
        {ride.status === 'rejected' && ride.rejectedBy?.reason && (
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="font-semibold text-red-800 mb-2">Rejection Reason</h4>
            <p className="text-gray-700">{ride.rejectedBy.reason}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Request Timeline</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span>Created: {formatDate(ride.createdAt, 'dd/MM/yyyy hh:mm a')}</span>
            </div>
            {ride.approvedBy?.pm?.approvedAt && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>PM Approved: {formatDate(ride.approvedBy.pm.approvedAt, 'dd/MM/yyyy hh:mm a')}</span>
              </div>
            )}
            {ride.approvedBy?.admin?.approvedAt && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Admin Approved: {formatDate(ride.approvedBy.admin.approvedAt, 'dd/MM/yyyy hh:mm a')}</span>
              </div>
            )}
            {ride.startTime && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Started: {formatDate(ride.startTime, 'dd/MM/yyyy hh:mm a')}</span>
              </div>
            )}
            {ride.endTime && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Completed: {formatDate(ride.endTime, 'dd/MM/yyyy hh:mm a')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RideDetails;