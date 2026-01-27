import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icons
const createVehicleIcon = (type, isOnline, isMoving) => {
  const color = !isOnline ? '#9CA3AF' : isMoving ? '#10B981' : '#3B82F6';
  const iconType = type === 'Van' || type === 'Crew Cab' ? 'truck' : 'car';
  
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          ${iconType === 'truck' 
            ? '<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>'
            : '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>'
          }
        </svg>
        ${isMoving ? `
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 10px;
            height: 10px;
            background: #10B981;
            border: 2px solid white;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

const TrackingMap = ({ 
  vehicles = [], 
  selectedVehicle = null,
  onVehicleSelect,
  height = '500px',
  showRoute = false,
  center = [7.8731, 80.7718], // Sri Lanka center
  zoom = 8
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    // Add custom CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      .custom-vehicle-marker {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);

    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      document.head.removeChild(style);
    };
  }, []);

  // Update markers when vehicles change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Track which vehicles we've seen
    const currentVehicleIds = new Set();

    vehicles.forEach(vehicle => {
      if (!vehicle.hasTracking || !vehicle.tracking?.latitude || !vehicle.tracking?.longitude) {
        return;
      }

      const id = vehicle._id;
      currentVehicleIds.add(id);

      const lat = vehicle.tracking.latitude;
      const lng = vehicle.tracking.longitude;
      const isOnline = vehicle.tracking.isOnline;
      const isMoving = vehicle.tracking.speed > 0;

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">
            ${vehicle.vehicleNumber}
          </h3>
          <div style="font-size: 12px; color: #666;">
            <p style="margin: 4px 0;">
              <strong>Type:</strong> ${vehicle.type}
            </p>
            <p style="margin: 4px 0;">
              <strong>Status:</strong> 
              <span style="color: ${isOnline ? '#10B981' : '#EF4444'}">
                ${isOnline ? 'Online' : 'Offline'}
              </span>
            </p>
            <p style="margin: 4px 0;">
              <strong>Speed:</strong> ${vehicle.tracking.speed} km/h
            </p>
            ${vehicle.currentDriver ? `
              <p style="margin: 4px 0;">
                <strong>Driver:</strong> ${vehicle.currentDriver.name}
              </p>
            ` : ''}
            ${vehicle.tracking.ignitionOn !== undefined ? `
              <p style="margin: 4px 0;">
                <strong>Ignition:</strong> ${vehicle.tracking.ignitionOn ? 'ON' : 'OFF'}
              </p>
            ` : ''}
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #999;">
              Last update: ${new Date(vehicle.tracking.lastUpdate).toLocaleString()}
            </p>
          </div>
        </div>
      `;

      if (markersRef.current[id]) {
        // Update existing marker
        markersRef.current[id]
          .setLatLng([lat, lng])
          .setIcon(createVehicleIcon(vehicle.type, isOnline, isMoving))
          .getPopup()?.setContent(popupContent);
      } else {
        // Create new marker
        const marker = L.marker([lat, lng], {
          icon: createVehicleIcon(vehicle.type, isOnline, isMoving)
        })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          if (onVehicleSelect) {
            onVehicleSelect(vehicle);
          }
        });

        markersRef.current[id] = marker;
      }
    });

    // Remove markers for vehicles no longer in the list
    Object.keys(markersRef.current).forEach(id => {
      if (!currentVehicleIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [vehicles, mapReady, onVehicleSelect]);

  // Focus on selected vehicle
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !selectedVehicle) return;

    if (selectedVehicle.tracking?.latitude && selectedVehicle.tracking?.longitude) {
      mapInstanceRef.current.setView(
        [selectedVehicle.tracking.latitude, selectedVehicle.tracking.longitude],
        15,
        { animate: true }
      );

      // Open popup for selected vehicle
      const marker = markersRef.current[selectedVehicle._id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedVehicle, mapReady]);

  // Fit bounds to show all vehicles
  const fitBounds = () => {
    if (!mapInstanceRef.current) return;

    const validVehicles = vehicles.filter(
      v => v.hasTracking && v.tracking?.latitude && v.tracking?.longitude
    );

    if (validVehicles.length === 0) return;

    const bounds = L.latLngBounds(
      validVehicles.map(v => [v.tracking.latitude, v.tracking.longitude])
    );

    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden"
      />
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={fitBounds}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title="Fit all vehicles"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TrackingMap;