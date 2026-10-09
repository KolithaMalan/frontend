import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClock,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiAlertCircle,
  FiTruck,
} from 'react-icons/fi';
import { ridesAPI } from '../../../services/api';
import Loader from '../../common/Loader';
import EmptyState from '../../common/EmptyState';
import RideApprovalCard from '../RideApprovalCard';
import AssignmentForm from '../AssignmentForm';
import AssignmentCard from '../AssignmentCard';
import MapComponent from '../../maps/MapComponent';
import Modal from '../../common/Modal';
import toast from 'react-hot-toast';

const RideManagementTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState([]);
  const [readyForAssignment, setReadyForAssignment] = useState([]);
  const [assignedRides, setAssignedRides] = useState([]);

  // Show more/less state for each section
  const MAX_VISIBLE = 6;
  const [showAllAwaiting, setShowAllAwaiting] = useState(false);
  const [showAllReady, setShowAllReady] = useState(false);
  const [showAllAssigned, setShowAllAssigned] = useState(false);

  // Compute visible rides for each section
  const visibleAwaiting = useMemo(
    () => showAllAwaiting ? awaitingApproval : awaitingApproval.slice(0, MAX_VISIBLE),
    [awaitingApproval, showAllAwaiting]
  );
  const visibleReady = useMemo(
    () => showAllReady ? readyForAssignment : readyForAssignment.slice(0, MAX_VISIBLE),
    [readyForAssignment, showAllReady]
  );
  const visibleAssigned = useMemo(
    () => showAllAssigned ? assignedRides : assignedRides.slice(0, MAX_VISIBLE),
    [assignedRides, showAllAssigned]
  );

  // Modal states
  const [selectedRide, setSelectedRide] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const [awaitingRes, readyRes, assignedRes] = await Promise.all([
        ridesAPI.getAwaitingAdmin(),
        ridesAPI.getReadyForAssignment(),
        ridesAPI.getAll({ status: 'assigned', limit: 50 }),
      ]);

      setAwaitingApproval(awaitingRes.data.rides);
      setReadyForAssignment(readyRes.data.rides);
      setAssignedRides(assignedRes.data.rides);
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(false);
  };

  // ✅ Handle Approve (with optional note for long distance)
  const handleApprove = async (ride, note = '') => {
    try {
      await ridesAPI.adminApprove(ride._id, note);
      toast.success(`Ride #${ride.rideId} approved successfully!`);
      fetchData(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve ride');
    }
  };

  // ✅ UPDATED: Handle Reject with required reason
  const handleReject = async (ride, reason) => {
    try {
      await ridesAPI.adminReject(ride._id, reason);
      toast.success(`Ride #${ride.rideId} rejected. Requester has been notified.`);
      fetchData(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject ride');
    }
  };

  const handleAssign = (ride) => {
    setSelectedRide(ride);
    setIsReassigning(false);
    setShowAssignModal(true);
  };

  const handleReassign = (ride) => {
    setSelectedRide(ride);
    setIsReassigning(true);
    setShowAssignModal(true);
  };

  const handleViewMap = (ride) => {
    setSelectedRide(ride);
    setShowMapModal(true);
  };

  const handleAssignmentComplete = () => {
    setShowAssignModal(false);
    setSelectedRide(null);
    setIsReassigning(false);
    fetchData(false);
  };

  if (loading) {
    return <Loader text="Loading rides..." />;
  }

  return (
    <div className="space-y-8">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-outline btn-sm"
        >
          <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* 1. Rides Awaiting Admin Approval */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <FiClock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Rides Awaiting Admin Approval
            </h2>
            <p className="text-sm text-gray-500">
              {awaitingApproval.length} ride(s) pending your approval
            </p>
          </div>
        </div>

        {awaitingApproval.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence initial={false}>
                {visibleAwaiting.map((ride) => (
                  <motion.div
                    key={ride._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <RideApprovalCard
                      ride={ride}
                      type="approval"
                      userRole="admin"
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onViewMap={handleViewMap}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {awaitingApproval.length > MAX_VISIBLE && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllAwaiting((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full transition-all duration-200 shadow-sm hover:shadow"
                >
                  {showAllAwaiting ? (
                    <>
                      <FiChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <FiChevronDown className="w-4 h-4" />
                      Show More ({awaitingApproval.length - MAX_VISIBLE} more)
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card bg-gray-50">
            <EmptyState
              icon={FiCheckCircle}
              title="No pending approvals"
              description="All rides have been reviewed."
            />
          </div>
        )}
      </div>

      {/* 2. Approved Rides - Ready for Assignment */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <FiCheckCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Approved Rides - Driver & Vehicle Assignment
            </h2>
            <p className="text-sm text-teal-600 font-medium">
              {readyForAssignment.length} ride(s) ready for assignment
            </p>
          </div>
        </div>

        {readyForAssignment.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence initial={false}>
                {visibleReady.map((ride) => (
                  <motion.div
                    key={ride._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <RideApprovalCard
                      ride={ride}
                      type="assignment"
                      cardVariant="teal"
                      onAssign={handleAssign}
                      onViewMap={handleViewMap}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {readyForAssignment.length > MAX_VISIBLE && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllReady((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-full transition-all duration-200 shadow-sm hover:shadow"
                >
                  {showAllReady ? (
                    <>
                      <FiChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <FiChevronDown className="w-4 h-4" />
                      Show More ({readyForAssignment.length - MAX_VISIBLE} more)
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card bg-gray-50">
            <EmptyState
              icon={FiAlertCircle}
              title="No rides pending assignment"
              description="All approved rides have been assigned."
            />
          </div>
        )}
      </div>

      {/* 3. Assigned Rides - Reassignment Available */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FiTruck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Assigned Rides - Manage Assignments
            </h2>
            <p className="text-sm text-indigo-600 font-medium">
              {assignedRides.length} ride(s) currently assigned (can be reassigned if needed)
            </p>
          </div>
        </div>

        {assignedRides.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence initial={false}>
                {visibleAssigned.map((ride) => (
                  <motion.div
                    key={ride._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AssignmentCard
                      ride={ride}
                      onAssigned={handleAssignmentComplete}
                      onReassigned={handleAssignmentComplete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {assignedRides.length > MAX_VISIBLE && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllAssigned((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full transition-all duration-200 shadow-sm hover:shadow"
                >
                  {showAllAssigned ? (
                    <>
                      <FiChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <FiChevronDown className="w-4 h-4" />
                      Show More ({assignedRides.length - MAX_VISIBLE} more)
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card bg-gray-50">
            <EmptyState
              icon={FiTruck}
              title="No assigned rides"
              description="No rides are currently assigned to drivers."
            />
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      <AssignmentForm
        ride={selectedRide}
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedRide(null);
          setIsReassigning(false);
        }}
        onSuccess={handleAssignmentComplete}
        isReassign={isReassigning}
      />

      {/* ✅ REMOVED: Old ConfirmDialog - rejection now handled in RideApprovalCard */}

      {/* Map Modal */}
      <Modal
        isOpen={showMapModal}
        onClose={() => {
          setShowMapModal(false);
          setSelectedRide(null);
        }}
        title={`Ride #${selectedRide?.rideId} - Route Map`}
        size="lg"
      >
        <div className="p-4">
          <MapComponent
            pickup={selectedRide?.pickupLocation}
            destination={selectedRide?.destinationLocation}
            height="400px"
          />
        </div>
      </Modal>
    </div>
  );
};

export default RideManagementTab;
