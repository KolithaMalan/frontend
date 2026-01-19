import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin,
  FiNavigation,
  FiCalendar,
  FiClock,
  FiCheck,
  FiX,
  FiMap,
  FiAlertTriangle,
  FiTruck,
  FiRefreshCw,
  FiFileText,
} from 'react-icons/fi';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatTime, formatDistance, formatAddress } from '../../utils/formatters';
import { RIDE_TYPE_LABELS, PM_APPROVAL_THRESHOLD_KM, VEHICLE_TYPE_LABELS } from '../../utils/constants';

const RideApprovalCard = ({ 
  ride, 
  onApprove, 
  onReject, 
  onViewMap,
  onAssign,
  onReassign,
  showAssign = false,
  showReassign = false,
  type = 'approval',
  userRole = null
}) => {
  const isLongDistance = ride.calculatedDistance > PM_APPROVAL_THRESHOLD_KM;
  
  // Approval note state
  const [approvalNote, setApprovalNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteError, setNoteError] = useState('');

  // ✅ Rejection reason state
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectError, setRejectError] = useState('');

  const requiresApprovalNote = isLongDistance && userRole === 'admin' && type === 'approval';

  // =====================
  // APPROVAL HANDLERS
  // =====================
  const handleApproveClick = () => {
    if (requiresApprovalNote) {
      setShowNoteInput(true);
      setShowRejectInput(false);
    } else {
      onApprove?.(ride);
    }
  };

  const handleSubmitApproval = () => {
    if (requiresApprovalNote && (!approvalNote || approvalNote.trim() === '')) {
      setNoteError('Approval note is required for long-distance rides (>15km)');
      return;
    }
    
    onApprove?.(ride, approvalNote.trim());
    
    setShowNoteInput(false);
    setApprovalNote('');
    setNoteError('');
  };

  const handleCancelNote = () => {
    setShowNoteInput(false);
    setApprovalNote('');
    setNoteError('');
  };

  // =====================
  // REJECTION HANDLERS
  // =====================
  const handleRejectClick = () => {
    setShowRejectInput(true);
    setShowNoteInput(false);
    setRejectionReason('');
    setRejectError('');
  };

  const handleSubmitRejection = () => {
    if (!rejectionReason || rejectionReason.trim() === '') {
      setRejectError('Rejection reason is required');
      return;
    }
    
    if (rejectionReason.trim().length < 10) {
      setRejectError('Please provide a more detailed reason (at least 10 characters)');
      return;
    }
    
    onReject?.(ride, rejectionReason.trim());
    
    setShowRejectInput(false);
    setRejectionReason('');
    setRejectError('');
  };

  const handleCancelReject = () => {
    setShowRejectInput(false);
    setRejectionReason('');
    setRejectError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Ride #{ride.rideId}
            </h3>
            <span className="badge badge-info">
              {RIDE_TYPE_LABELS[ride.rideType]}
            </span>
          </div>
          <StatusBadge status={ride.status} type="ride" />
        </div>

        <div className="text-right">
          <div className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            ${isLongDistance ? 'bg-amber-100' : 'bg-gray-100'}
          `}>
            <FiNavigation className={`w-4 h-4 ${isLongDistance ? 'text-amber-600' : 'text-gray-600'}`} />
            <span className={`text-lg font-bold ${isLongDistance ? 'text-amber-600' : 'text-gray-900'}`}>
              {formatDistance(ride.calculatedDistance)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isLongDistance ? 'Long Distance' : 'Short Distance'}
          </p>
        </div>
      </div>

      {/* Long Distance Alert - Admin */}
      {isLongDistance && type === 'approval' && userRole === 'admin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Long Distance Alert</p>
              <p className="text-sm text-amber-700 mt-0.5">
                This {ride.rideType === 'return' ? 'return trip' : 'ride'} is {ride.calculatedDistance} km. 
                <strong> A note is required if you approve this ride.</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Long Distance Alert - PM */}
      {isLongDistance && type === 'approval' && userRole === 'project_manager' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">PM Approval Required</p>
              <p className="text-sm text-blue-700 mt-0.5">
                This ride is {ride.calculatedDistance} km and requires your approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Requester Info */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {ride.requester?.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{ride.requester?.name}</p>
          <p className="text-sm text-gray-600 truncate">{ride.requester?.email}</p>
        </div>
      </div>

      {/* Vehicle Type */}
      {ride.requiredVehicleType && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mb-4">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <FiTruck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-purple-600 uppercase">Required Vehicle Type</p>
            <p className="font-medium text-gray-900">
              {VEHICLE_TYPE_LABELS[ride.requiredVehicleType] || ride.requiredVehicleType}
            </p>
          </div>
        </div>
      )}

      {/* Locations */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiMapPin className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-600 uppercase mb-1">Pickup Location</p>
            <p className="text-sm text-gray-900 leading-relaxed">
              {formatAddress(ride.pickupLocation?.address, 80)}
            </p>
          </div>
        </div>

        <div className="ml-5 border-l-2 border-dashed border-gray-300 h-6"></div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiNavigation className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-600 uppercase mb-1">Destination</p>
            <p className="text-sm text-gray-900 leading-relaxed">
              {formatAddress(ride.destinationLocation?.address, 80)}
            </p>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="flex flex-wrap items-center gap-4 py-3 px-3 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">{formatDate(ride.scheduledDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">{formatTime(ride.scheduledTime)}</span>
        </div>
        {ride.requiredVehicleType && (
          <div className="flex items-center gap-2">
            <FiTruck className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              {VEHICLE_TYPE_LABELS[ride.requiredVehicleType]}
            </span>
          </div>
        )}
      </div>

      {/* Driver Info (if assigned) */}
      {ride.assignedDriver && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {ride.assignedDriver.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">
                {ride.assignedDriver.name}
              </p>
              <p className="text-xs text-purple-700">
                {ride.assignedVehicle?.vehicleNumber} • {ride.assignedDriver.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* APPROVAL NOTE INPUT */}
      {/* ===================== */}
      <AnimatePresence>
        {showNoteInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <FiFileText className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-amber-900">Admin Approval Note Required</h4>
            </div>
            
            <p className="text-sm text-amber-700 mb-3">
              This is a long-distance ride. Please provide a reason for approving this ride.
            </p>
            
            <textarea
              value={approvalNote}
              onChange={(e) => {
                setApprovalNote(e.target.value);
                setNoteError('');
              }}
              placeholder="Enter approval reason..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none ${
                noteError ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              maxLength={500}
            />
            
            {noteError && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <FiAlertTriangle className="w-4 h-4" />
                {noteError}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500">
                {approvalNote.length}/500 characters
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCancelNote}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApproval}
                  className="btn btn-success btn-sm"
                >
                  <FiCheck className="w-4 h-4 mr-1" />
                  Approve
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== */}
      {/* REJECTION REASON INPUT */}
      {/* ===================== */}
      <AnimatePresence>
        {showRejectInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <FiX className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-900">Rejection Reason Required</h4>
            </div>
            
            <p className="text-sm text-red-700 mb-3">
              Please provide a reason for rejecting this ride. The requester will be notified with this reason via SMS and Email.
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setRejectError('');
              }}
              placeholder="Enter the reason for rejecting this ride request..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${
                rejectError ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              maxLength={500}
              autoFocus
            />
            
            {rejectError && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <FiAlertTriangle className="w-4 h-4" />
                {rejectError}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500">
                {rejectionReason.length}/500 characters (minimum 10)
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCancelReject}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRejection}
                  className="btn btn-danger btn-sm"
                >
                  <FiX className="w-4 h-4 mr-1" />
                  Confirm Rejection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== */}
      {/* ACTION BUTTONS */}
      {/* ===================== */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
        {/* Approval/Rejection Buttons - Only show when no input is open */}
        {type === 'approval' && !showNoteInput && !showRejectInput && (
          <>
            <button
              onClick={handleApproveClick}
              className="btn btn-success flex-1"
            >
              <FiCheck className="w-5 h-5 mr-2" />
              {requiresApprovalNote ? 'Approve with Note' : 'Approve'}
            </button>
            <button
              onClick={handleRejectClick}
              className="btn btn-danger flex-1"
            >
              <FiX className="w-5 h-5 mr-2" />
              Reject
            </button>
          </>
        )}

        {/* Assignment Button */}
        {type === 'assignment' && (
          <button
            onClick={() => onAssign?.(ride)}
            className="btn btn-primary flex-1"
          >
            <FiTruck className="w-5 h-5 mr-2" />
            Assign Driver & Vehicle
          </button>
        )}

        {/* Reassignment Button */}
        {(showReassign || type === 'assigned') && (
          <button
            onClick={() => onReassign?.(ride)}
            className="btn btn-warning flex-1"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Reassign Driver & Vehicle
          </button>
        )}

        {/* View Map - Only show when no input is open */}
        {!showNoteInput && !showRejectInput && (
          <button
            onClick={() => onViewMap?.(ride)}
            className="btn btn-outline sm:w-auto w-full"
          >
            <FiMap className="w-5 h-5 mr-2" />
            View Map
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default RideApprovalCard;
