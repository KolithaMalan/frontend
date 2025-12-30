import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiTruck,
  FiCheckCircle,
  FiNavigation,
  FiCalendar,
  FiTrendingUp,
} from 'react-icons/fi';
import { reportsAPI } from '../../services/api';
import { formatDistance } from '../../utils/formatters';
import Loader from '../common/Loader';

const DriverStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await reportsAPI.getMyHistory({ limit: 100 });
      const rides = response.data.rides;

      // Calculate stats
      const totalRides = rides.length;
      const completedRides = rides.filter(r => r.status === 'completed').length;
      const totalDistance = rides
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.actualDistance || 0), 0);

      // This month stats
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonthRides = rides.filter(r => 
        r.status === 'completed' && new Date(r.endTime) >= startOfMonth
      );

      const monthlyRides = thisMonthRides.length;
      const monthlyDistance = thisMonthRides.reduce((sum, r) => sum + (r.actualDistance || 0), 0);

      setStats({
        totalRides,
        completedRides,
        totalDistance,
        monthlyRides,
        monthlyDistance,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <Loader size="sm" text="Loading statistics..." />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Rides',
      value: stats.totalRides,
      icon: FiTruck,
      color: 'blue',
    },
    {
      title: 'Completed',
      value: stats.completedRides,
      icon: FiCheckCircle,
      color: 'green',
    },
    {
      title: 'Total Distance',
      value: formatDistance(stats.totalDistance),
      icon: FiNavigation,
      color: 'purple',
    },
    {
      title: 'This Month',
      value: stats.monthlyRides,
      subtitle: formatDistance(stats.monthlyDistance),
      icon: FiCalendar,
      color: 'amber',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FiTrendingUp className="w-5 h-5 text-primary-600" />
        My Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl bg-${stat.color}-50`}
          >
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.title}</p>
            {stat.subtitle && (
              <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default DriverStatistics;