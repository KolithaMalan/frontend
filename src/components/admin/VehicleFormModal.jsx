import React, { useState, useEffect } from 'react';
import {
  FiTruck,
  FiHash,
} from 'react-icons/fi';
import Modal from '../common/Modal';
import { vehiclesAPI } from '../../services/api';
import { VEHICLE_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

const VehicleFormModal = ({ isOpen, onClose, vehicle = null, onSuccess }) => {
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: 'Car',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleNumber: vehicle.vehicleNumber || '',
        type: vehicle.type || 'Car',
      });
    } else {
      setFormData({
        vehicleNumber: '',
        type: 'Car',
      });
    }
    setErrors({});
  }, [vehicle, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    } else if (!/^[A-Za-z]{2,3}-\d{4}$/.test(formData.vehicleNumber.toUpperCase())) {
      newErrors.vehicleNumber = 'Invalid format (e.g., NB-1985 or ABC-1234)';
    }

    if (!formData.type) {
      newErrors.type = 'Vehicle type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await vehiclesAPI.update(vehicle._id, formData);
        toast.success('Vehicle updated successfully!');
      } else {
        await vehiclesAPI.create(formData);
        toast.success('Vehicle created successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Vehicle Number */}
        <div>
          <label className="label">Vehicle Number</label>
          <div className="relative">
            <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              className={`input pl-12 uppercase ${errors.vehicleNumber ? 'input-error' : ''}`}
              placeholder="e.g., NB-1985"
            />
          </div>
          {errors.vehicleNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.vehicleNumber}</p>
          )}
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="label">Vehicle Type</label>
          <div className="relative">
            <FiTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`select pl-12 ${errors.type ? 'input-error' : ''}`}
            >
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {isEditing ? 'Updating...' : 'Adding...'}
              </span>
            ) : (
              isEditing ? 'Update Vehicle' : 'Add Vehicle'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleFormModal;