import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiNavigation,
  FiRefreshCw,
  FiClock,
  FiMapPin,
  FiUser,
  FiTruck,
  FiActivity,
  FiAlertCircle,
  FiChevronRight,
  FiZap
} from 'react-icons/fi';
import { useTracking } from '../../../hooks/useTracking';
import TrackingMap from '../../maps/TrackingMap';
import Loader from '../../common/Loader';

const LiveTrackingTab = () => {
  const { 
    data: rides, 
    stats, 
    loading, 
    error, 
    lastUpdate, 
    refresh 
  } = useTracking({ 
    type: 'active-rides',
    refreshInterval: 15000 
  });

  const [selectedRide, setSelectedRide] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Convert rides to vehicle format for map
  const vehiclesForMap = useMemo(() => {
    return rides
      .filter(ride => ride.assignedVehicle && ride.hasTracking)
      .map(ride => ({
        _id: ride.assignedVehicle._id,
        vehicleNumber: ride.assignedVehicle.vehicleNumber,
        type: ride.assignedVehicle.type,
        currentDriver: ride.assignedDriver,
        tracking: ride.tracking,
        hasTracking: ride.hasTracking,
        ride: {
          rideId: ride.rideId,
          status: ride.status,
          requester: ride.requester,
          eta: ride.eta
        }
      }));
  }, [rides]);

  const selectedVehicle = useMemo(() => {
    if (!selectedRide) return null;
    return vehiclesForMap.find(v => v.ride.rideId === selectedRide.rideId);
  }, [selectedRide, vehiclesForMap]);

  if (loading) {
    return <Loader text="Loading tracking data..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Tracking</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={handleRefresh} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {stats?.onlineDevices || 0} Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {stats?.movingVehicles || 0} Moving
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {stats?.stoppedVehicles || 0} Stopped
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline btn-sm"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-blue-600" />
                Live Vehicle Positions
              </h3>
            </div>
            <TrackingMap
              vehicles={vehiclesForMap}
              selectedVehicle={selectedVehicle}
              onVehicleSelect={(vehicle) => {
                const ride = rides.find(r => r.assignedVehicle?._id === vehicle._id);
                setSelectedRide(ride);
              }}
              height="500px"
            />
          </div>
        </div>

        {/* Active Rides List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-green-600" />
                Active Rides ({rides.length})
              </h3>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              {rides.length === 0 ? (
                <div className="p-8 text-center">
                  <FiNavigation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No active rides at the moment</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {rides.map((ride) => (
                    <motion.button
                      key={ride._id}
                      onClick={() => setSelectedRide(ride)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedRide?._id === ride._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-semibold text-gray-900">
                            #{ride.rideId}
                          </span>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            ride.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {ride.status === 'in_progress' ? 'In Progress' : 'Assigned'}
                          </span>
                        </div>
                        <FiChevronRight className="w-4 h-4 text-gray-400" />
                      </div>

                      {/* Vehicle & Driver */}
                      <div className="space-y-1 text-sm">
                        {ride.assignedVehicle && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiTruck className="w-4 h-4" />
                            <span>{ride.assignedVehicle.vehicleNumber}</span>
                            {ride.hasTracking && ride.tracking?.isOnline && (
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </div>
                        )}
                        
                        {ride.assignedDriver && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiUser className="w-4 h-4" />
                            <span>{ride.assignedDriver.name}</span>
                          </div>
                        )}

                        {/* Speed & ETA */}
                        {ride.hasTracking && ride.tracking && (
                          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-gray-500">
                              <FiZap className="w-3 h-3" />
                              <span className="text-xs">{ride.tracking.speed} km/h</span>
                            </div>
                            {ride.eta && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <FiClock className="w-3 h-3" />
                                <span className="text-xs">
                                  ETA: {ride.eta.minutes} min ({ride.eta.distance} km)
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {!ride.hasTracking && (
                          <div className="flex items-center gap-1 text-amber-600 mt-2">
                            <FiAlertCircle className="w-3 h-3" />
                            <span className="text-xs">No tracking data</span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Ride Details */}
      {selectedRide && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ride #{selectedRide.rideId} Details
              </h3>
              <p className="text-sm text-gray-500">
                Requested by: {selectedRide.requester?.name || 'Unknown'}
              </p>
            </div>
            <button
              onClick={() => setSelectedRide(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Location Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <FiMapPin className="w-4 h-4" />
                Route
              </h4>
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-gray-500">From:</span>
                  <p className="font-medium">{selectedRide.pickupLocation?.address || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">To:</span>
                  <p className="font-medium">{selectedRide.destinationLocation?.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Vehicle & Driver */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <FiTruck className="w-4 h-4" />
                Assignment
              </h4>
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-gray-500">Vehicle:</span>
                  <p className="font-medium">
                    {selectedRide.assignedVehicle?.vehicleNumber} ({selectedRide.assignedVehicle?.type})
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Driver:</span>
                  <p className="font-medium">{selectedRide.assignedDriver?.name || 'N/A'}</p>
                  <p className="text-gray-500">{selectedRide.assignedDriver?.phone}</p>
                </div>
              </div>
            </div>

            {/* Live Status */}
            {selectedRide.hasTracking && selectedRide.tracking && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <FiActivity className="w-4 h-4" />
                  Live Status
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedRide.tracking.isOnline ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span>{selectedRide.tracking.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Speed:</span>
                    <span className="ml-2 font-medium">{selectedRide.tracking.speed} km/h</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ignition:</span>
                    <span className={`ml-2 font-medium ${
                      selectedRide.tracking.ignitionOn ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {selectedRide.tracking.ignitionOn ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  {selectedRide.eta && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-500">ETA:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        {selectedRide.eta.minutes} minutes
                      </span>
                      <p className="text-xs text-gray-500">
                        Distance remaining: {selectedRide.eta.distance} km
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LiveTrackingTab;