import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiMapPin, FiX } from 'react-icons/fi';
import { debounce } from '../../utils/helpers';

const LocationSearch = ({ 
  value, 
  onChange, 
  placeholder = 'Search location...', 
  label,
  error,
  icon: Icon = FiMapPin,
  iconColor = 'text-gray-400'
}) => {
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update query when value changes externally
  useEffect(() => {
    if (value?.address) {
      setQuery(value.address);
    }
  }, [value]);

  // Search for locations using Nominatim (OpenStreetMap)
  const searchLocations = debounce(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=lk&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      const formattedSuggestions = data.map((item) => ({
        id: item.place_id,
        address: item.display_name,
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        },
      }));
      
      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchLocations(newQuery);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.address);
    setShowSuggestions(false);
    onChange({
      address: suggestion.address,
      coordinates: suggestion.coordinates,
    });
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onChange(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="label">{label}</label>}
      
      <div className="relative">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor}`} />
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`input pl-12 pr-10 ${error ? 'input-error' : ''}`}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}

        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
            >
              <FiMapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 line-clamp-2">{suggestion.address}</span>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && query.length >= 3 && suggestions.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center text-gray-500 text-sm">
          No locations found
        </div>
      )}
    </div>
  );
};

export default LocationSearch;