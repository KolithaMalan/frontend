import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTruck,
  FiRefreshCw,
  FiTool,
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
  const [vehicles, setVehicles] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    available: 0,
    busy: 0,
    maintenance: 0,
  });

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

      const [vehiclesRes, countsRes] = await Promise.all([
        vehiclesAPI.getAll(),
        vehiclesAPI.getCounts(),
      ]);

      // ✅ FIX: Add safety checks for API response
      const vehiclesData = vehiclesRes?.data?.vehicles;
      const countsData = countsRes?.data?.counts;

      // Ensure vehicles is always an array
      if (Array.isArray(vehiclesData)) {
        setVehicles(vehiclesData);
      } else if (Array.isArray(vehiclesRes?.data)) {
        // Maybe API returns array directly
        setVehicles(vehiclesRes.data);
      } else {
        console.warn('Unexpected vehicles response format:', vehiclesRes?.data);
        setVehicles([]);
      }

      // Ensure counts has default values
      setCounts({
        total: countsData?.total || 0,
        available: countsData?.available || 0,
        busy: countsData?.busy || 0,
        maintenance: countsData?.maintenance || 0,
      });

    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      toast.error('Failed to load vehicles');
      // ✅ Set empty arrays on error
      setVehicles([]);
      setCounts({
        total: 0,
        available: 0,
        busy: 0,
        maintenance: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
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
      const message = error.response?.data?.message || 'Failed to delete vehicle';
      toast.error(message);
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
      const message = error.response?.data?.message || 'Failed to set maintenance';
      toast.error(message);
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

  if (loading) {
    return <Loader text="Loading vehicles..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gray-50">
          <p className="text-sm text-gray-500">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-green-600">Available</p>
          <p className="text-2xl font-bold text-green-700">{counts.available}</p>
        </div>
        <div className="card bg-yellow-50">
          <p className="text-sm text-yellow-600">Busy</p>
          <p className="text-2xl font-bold text-yellow-700">{counts.busy}</p>
        </div>
        <div className="card bg-red-50">
          <p className="text-sm text-red-600">Maintenance</p>
          <p className="text-2xl font-bold text-red-700">{counts.maintenance}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Vehicle List ({counts.total})
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
          <button
            onClick={handleCreateVehicle}
            className="btn btn-primary"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Vehicles Grid - ✅ Added safety check */}
      {Array.isArray(vehicles) && vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <motion.div
              key={vehicle._id}
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
                      {vehicle.vehicleNumber}
                    </h4>
                    <p className="text-sm text-gray-500">{vehicle.type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Total Mileage</p>
                  <p className="font-semibold text-gray-900">{formatDistance(vehicle.totalMileage || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monthly Mileage</p>
                  <p className="font-semibold text-gray-900">{formatDistance(vehicle.monthlyMileage || 0)}</p>
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
          ))}
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

      {/* Vehicle Form Modal */}
      <VehicleForm
        vehicle={selectedVehicle}
        isOpen={showVehicleForm}
        onClose={() => {
          setShowVehicleForm(false);
          setSelectedVehicle(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation */}
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

      {/* Maintenance Confirmation */}
      <ConfirmDialog
        isOpen={showMaintenanceDialog}
        onClose={() => {
          setShowMaintenanceDialog(false);
          setSelectedVehicle(null);
        }}
        onConfirm={confirmMaintenance}
        title="Set to Maintenance"
        message={`Are you sure you want to set vehicle ${selectedVehicle?.vehicleNumber} to maintenance mode? It will not be available for assignment.`}
        confirmText="Set Maintenance"
        cancelText="Cancel"
        type="warning"
        loading={actionLoading}
      />
    </div>
  );
};

export default VehicleManagementTab;
