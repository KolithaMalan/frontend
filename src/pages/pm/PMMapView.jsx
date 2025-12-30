import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiList, FiMapPin } from 'react-icons/fi';
import { ridesAPI } from '../../services/api';
import MapComponent from '../../components/maps/MapComponent';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import { formatDate, formatTime, formatDistance } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PMMapView = () => {
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      // Get all rides requiring PM attention
      const response = await ridesAPI.getAwaitingPM();
      setRides(response.data.rides);
      if (response.data.rides.length > 0) {
        setSelectedRide(response.data.rides[0]);
      }
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading map..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Map View</h1>
          <p className="text-gray-500">Visualize pending ride routes</p>
        </div>
        <button onClick={fetchRides} className="btn btn-outline btn-sm">
          <FiRefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ride List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiList className="w-5 h-5" />
            Pending Rides ({rides.length})
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {rides.length > 0 ? (
              rides.map((ride) => (
                <motion.button
                  key={ride._id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedRide(ride)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedRide?._id === ride._id
                      ? 'bg-amber-50 border-2 border-amber-500'
                      : 'bg-white border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">#{ride.rideId}</p>
                      <p className="text-sm text-gray-500">{ride.requester?.name}</p>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      {formatDistance(ride.calculatedDistance)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin className="w-3 h-3 text-green-500" />
                      <span className="truncate">{ride.pickupLocation?.address?.substring(0, 30)}...</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin className="w-3 h-3 text-red-500" />
                      <span className="truncate">{ride.destinationLocation?.address?.substring(0, 30)}...</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(ride.scheduledDate)}</span>
                    <span>{formatTime(ride.scheduledTime)}</span>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No pending rides to display
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <div className="h-[600px]">
              <MapComponent
                pickup={selectedRide?.pickupLocation}
                destination={selectedRide?.destinationLocation}
                height="100%"
              />
            </div>
          </div>

          {/* Selected Ride Info */}
          {selectedRide && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Ride #{selectedRide.rideId}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedRide.requester?.name} • {formatDate(selectedRide.scheduledDate)} at {formatTime(selectedRide.scheduledTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">
                    {formatDistance(selectedRide.calculatedDistance)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedRide.rideType === 'return' ? 'Round Trip' : 'One-Way'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PMMapView;