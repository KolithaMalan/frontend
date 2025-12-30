import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiSearch, FiMapPin, FiX, FiNavigation } from 'react-icons/fi';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';
import { debounce } from '../../utils/helpers';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const LocationPicker = ({ value, onChange, placeholder = 'Search location...' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const searchRef = useRef(null);

  // Search locations using Nominatim (OpenStreetMap)
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=lk&limit=5`
      );
      const data = await response.json();
      setSearchResults(
        data.map((item) => ({
          address: item.display_name,
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          },
        }))
      );
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const debouncedSearch = debounce(searchLocations, 500);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  // Handle location selection from search results
  const handleSelectResult = (location) => {
    onChange(location);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle map click
  const handleMapClick = async (latlng) => {
    try {
      // Reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();
      const location = {
        address: data.display_name,
        coordinates: {
          lat: latlng.lat,
          lng: latlng.lng,
        },
      };
      setTempLocation(location);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Confirm map selection
  const handleConfirmLocation = () => {
    if (tempLocation) {
      onChange(tempLocation);
      setShowMap(false);
      setTempLocation(null);
    }
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        handleMapClick(e.latlng);
      },
    });
    return null;
  };

  // Recenter map component
  const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView([center.lat, center.lng], 15);
      }
    }, [center, map]);
    return null;
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latlng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          await handleMapClick(latlng);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Location Display */}
      {value && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <FiMapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 break-words">{value.address}</p>
          </div>
          <button
            onClick={() => onChange(null)}
            className="text-gray-400 hover:text-red-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search Input */}
      {!value && (
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="input pl-12 pr-20"
            />
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
              title="Select on map"
            >
              <FiMapPin className="w-5 h-5" />
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <FiMapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-900 line-clamp-2">{result.address}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {isSearching && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center">
              <span className="text-sm text-gray-500">Searching...</span>
            </div>
          )}
        </div>
      )}

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Select Location on Map</h3>
              <button
                onClick={() => {
                  setShowMap(false);
                  setTempLocation(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="h-96">
              <MapContainer
                center={[DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]}
                zoom={DEFAULT_MAP_ZOOM}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler />
                {tempLocation && (
                  <>
                    <Marker
                      position={[
                        tempLocation.coordinates.lat,
                        tempLocation.coordinates.lng,
                      ]}
                      icon={createIcon('#22c55e')}
                    />
                    <RecenterMap center={tempLocation.coordinates} />
                  </>
                )}
              </MapContainer>
            </div>

            {/* Selected Location Info */}
            {tempLocation && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-900 mb-3">{tempLocation.address}</p>
              </div>
            )}

            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={getCurrentLocation}
                className="btn btn-outline flex items-center gap-2"
              >
                <FiNavigation className="w-5 h-5" />
                Use Current Location
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={!tempLocation}
                className="btn-primary"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;