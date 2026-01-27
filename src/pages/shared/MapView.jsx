import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiRefreshCw,
  FiFilter,
  FiMapPin,
  FiTruck,
  FiActivity,
  FiSearch,
  FiX,
  FiChevronDown,
  FiWifi,
  FiWifiOff,
  FiNavigation,
  FiClock,
  FiUser,
  FiZap,
  FiAlertTriangle
} from 'react-icons/fi';
import { useTracking } from '../../hooks/useTracking';
import TrackingMap from '../../components/maps/TrackingMap';
import Loader from '../../components/common/Loader';

const MapView = () => {
  const { 
    data: vehicles, 
    stats, 
    loading, 
    lastUpdate, 
    refresh 
  } = useTracking({ 
    type: 'all',
    refreshInterval: 15000 
  });

  const [refreshing, setRefreshing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all', // all, available, busy, maintenance
    type: 'all', // all, Car, Van, Cab, Crew Cab
    online: 'all', // all, online, offline
    moving: 'all' // all, moving, stopped
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesNumber = vehicle.vehicleNumber?.toLowerCase().includes(query);
        const matchesDriver = vehicle.currentDriver?.name?.toLowerCase().includes(query);
        if (!matchesNumber && !matchesDriver) return false;
      }

      // Status filter
      if (filters.status !== 'all' && vehicle.status !== filters.status) {
        return false;
      }

      // Type filter
      if (filters.type !== 'all' && vehicle.type !== filters.type) {
        return false;
      }

      // Online filter (only for vehicles with tracking)
      if (filters.online !== 'all' && vehicle.hasTracking) {
        const isOnline = vehicle.tracking?.isOnline;
        if (filters.online === 'online' && !isOnline) return false;
        if (filters.online === 'offline' && isOnline) return false;
      }

      // Moving filter (only for online vehicles)
      if (filters.moving !== 'all' && vehicle.hasTracking && vehicle.tracking?.isOnline) {
        const isMoving = vehicle.tracking?.speed > 0;
        if (filters.moving === 'moving' && !isMoving) return false;
        if (filters.moving === 'stopped' && isMoving) return false;
      }

      return true;
    });
  }, [vehicles, filters, searchQuery]);

  // Vehicles with tracking for map
  const vehiclesWithTracking = useMemo(() => {
    return filteredVehicles.filter(v => v.hasTracking);
  }, [filteredVehicles]);

  const resetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      online: 'all',
      moving: 'all'
    });
    setSearchQuery('');
  };

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.type !== 'all' || 
    filters.online !== 'all' || 
    filters.moving !== 'all' ||
    searchQuery !== '';

  if (loading) {
    return <Loader fullScreen text="Loading map..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Map</h1>
          <p className="text-gray-500">
            Real-time GPS tracking of all vehicles
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-500 hidden sm:block">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-outline btn-sm ${hasActiveFilters ? 'border-blue-500 text-blue-600' : ''}`}
          >
            <FiFilter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                Active
              </span>
            )}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-primary btn-sm"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiTruck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalDevices || 0}</p>
              <p className="text-xs text-gray-500">Total Tracked</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiWifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.onlineDevices || 0}</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <FiNavigation className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.movingVehicles || 0}</p>
              <p className="text-xs text-gray-500">Moving</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FiClock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.stoppedVehicles || 0}</p>
              <p className="text-xs text-gray-500">Stopped</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FiWifiOff className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.offlineDevices || 0}</p>
              <p className="text-xs text-gray-500">Offline</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiActivity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeRides || 0}</p>
              <p className="text-xs text-gray-500">Active Rides</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Vehicle number or driver..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Cab">Cab</option>
                <option value="Crew Cab">Crew Cab</option>
              </select>
            </div>

            {/* Online Filter */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Connection</label>
              <select
                value={filters.online}
                onChange={(e) => setFilters(f => ({ ...f, online: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Moving Filter */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Movement</label>
              <select
                value={filters.moving}
                onChange={(e) => setFilters(f => ({ ...f, moving: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="moving">Moving</option>
                <option value="stopped">Stopped</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-4 h-4 inline mr-1" />
                  Reset
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Map */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <TrackingMap
              vehicles={vehiclesWithTracking}
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
              height="600px"
            />
          </div>
        </div>

        {/* Vehicle List */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Vehicles ({filteredVehicles.length})
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {vehiclesWithTracking.length} with GPS tracking
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredVehicles.length === 0 ? (
                <div className="p-8 text-center">
                  <FiTruck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No vehicles match your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredVehicles.map((vehicle) => (
                    <button
                      key={vehicle._id}
                      onClick={() => vehicle.hasTracking && setSelectedVehicle(vehicle)}
                      disabled={!vehicle.hasTracking}
                      className={`w-full p-4 text-left transition-colors ${
                        selectedVehicle?._id === vehicle._id 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-50'
                      } ${!vehicle.hasTracking ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {vehicle.vehicleNumber}
                          </span>
                          {vehicle.hasTracking && vehicle.tracking?.isOnline ? (
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          ) : vehicle.hasTracking ? (
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          ) : (
                            <FiAlertTriangle className="w-3 h-3 text-amber-500" title="No GPS" />
                          )}
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          vehicle.status === 'available' 
                            ? 'bg-green-100 text-green-700'
                            : vehicle.status === 'busy'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {vehicle.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 space-y-1">
                        <p>{vehicle.type}</p>
                        {vehicle.currentDriver && (
                          <p className="flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            {vehicle.currentDriver.name}
                          </p>
                        )}
                        {vehicle.hasTracking && vehicle.tracking && (
                          <div className="flex items-center gap-3 pt-1">
                            <span className="flex items-center gap-1">
                              <FiZap className="w-3 h-3" />
                              {vehicle.tracking.speed} km/h
                            </span>
                            {vehicle.tracking.isOnline && (
                              <span className={`text-xs ${
                                vehicle.tracking.speed > 0 ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {vehicle.tracking.speed > 0 ? 'Moving' : 'Stopped'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Vehicle Details */}
      {selectedVehicle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {selectedVehicle.vehicleNumber}
                {selectedVehicle.tracking?.isOnline ? (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Online</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">Offline</span>
                )}
              </h3>
              <p className="text-sm text-gray-500">{selectedVehicle.type}</p>
            </div>
            <button
              onClick={() => setSelectedVehicle(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Driver Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Current Driver</h4>
              {selectedVehicle.currentDriver ? (
                <div>
                  <p className="font-medium text-gray-900">{selectedVehicle.currentDriver.name}</p>
                  <p className="text-sm text-gray-500">{selectedVehicle.currentDriver.phone}</p>
                </div>
              ) : (
                <p className="text-gray-400">No driver assigned</p>
              )}
            </div>

            {/* Location */}
            {selectedVehicle.tracking && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Location</h4>
                <p className="font-medium text-gray-900">
                  {selectedVehicle.tracking.latitude?.toFixed(6)}, {selectedVehicle.tracking.longitude?.toFixed(6)}
                </p>
                <p className="text-sm text-gray-500">
                  Heading: {selectedVehicle.tracking.heading}°
                </p>
              </div>
            )}

            {/* Speed & Status */}
            {selectedVehicle.tracking && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Speed</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedVehicle.tracking.speed} <span className="text-sm font-normal">km/h</span>
                </p>
                <p className="text-sm text-gray-500">
                  Ignition: {selectedVehicle.tracking.ignitionOn ? 'ON' : 'OFF'}
                </p>
              </div>
            )}

            {/* Last Update */}
            {selectedVehicle.tracking && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Last Update</h4>
                <p className="font-medium text-gray-900">
                  {new Date(selectedVehicle.tracking.lastUpdate).toLocaleString()}
                </p>
                {selectedVehicle.tracking.stopTime && selectedVehicle.tracking.speed === 0 && (
                  <p className="text-sm text-gray-500">
                    Stopped since: {selectedVehicle.tracking.stopTime}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MapView;