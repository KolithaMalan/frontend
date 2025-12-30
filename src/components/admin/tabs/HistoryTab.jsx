import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiMapPin,
  FiNavigation,
  FiX,
} from 'react-icons/fi';
import { reportsAPI } from '../../../services/api';
import Loader from '../../common/Loader';
import EmptyState from '../../common/EmptyState';
import StatusBadge from '../../common/StatusBadge';
import RideDetails from '../../rides/RideDetails';
import { formatDate, formatTime, formatDistance, formatAddress } from '../../../utils/formatters';
import { generateRideHistoryPDF } from '../../../utils/pdfGenerator';
import { RIDE_STATUS_LABELS } from '../../../utils/constants';
import toast from 'react-hot-toast';

const HistoryTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [rides, setRides] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideDetails, setShowRideDetails] = useState(false);

  const fetchHistory = useCallback(async (showLoader = true, page = 1) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const params = {
        page,
        limit: pagination.limit,
        startDate: startDate?.toISOString()?.split('T')[0],
        endDate: endDate?.toISOString()?.split('T')[0],
        status: statusFilter || undefined,
      };

      console.log('📅 Fetching history with params:', params);

      const response = await reportsAPI.getRideHistory(params);
      setRides(response.data.rides);
      setPagination({
        page: response.data.currentPage,
        limit: pagination.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error('❌ Failed to fetch history:', error);
      toast.error('Failed to load ride history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, statusFilter, pagination.limit]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFilter = () => {
    fetchHistory(true, 1);
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStatusFilter('');
    setTimeout(() => fetchHistory(true, 1), 100);
  };

  const handleRefresh = () => {
    fetchHistory(false, pagination.page);
  };

  const handleViewRide = (ride) => {
    setSelectedRide(ride);
    setShowRideDetails(true);
  };

  const handleExport = async () => {
    if (!rides || rides.length === 0) {
      toast.error('No rides to export');
      return;
    }

    setExporting(true);
    try {
      console.log('📄 Generating PDF for', rides.length, 'rides');
      
      await generateRideHistoryPDF(rides, {
        startDate,
        endDate,
        status: statusFilter,
      });
      
      toast.success(`PDF report with ${rides.length} rides generated successfully!`);
    } catch (error) {
      console.error('❌ Export error:', error);
      toast.error(error.message || 'Failed to generate PDF report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading history..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters - BEAUTIFUL DESIGN */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
          {/* Start Date */}
          <div className="lg:col-span-1">
            <label className="label">Start Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                placeholderText="Select start date"
                className="input pl-10 w-full"
                dateFormat="dd/MM/yyyy"
                maxDate={endDate || new Date()}
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="lg:col-span-1">
            <label className="label">End Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                placeholderText="Select end date"
                className="input pl-10 w-full"
                dateFormat="dd/MM/yyyy"
                minDate={startDate}
                maxDate={new Date()}
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-1">
            <label className="label">Status</label>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10 pr-10 appearance-none bg-white cursor-pointer w-full"
              >
                <option value="">All Statuses</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">🚫 Cancelled</option>
                <option value="rejected">❌ Rejected</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Apply Filters */}
          <div className="lg:col-span-1">
            <button onClick={handleFilter} className="btn btn-primary w-full">
              <FiFilter className="w-5 h-5 mr-2" />
              Apply
            </button>
          </div>

          {/* Clear Filters */}
          <div className="lg:col-span-1">
            <button onClick={handleClearFilters} className="btn btn-outline w-full">
              <FiX className="w-5 h-5 mr-2" />
              Clear
            </button>
          </div>

          {/* Refresh */}
          <div className="lg:col-span-1">
            <button 
              onClick={handleRefresh} 
              disabled={refreshing} 
              className="btn btn-outline w-full"
            >
              <FiRefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Export */}
          <div className="lg:col-span-1">
            <button 
              onClick={handleExport} 
              disabled={exporting || !rides || rides.length === 0}
              className="btn btn-success w-full"
            >
              {exporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload className="w-5 h-5 mr-2" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      {rides.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Ride ID</th>
                  <th>Requester</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Distance</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {rides.map((ride, index) => (
                  <motion.tr
                    key={ride._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="table-row-hover"
                  >
                    <td>
                      <span className="font-mono font-medium text-gray-900">
                        #{ride.rideId}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{ride.requester?.name}</p>
                        <p className="text-sm text-gray-500">{ride.requester?.email}</p>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-xs">
                        <div className="flex items-center gap-1 text-sm">
                          <FiMapPin className="w-3 h-3 text-green-500" />
                          <span className="truncate">{formatAddress(ride.pickupLocation?.address, 30)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <FiNavigation className="w-3 h-3 text-red-500" />
                          <span className="truncate">{formatAddress(ride.destinationLocation?.address, 30)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-gray-900">{formatDate(ride.scheduledDate)}</p>
                        <p className="text-sm text-gray-500">{formatTime(ride.scheduledTime)}</p>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium text-gray-900">
                        {formatDistance(ride.actualDistance || ride.calculatedDistance)}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-900">
                        {ride.assignedDriver?.name || '-'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={ride.status} type="ride" />
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewRide(ride)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} rides
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchHistory(false, pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn btn-outline"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchHistory(false, pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-outline"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={FiCalendar}
            title="No rides found"
            description="Try adjusting your filters or date range"
          />
        </div>
      )}

      {/* Ride Details Modal */}
      <RideDetails
        ride={selectedRide}
        isOpen={showRideDetails}
        onClose={() => {
          setShowRideDetails(false);
          setSelectedRide(null);
        }}
      />
    </div>
  );
};

export default HistoryTab;