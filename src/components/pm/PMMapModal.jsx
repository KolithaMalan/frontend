import React from 'react';
import {
  FiMapPin,
  FiNavigation,
  FiUser,
  FiCalendar,
} from 'react-icons/fi';
import Modal from '../common/Modal';
import MapComponent from '../maps/MapComponent';
import { formatDate, formatTime, formatDistance } from '../../utils/formatters';

const PMMapModal = ({ ride, isOpen, onClose }) => {
  if (!ride) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ride #${ride.rideId} - Route Map`}
      size="xl"
    >
      <div className="p-6">
        {/* Map */}
        <div className="mb-6">
          <MapComponent
            pickup={ride.pickupLocation}
            destination={ride.destinationLocation}
            height="400px"
          />
        </div>

        {/* Ride Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Locations */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <FiMapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-green-600 uppercase">Pickup</p>
                <p className="text-sm text-gray-700">{ride.pickupLocation?.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <FiNavigation className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-600 uppercase">Destination</p>
                <p className="text-sm text-gray-700">{ride.destinationLocation?.address}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiUser className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Requester</p>
                <p className="font-medium text-gray-900">{ride.requester?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiCalendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Schedule</p>
                <p className="font-medium text-gray-900">
                  {formatDate(ride.scheduledDate)} at {formatTime(ride.scheduledTime)}
                </p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-center">
              <p className="text-xs text-amber-600 uppercase">Total Distance</p>
              <p className="text-2xl font-bold text-amber-700">
                {formatDistance(ride.calculatedDistance)}
              </p>
              <p className="text-xs text-amber-600">
                {ride.rideType === 'return' ? '(Round Trip)' : '(One-Way)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PMMapModal;