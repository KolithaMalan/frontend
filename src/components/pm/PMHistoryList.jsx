import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheck,
  FiX,
  FiClock,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { reportsAPI } from '../../services/api';
import StatusBadge from '../common/StatusBadge';
import Loader from '../common/Loader';
import { formatDate, formatTime, formatDistance } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PMHistoryList = () => {
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getMyHistory({ limit: 20 });
      // Filter for rides that required PM approval
      const pmRides = response.data.rides.filter(r => r.requiresPMApproval);
      setRides(pmRides);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (loading) {
    return <Loader text="Loading history..." />;
  }

  if (rides.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No ride history available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rides.map((ride) => (
        <motion.div
          key={ride._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {/* Header - Always visible */}
          <button
            onClick={() => toggleExpand(ride._id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  ride.status === 'completed'
                    ? 'bg-green-100'
                    : ride.status === 'rejected'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}
              >
                {ride.status === 'completed' ? (
                  <FiCheck className="w-5 h-5 text-green-600" />
                ) : ride.status === 'rejected' ? (
                  <FiX className="w-5 h-5 text-red-600" />
                ) : (
                  <FiClock className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Ride #{ride.rideId}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(ride.scheduledDate)} • {formatDistance(ride.calculatedDistance)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={ride.status} type="ride" />
              {expanded === ride._id ? (
                <FiChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <FiChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {/* Expanded Content */}
          {expanded === ride._id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 border-t border-gray-100"
            >
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Requester</p>
                    <p className="font-medium text-gray-900">{ride.requester?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-medium text-gray-900">{formatTime(ride.scheduledTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pickup</p>
                    <p className="text-gray-700 text-xs">{ride.pickupLocation?.address}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Destination</p>
                    <p className="text-gray-700 text-xs">{ride.destinationLocation?.address}</p>
                  </div>
                </div>

                {ride.approvedBy?.pm?.approvedAt && (
                  <div className="pt-3 border-t border-gray-100 text-sm text-green-600">
                    ✓ Approved on {formatDate(ride.approvedBy.pm.approvedAt, 'dd/MM/yyyy hh:mm a')}
                  </div>
                )}

                {ride.rejectedBy?.rejectedAt && (
                  <div className="pt-3 border-t border-gray-100 text-sm text-red-600">
                    ✗ Rejected on {formatDate(ride.rejectedBy.rejectedAt, 'dd/MM/yyyy hh:mm a')}
                    {ride.rejectedBy.reason && (
                      <p className="text-gray-600 mt-1">Reason: {ride.rejectedBy.reason}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default PMHistoryList;