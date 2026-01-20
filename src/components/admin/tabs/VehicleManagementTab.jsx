import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTruck,
  FiRefreshCw,
  FiTool,
  FiAlertCircle,
} from 'react-icons/fi';
import { vehiclesAPI } from '../../../services/api';
import Loader from '../../common/Loader';
import EmptyState from '../../common/EmptyState';
import VehicleForm from '../VehicleForm';
import ConfirmDialog from '../../common/ConfirmDialog';
import { formatDistance } from '../../../utils/formatters';
import toast from 'react-hot-toast';

const VehicleManagementTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState([]); // ✅ ALWAYS initialize as array
  const [counts, setCounts] = useState({
    total: 0,
    available: 0,
    busy: 0,
    maintenance: 0,
  });
  const [error, setError] = useState(null);

  // Modal states
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError(null);

      console.log('🔍 Fetching vehicles data...');
      console.log('API Base URL:', import.meta.env.VITE_API_URL);

      const [vehiclesRes, countsRes] = await Promise.all([
        vehiclesAPI.getAll(),
        vehiclesAPI.getCounts(),
      ]);

      console.log('📦 Raw Vehicles Response:', vehiclesRes);
      console.log('📦 Raw Counts Response:', countsRes);

      // ✅ ULTRA-DEFENSIVE: Handle all possible response structures
      let vehiclesData = [];
      
      if (vehiclesRes?.data?.vehicles) {
        if (Array.isArray(vehiclesRes.data.vehicles)) {
          vehiclesData = vehiclesRes.data.vehicles;
          console.log('✅ Found vehicles at: vehiclesRes.data.vehicles');
        } else {
          console.error('❌ vehiclesRes.data.vehicles is not an array:', typeof vehiclesRes.data.vehicles);
        }
      } else if (Array.isArray(vehiclesRes?.data)) {
        vehiclesData = vehiclesRes.data;
        console.log('✅ Found vehicles at: vehiclesRes.data');
      } else if (Array.isArray(vehiclesRes)) {
        vehiclesData = vehiclesRes;
        console.log('✅ Found vehicles at: vehiclesRes (root)');
      } else {
        console.error('❌ Unexpected vehicles response structure:', vehiclesRes);
      }

      // ✅ Validate each vehicle is an object
      vehiclesData = vehiclesData.filter((v, index) => {
        if (!v || typeof v !== 'object') {
          console.warn(`⚠️ Invalid vehicle at index ${index}:`, v);
          return false;
        }
        return true;
      });

      console.log(`✅ Parsed ${vehiclesData.length} valid vehicles`);

      // ✅ Handle counts
      let countsData = { total: 0, available: 0, busy: 0, maintenance: 0 };
      
      if (countsRes?.data?.counts) {
        countsData = countsRes.data.counts;
      } else if (countsRes?.data?.total !== undefined) {
        countsData = countsRes.data;
      }

      // ✅ CRITICAL: Ensure state is ALWAYS set with valid arrays
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setCounts({
        total: Number(countsData.total) || 0,
        available: Number(countsData.available) || 0,
        busy: Number(countsData.busy) || 0,
        maintenance: Number(countsData.maintenance) || 0,
      });

    } catch (error) {
      console.error('❌ Fetch error:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load vehicles';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // ✅ CRITICAL: Set safe defaults on error
      setVehicles([]);
      setCounts({ total: 0, available: 0, busy: 0, maintenance: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // ✅ Catch errors in useEffect
    try {
      fetchData();
    } catch (err) {
      console.error('❌ Error in useEffect:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(false);
  };

  const handleCreateVehicle = () => {
    setSelectedVehicle(null);
    setShowVehicleForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteDialog(true);
  };

  const handleSetMaintenance = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowMaintenanceDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedVehicle) return;

    setActionLoading(true);
    try {
      await vehiclesAPI.delete(selectedVehicle._id);
      toast.success('Vehicle deleted successfully');
      setShowDeleteDialog(false);
      setSelectedVehicle(null);
      fetchData(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmMaintenance = async () => {
    if (!selectedVehicle) return;

    setActionLoading(true);
    try {
      await vehiclesAPI.setMaintenance(selectedVehicle._id);
      toast.success('Vehicle set to maintenance');
      setShowMaintenanceDialog(false);
      setSelectedVehicle(null);
      fetchData(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set maintenance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSuccess = () => {
    fetchData(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Show loading state
  if (loading) {
    return <Loader text="Loading vehicles..." />;
  }

  // ✅ Show error state
  if (error && (!Array.isArray(vehicles) || vehicles.length === 0)) {
    return (
      <div className="card">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiAlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Vehicles</h3>
          <p className="text-gray-500 text-center max-w-md mb-4">{error}</p>
          <div className="flex gap-3">
            <button onClick={() => window.location.reload()} className="btn btn-outline">
              Reload Page
            </button>
            <button onClick={() => fetchData()} className="btn btn-primary">
              <FiRefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ CRITICAL: Create safe array reference
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gray-50">
          <p className="text-sm text-gray-500">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-900">{counts.total || 0}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-green-600">Available</p>
          <p className="text-2xl font-bold text-green-700">{counts.available || 0}</p>
        </div>
        <div className="card bg-yellow-50">
          <p className="text-sm text-yellow-600">Busy</p>
          <p className="text-2xl font-bold text-yellow-700">{counts.busy || 0}</p>
        </div>
        <div className="card bg-red-50">
          <p className="text-sm text-red-600">Maintenance</p>
          <p className="text-2xl font-bold text-red-700">{counts.maintenance || 0}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Vehicle List ({safeVehicles.length})
        </h3>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline"
          >
            <FiRefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={handleCreateVehicle} className="btn btn-primary">
            <FiPlus className="w-5 h-5 mr-2" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      {safeVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeVehicles.map((vehicle, index) => {
            // ✅ Extra safety check
            if (!vehicle || typeof vehicle !== 'object') {
              console.warn(`Skipping invalid vehicle at index ${index}`);
              return null;
            }

            return (
              <motion.div
                key={vehicle._id || `vehicle-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FiTruck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {vehicle.vehicleNumber || 'Unknown'}
                      </h4>
                      <p className="text-sm text-gray-500">{vehicle.type || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status || 'unknown'}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Total Mileage</p>
                    <p className="font-semibold text-gray-900">
                      {formatDistance(vehicle.totalMileage || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly Mileage</p>
                    <p className="font-semibold text-gray-900">
                      {formatDistance(vehicle.monthlyMileage || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Rides</p>
                    <p className="font-semibold text-gray-900">{vehicle.totalRides || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Driver</p>
                    <p className="font-semibold text-gray-900">
                      {vehicle.currentDriver?.name || '-'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleEditVehicle(vehicle)}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    <FiEdit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  {vehicle.status !== 'maintenance' && (
                    <button
                      onClick={() => handleSetMaintenance(vehicle)}
                      className="btn btn-sm text-amber-600 hover:bg-amber-50 border border-amber-200"
                      title="Set to Maintenance"
                    >
                      <FiTool className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteVehicle(vehicle)}
                    className="btn btn-sm text-red-600 hover:bg-red-50 border border-red-200"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={FiTruck}
            title="No vehicles found"
            description="Add your first vehicle to get started"
            actionLabel="Add Vehicle"
            onAction={handleCreateVehicle}
          />
        </div>
      )}

      {/* Modals */}
      {showVehicleForm && (
        <VehicleForm
          vehicle={selectedVehicle}
          isOpen={showVehicleForm}
          onClose={() => {
            setShowVehicleForm(false);
            setSelectedVehicle(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedVehicle(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Vehicle"
          message={`Are you sure you want to delete vehicle ${selectedVehicle?.vehicleNumber}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          loading={actionLoading}
        />
      )}

      {showMaintenanceDialog && (
        <ConfirmDialog
          isOpen={showMaintenanceDialog}
          onClose={() => {
            setShowMaintenanceDialog(false);
            setSelectedVehicle(null);
          }}
          onConfirm={confirmMaintenance}
          title="Set to Maintenance"
          message={`Are you sure you want to set vehicle ${selectedVehicle?.vehicleNumber} to maintenance mode?`}
          confirmText="Set Maintenance"
          cancelText="Cancel"
          type="warning"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default VehicleManagementTab;
