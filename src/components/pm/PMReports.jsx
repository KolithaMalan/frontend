import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDownload,
  FiCalendar,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import { reportsAPI } from '../../services/api';
import Loader from '../common/Loader';
import { formatDate, formatDistance } from '../../utils/formatters';
import { generatePMReportPDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

const PMReports = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchReport();
  }, [selectedMonth]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      console.log('📊 Fetching PM report for:', { year, month });
      
      const response = await reportsAPI.getMonthlyRides({ year, month });
      setReport(response.data.report);
      
      console.log('✅ Report data:', response.data.report);
    } catch (error) {
      console.error('❌ Failed to fetch report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!report) {
      toast.error('No report data to export');
      return;
    }

    setExporting(true);
    try {
      console.log('📄 Generating PM report PDF for', selectedMonth);
      
      await generatePMReportPDF(report, selectedMonth);
      
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('❌ Export error:', error);
      toast.error(error.message || 'Failed to generate PDF report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading report..." />;
  }

  return (
    <div className="space-y-6">
      {/* Controls - BEAUTIFUL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <label className="label">Select Month</label>
            <div className="flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                className="input w-52"
              />
            </div>
          </div>
          <button 
            onClick={fetchReport} 
            className="btn btn-outline mt-6"
            disabled={loading}
          >
            <FiRefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <button 
          onClick={handleExport} 
          disabled={exporting || !report}
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

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Total Rides</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{report.summary.totalRides}</p>
              <p className="text-xs text-gray-500 mt-1">All ride requests</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{report.summary.completedRides}</p>
              <p className="text-xs text-gray-500 mt-1">{report.summary.completionRate}% success rate</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiXCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Cancelled/Rejected</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {report.summary.cancelledRides + report.summary.rejectedRides}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {report.summary.cancelledRides} cancelled, {report.summary.rejectedRides} rejected
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Total Distance</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatDistance(report.summary.totalDistance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {formatDistance(report.summary.averageDistance)}
              </p>
            </motion.div>
          </div>

          {/* Long Distance Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              Long Distance Rides Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                <p className="text-4xl font-bold text-amber-600 mb-2">{report.longDistanceRides}</p>
                <p className="text-sm text-amber-800 font-medium">Total Long Distance</p>
                <p className="text-xs text-amber-600 mt-1">Requires PM approval</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {report.summary.completionRate}%
                </p>
                <p className="text-sm text-gray-700 font-medium">Completion Rate</p>
                <p className="text-xs text-gray-500 mt-1">Overall success</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {formatDistance(report.summary.averageDistance)}
                </p>
                <p className="text-sm text-gray-700 font-medium">Average Distance</p>
                <p className="text-xs text-gray-500 mt-1">Per ride</p>
              </div>
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="card">
          <div className="text-center py-12">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">No report data for {selectedMonth}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMReports;