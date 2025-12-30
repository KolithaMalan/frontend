import React from 'react';
import Modal from './Modal';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, danger, success, info
  loading = false,
}) => {
  const typeConfig = {
    warning: {
      icon: FiAlertTriangle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      confirmClass: 'btn-warning',
    },
    danger: {
      icon: FiXCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmClass: 'btn-danger',
    },
    success: {
      icon: FiCheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      confirmClass: 'btn-success',
    },
    info: {
      icon: FiInfo,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmClass: 'btn-secondary',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500">{message}</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-outline flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${config.confirmClass} flex-1`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;