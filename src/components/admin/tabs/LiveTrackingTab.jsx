import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import MapComponent from '../../maps/MapComponent';
import EmptyState from '../../common/EmptyState';

const LiveTrackingTab = () => {
  return (
    <div className="space-y-6">
      {/* Map */}
      <div className="card p-0 overflow-hidden">
        <div className="h-[500px]">
          <MapComponent height="100%" />
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 text-center">
        <p className="text-blue-700">
          Live tracking feature shows active rides on the map. 
          GPS tracking can be integrated when real tracking devices are connected.
        </p>
      </div>
    </div>
  );
};

export default LiveTrackingTab;