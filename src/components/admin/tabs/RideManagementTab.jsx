import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiClock,
  FiCheckCircle,
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {awaitingApproval.map((ride) => (
              <RideApprovalCard
                key={ride._id}
                ride={ride}
                type="approval"
                userRole="admin"
                onApprove={handleApprove}
                onReject={handleReject}  {/* ✅ Now passes reason */}
                onViewMap={handleViewMap}
              />
            ))}
          </div>
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
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FiCheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Approved Rides - Driver & Vehicle Assignment
            </h2>
            <p className="text-sm text-gray-500">
              {readyForAssignment.length} ride(s) ready for assignment
            </p>
          </div>
        </div>

        {readyForAssignment.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {readyForAssignment.map((ride) => (
              <RideApprovalCard
                key={ride._id}
                ride={ride}
                type="assignment"
                onAssign={handleAssign}
                onViewMap={handleViewMap}
              />
            ))}
          </div>
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
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FiTruck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Assigned Rides - Manage Assignments
            </h2>
            <p className="text-sm text-gray-500">
              {assignedRides.length} ride(s) currently assigned (can be reassigned if needed)
            </p>
          </div>
        </div>

        {assignedRides.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {assignedRides.map((ride) => (
              <AssignmentCard
                key={ride._id}
                ride={ride}
                onAssigned={handleAssignmentComplete}
                onReassigned={handleAssignmentComplete}
              />
            ))}
          </div>
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
