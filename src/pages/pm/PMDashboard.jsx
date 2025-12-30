import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiRefreshCw,
  FiPlus,
  FiInbox,
  FiClock,
  FiList,
  FiBarChart2,
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';
import { ridesAPI, reportsAPI } from '../../services/api';

import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

import PMStatsCards from '../../components/pm/PMStatsCards';
import PMApprovalCard from '../../components/pm/PMApprovalCard';
import PMMapModal from '../../components/pm/PMMapModal';
import PMHistoryList from '../../components/pm/PMHistoryList';
import PMReports from '../../components/pm/PMReports';

import RideRequestForm from '../../components/rides/RideRequestForm';
import toast from 'react-hot-toast';

const PMDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState('pending'); // pending | reports | history

  // Data
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    approvedToday: 0,
    longDistanceRides: 0,
    totalProcessed: 0,
  });

  const [pendingRides, setPendingRides] = useState([]);

  // Modals
  const [selectedRide, setSelectedRide] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRideForm, setShowRideForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const ridesResponse = await ridesAPI.getAwaitingPM();
      setPendingRides(ridesResponse.data.rides);

      const statsResponse = await reportsAPI.getDashboardStats();
      setStats({
        pendingApprovals:
          statsResponse.data.stats.awaitingPM || ridesResponse.data.count,
        approvedToday: statsResponse.data.stats.approvedToday || 0,
        longDistanceRides:
          statsResponse.data.stats.longDistanceRides || 0,
        totalProcessed:
          statsResponse.data.stats.totalProcessed || 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => fetchData(false);

  const handleApprove = async (ride) => {
    setActionLoading(true);
    try {
      await ridesAPI.pmApprove(ride._id);
      toast.success(
        `Ride #${ride.rideId} approved! Admin will assign driver & vehicle.`
      );
      fetchData(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (ride) => {
    setSelectedRide(ride);
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!selectedRide) return;

    setActionLoading(true);
    try {
      await ridesAPI.pmReject(selectedRide._id);
      toast.success(`Ride #${selectedRide.rideId} rejected`);
      setShowRejectDialog(false);
      setSelectedRide(null);
      fetchData(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewMap = (ride) => {
    setSelectedRide(ride);
    setShowMapModal(true);
  };

  const handleRideCreated = () => {
    setShowRideForm(false);
    toast.success('Ride request submitted successfully!');
    fetchData(false);
  };

  if (loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header - FIXED BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-600">
            Manage long-distance ride approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline"
          >
            <FiRefreshCw
              className={`w-5 h-5 mr-2 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>

          <button
            onClick={() => setShowRideForm(true)}
            className="btn btn-primary"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Request Ride
          </button>
        </div>
      </div>

      {/* Stats */}
      <PMStatsCards stats={stats} />

      {/* View Toggle - IMPROVED */}
      <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 inline-flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveView('pending')}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
            ${
              activeView === 'pending'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <FiClock className="w-4 h-4" />
          <span>Pending Approvals</span>
          {pendingRides.length > 0 && (
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${
                  activeView === 'pending'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-500 text-white'
                }
              `}
            >
              {pendingRides.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('reports')}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
            ${
              activeView === 'reports'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <FiBarChart2 className="w-4 h-4" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => setActiveView('history')}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
            ${
              activeView === 'history'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <FiList className="w-4 h-4" />
          <span>My History</span>
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeView === 'pending' && (
          <>
            {pendingRides.length > 0 ? (
              <div className="space-y-4">
                {pendingRides.map((ride) => (
                  <PMApprovalCard
                    key={ride._id}
                    ride={ride}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewMap={handleViewMap}
                    loading={actionLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="card">
                <EmptyState
                  icon={FiInbox}
                  title="No pending approvals"
                  description="All long-distance ride requests have been processed."
                />
              </div>
            )}
          </>
        )}

        {activeView === 'reports' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Reports
            </h2>
            <PMReports />
          </div>
        )}

        {activeView === 'history' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Approval History
            </h2>
            <PMHistoryList />
          </div>
        )}
      </motion.div>

      {/* Map Modal */}
      <PMMapModal
        ride={selectedRide}
        isOpen={showMapModal}
        onClose={() => {
          setShowMapModal(false);
          setSelectedRide(null);
        }}
      />

      {/* Reject Confirmation */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          setSelectedRide(null);
        }}
        onConfirm={confirmReject}
        title="Reject Ride Request"
        message={`Are you sure you want to reject ride #${selectedRide?.rideId}?`}
        confirmText="Reject"
        type="danger"
        loading={actionLoading}
      />

      {/* Create Ride Form */}
      <RideRequestForm
        isOpen={showRideForm}
        onClose={() => setShowRideForm(false)}
        onSuccess={handleRideCreated}
      />
    </div>
  );
};

export default PMDashboard;