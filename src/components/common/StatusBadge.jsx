import React from 'react';
import { getStatusBgColor } from '../../utils/formatters';
import {
  RIDE_STATUS_LABELS,
  VEHICLE_STATUS_LABELS,
  DRIVER_STATUS_LABELS,
  ROLE_LABELS,
} from '../../utils/constants';

const StatusBadge = ({ status, type = 'ride', size = 'sm', showDot = false }) => {
  const getLabelMap = () => {
    switch (type) {
      case 'ride':
        return RIDE_STATUS_LABELS;
      case 'vehicle':
        return VEHICLE_STATUS_LABELS;
      case 'driver':
        return DRIVER_STATUS_LABELS;
      case 'role':
        return ROLE_LABELS;
      default:
        return {};
    }
  };

  const label = getLabelMap()[status] || status;
  const colorClass = getStatusBgColor(status);

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${colorClass} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
      )}
      {label}
    </span>
  );
};

export default StatusBadge;