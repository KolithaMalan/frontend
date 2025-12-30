import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiFilter } from 'react-icons/fi';
import MapComponent from '../../components/maps/MapComponent';
import { ridesAPI, vehiclesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const MapView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeRides, setActiveRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);

  useEffect(() => {
    fetchActiveRides();
  }, []);

  const fetchActiveRides = async () => {
    setLoading(true);
    try {
      const response = await ridesAPI.getAll({
        status: ['assigned', 'in_progress'],
        limit: 50,
      });
      setActiveRides(response.data.rides);
    } catch (error) {
      toast.error('Failed to load active rides');
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
          <p className="text-gray-500">
            View active rides and locations
          </p>
        </div>
        <button
          onClick={fetchActiveRides}
          className="btn btn-outline btn-sm"
        >
          <FiRefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-0 overflow-hidden"
      >
        <div className="h-[600px]">
          <MapComponent
            pickup={selectedRide?.pickupLocation}
            destination={selectedRide?.destinationLocation}
            height="100%"
          />
        </div>
      </motion.div>

      {/* Active Rides List */}
      {activeRides.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Rides ({activeRides.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRides.map((ride) => (
              <button
                key={ride._id}
                onClick={() => setSelectedRide(ride)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedRide?._id === ride._id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    #{ride.rideId}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      ride.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {ride.status === 'in_progress' ? 'In Progress' : 'Assigned'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {ride.requester?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {ride.assignedDriver?.name || 'No driver'}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MapView;