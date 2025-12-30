import React from 'react';
import { FiInbox, FiPlus } from 'react-icons/fi';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          <FiPlus className="w-5 h-5 mr-2" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;