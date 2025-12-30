import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  onClick,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : {}}
      onClick={onClick}
      className={`
        card
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        {/* Text content with FIXED HEIGHT */}
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-sm text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1 truncate">{value}</p>
          {/* ALWAYS reserve space for subtitle */}
          <div className="h-5">
            {subtitle && (
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
          ${iconBgColor}
        `}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;