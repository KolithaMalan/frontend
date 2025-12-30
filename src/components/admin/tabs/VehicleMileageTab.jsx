import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity,
  FiTruck,
  FiRefreshCw,
  FiDownload,
} from 'react-icons/fi';
import { vehiclesAPI, reportsAPI } from '../../../services/api';
import Loader from '../../common/Loader';
import { formatDistance, formatDate } from '../../../utils/formatters';
import { generateVehicleMileagePDF } from '../../../utils/pdfGenerator';
import toast from 'react-hot-toast';

const VehicleMileageTab = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      // Parse year and month from selectedMonth
      const [year, month] = selectedMonth.split('-');
      
      console.log('📅 Fetching data for:', { year, month });

      // Call API with year and month parameters
      const response = await vehiclesAPI.getMileageSummary({ year, month });
      
      console.log('✅ Mileage data:', response.data);
      
      setSummary(response.data.summary);
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error('❌ Failed to fetch mileage data:', error);
      toast.error('Failed to load mileage data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when month changes
  useEffect(() => {
    fetchData(true);
  }, [selectedMonth]);

  const handleExport = async () => {
    if (!vehicles || vehicles.length === 0) {
      toast.error('No data to export');
      return;
    }

    setExporting(true);
    try {
      const pdfData = {
        summary,
        vehicles,
      };
      
      console.log('📄 Generating PDF with data:', pdfData);
      
      await generateVehicleMileagePDF(pdfData, selectedMonth);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('❌ Export error:', error);
      toast.error(error.message || 'Failed to generate PDF report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading mileage data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg"
        >
          <FiTruck className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{summary?.totalVehicles || 0}</p>
          <p className="text-blue-100">Total Vehicles</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg"
        >
          <FiActivity className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{summary?.activeVehicles || 0}</p>
          <p className="text-green-100">Active Vehicles</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg"
        >
          <p className="text-3xl font-bold">{formatDistance(summary?.monthlyMileage || 0)}</p>
          <p className="text-purple-100">Monthly Mileage</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg"
        >
          <p className="text-3xl font-bold">{formatDistance(summary?.totalMileage || 0)}</p>
          <p className="text-amber-100">Total Mileage</p>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <label className="label">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
              className="input w-52"
            />
          </div>
          <button onClick={() => fetchData(true)} className="btn btn-outline mt-6">
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>

        <button 
          onClick={handleExport} 
          disabled={exporting || !vehicles || vehicles.length === 0}
          className="btn btn-success mt-6"
        >
          {exporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Generating PDF...
            </>
          ) : (
            <>
              <FiDownload className="w-5 h-5 mr-2" />
              Export PDF Report
            </>
          )}
        </button>
      </div>

      {/* Mileage Table */}
      {vehicles && vehicles.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Total Rides</th>
                  <th>Monthly Mileage</th>
                  <th>Total Mileage</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="table-row-hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            vehicle.status === 'available'
                              ? 'bg-green-100'
                              : vehicle.status === 'busy'
                              ? 'bg-yellow-100'
                              : 'bg-red-100'
                          }`}
                        >
                          <FiTruck
                            className={`w-5 h-5 ${
                              vehicle.status === 'available'
                                ? 'text-green-600'
                                : vehicle.status === 'busy'
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          />
                        </div>
                        <span className="font-semibold text-gray-900">{vehicle.vehicleNumber}</span>
                      </div>
                    </td>
                    <td>{vehicle.type}</td>
                    <td>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === 'available'
                            ? 'bg-green-100 text-green-700'
                            : vehicle.status === 'busy'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td>{vehicle.totalRides || 0}</td>
                    <td>
                      <span className="font-medium text-blue-600">
                        {formatDistance(vehicle.monthlyMileage || 0)}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-gray-900">
                        {formatDistance(vehicle.totalMileage || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <FiTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">No vehicle mileage data for {selectedMonth}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleMileageTab;