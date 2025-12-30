import React from 'react';
import { motion } from 'framer-motion';
import {
  FiClock,
  FiCheckCircle,
  FiNavigation,
  FiActivity,
} from 'react-icons/fi';

const PMStatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals || 0,
      icon: FiClock,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-100',
    },
    {
      title: 'Approved Today',
      value: stats.approvedToday || 0,
      icon: FiCheckCircle,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-100',
    },
    {
      title: 'Long Distance Rides',
      value: stats.longDistanceRides || 0,
      icon: FiNavigation,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-100',
    },
    {
      title: 'Total Processed',
      value: stats.totalProcessed || 0,
      icon: FiActivity,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${card.color} rounded-xl p-5 text-white shadow-lg`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm ${card.textColor}`}>{card.title}</p>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PMStatsCards;