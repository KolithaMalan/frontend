import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          background: white;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const pickupIcon = createIcon('#22c55e'); // Green
const destinationIcon = createIcon('#ef4444'); // Red
const vehicleIcon = createIcon('#3b82f6'); // Blue

// Component to fit bounds
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
};

// Component to handle center changes
const MapCenter = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const MapComponent = ({
  pickup,
  destination,
  vehicles = [],
  height = '400px',
  showRoute = true,
  center,
  zoom = DEFAULT_MAP_ZOOM,
  className = '',
}) => {
  const mapRef = useRef(null);

  // Calculate bounds if both pickup and destination exist
  const getBounds = () => {
    const points = [];
    if (pickup?.coordinates) {
      points.push([pickup.coordinates.lat, pickup.coordinates.lng]);
    }
    if (destination?.coordinates) {
      points.push([destination.coordinates.lat, destination.coordinates.lng]);
    }
    vehicles.forEach((v) => {
      if (v.coordinates) {
        points.push([v.coordinates.lat, v.coordinates.lng]);
      }
    });
    return points.length >= 2 ? points : null;
  };

  const bounds = getBounds();
  const mapCenter = center || (pickup?.coordinates ? pickup.coordinates : DEFAULT_MAP_CENTER);

  // Route line between pickup and destination
  const routePositions = [];
  if (pickup?.coordinates && destination?.coordinates) {
    routePositions.push([pickup.coordinates.lat, pickup.coordinates.lng]);
    routePositions.push([destination.coordinates.lat, destination.coordinates.lng]);
  }

  return (
    <div className={`rounded-xl overflow-hidden shadow-md ${className}`} style={{ height }}>
      <MapContainer
        ref={mapRef}
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bounds && <FitBounds bounds={bounds} />}
        {center && <MapCenter center={center} />}

        {/* Pickup Marker */}
        {pickup?.coordinates && (
          <Marker 
            position={[pickup.coordinates.lat, pickup.coordinates.lng]} 
            icon={pickupIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-green-600 mb-1">📍 Pickup Location</p>
                <p className="text-sm text-gray-600">{pickup.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination?.coordinates && (
          <Marker 
            position={[destination.coordinates.lat, destination.coordinates.lng]} 
            icon={destinationIcon}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-red-600 mb-1">📍 Destination</p>
                <p className="text-sm text-gray-600">{destination.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        {showRoute && routePositions.length === 2 && (
          <Polyline
            positions={routePositions}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Vehicle Markers */}
        {vehicles.map((vehicle, index) => (
          vehicle.coordinates && (
            <Marker
              key={vehicle.id || index}
              position={[vehicle.coordinates.lat, vehicle.coordinates.lng]}
              icon={vehicleIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold text-blue-600 mb-1">🚗 {vehicle.vehicleNumber}</p>
                  {vehicle.driver && (
                    <p className="text-sm text-gray-600">Driver: {vehicle.driver}</p>
                  )}
                  {vehicle.status && (
                    <p className="text-sm text-gray-500">Status: {vehicle.status}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;