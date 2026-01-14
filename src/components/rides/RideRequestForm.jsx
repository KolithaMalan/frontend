import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import {
  FiMapPin,
  FiNavigation,
  FiCalendar,
  FiClock,
  FiArrowRight,
  FiRefreshCw,
  FiAlertCircle,
  FiCheck,
  FiSearch,
  FiX,
  FiTruck,  // ✅ ADD THIS
} from 'react-icons/fi';
import Modal from '../common/Modal';
import { ridesAPI } from '../../services/api';
import { getBookingDateRange } from '../../utils/helpers';
import { formatDistance } from '../../utils/formatters';
import { PM_APPROVAL_THRESHOLD_KM, RIDE_TYPES, VEHICLE_TYPE_OPTIONS, VEHICLE_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

// Google Maps Script Loader
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Location Search Component with Google Places
const GoogleLocationSearch = ({ 
  value, 
  onChange, 
  label, 
  placeholder, 
  icon: Icon, 
  iconColor, 
  error,
  googleMaps 
}) => {
  const [inputValue, setInputValue] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (googleMaps && !autocompleteService.current) {
      autocompleteService.current = new googleMaps.places.AutocompleteService();
    }
  }, [googleMaps]);

  useEffect(() => {
    if (value?.address) {
      setInputValue(value.address);
    }
  }, [value]);

  const searchPlaces = useCallback(async (query) => {
    if (!query || query.length < 3 || !autocompleteService.current) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'lk' },
        types: ['geocode', 'establishment'],
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);
        if (status === googleMaps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      });
    } catch (error) {
      setIsLoading(false);
      setSuggestions([]);
    }
  }, [googleMaps]);

  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
    searchPlaces(query);
  };

  const handleSelectPlace = (place) => {
    if (!googleMaps) return;

    const tempDiv = document.createElement('div');
    if (!placesService.current) {
      placesService.current = new googleMaps.places.PlacesService(tempDiv);
    }

    placesService.current.getDetails(
      {
        placeId: place.place_id,
        fields: ['geometry', 'formatted_address', 'name'],
      },
      (result, status) => {
        if (status === googleMaps.places.PlacesServiceStatus.OK && result) {
          const location = {
            address: result.formatted_address || place.description,
            coordinates: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            },
          };
          setInputValue(location.address);
          onChange(location);
          setShowSuggestions(false);
          setSuggestions([]);
        }
      }
    );
  };

  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <label className="label">{label}</label>
      <div className="relative">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor}`} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`input pl-12 pr-10 ${error ? 'input-error' : ''}`}
        />
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
          >
            <FiX className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelectPlace(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
              >
                <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {suggestion.structured_formatting?.secondary_text || ''}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <FiAlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {value && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Selected:</p>
          <p className="text-sm text-gray-900 truncate">{value.address}</p>
        </div>
      )}
    </div>
  );
};

// Simple Map Display Component
const SimpleMapDisplay = ({ pickup, destination, distance }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 6.9271, lng: 79.8612 },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#22c55e',
          strokeWeight: 4,
        },
      });
      directionsRendererRef.current.setMap(mapInstanceRef.current);
    }

    if (pickup?.coordinates && destination?.coordinates) {
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: pickup.coordinates,
          destination: destination.coordinates,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRendererRef.current.setDirections(result);
          }
        }
      );
    } else if (pickup?.coordinates) {
      mapInstanceRef.current.setCenter(pickup.coordinates);
      mapInstanceRef.current.setZoom(14);
    } else if (destination?.coordinates) {
      mapInstanceRef.current.setCenter(destination.coordinates);
      mapInstanceRef.current.setZoom(14);
    }
  }, [pickup, destination]);

  if (!pickup && !destination) return null;

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200">
      <div ref={mapRef} className="w-full h-64"></div>
      {distance && (
        <div className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-full shadow-md">
          <span className="text-sm font-semibold text-gray-900">
            {formatDistance(distance)} via road
          </span>
        </div>
      )}
    </div>
  );
};

const RideRequestForm = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleMaps, setGoogleMaps] = useState(null);
  const [formData, setFormData] = useState({
    rideType: '',
    pickupLocation: null,
    destinationLocation: null,
    scheduledDate: null,
    scheduledTime: '',
    requiredVehicleType: '',  // ✅ ADD THIS
  });
  const [errors, setErrors] = useState({});
  const [distance, setDistance] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);

  const { minDate, maxDate } = getBookingDateRange(14);

  // Load Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey && isOpen) {
      loadGoogleMapsScript(apiKey)
        .then((maps) => setGoogleMaps(maps))
        .catch((err) => {
          console.error('Failed to load Google Maps:', err);
          toast.error('Failed to load maps. Please refresh the page.');
        });
    }
  }, [isOpen]);

  // Calculate road distance when locations change
  useEffect(() => {
    if (!googleMaps || !formData.pickupLocation?.coordinates || !formData.destinationLocation?.coordinates) {
      setDistance(null);
      return;
    }

    setDistanceLoading(true);
    const directionsService = new googleMaps.DirectionsService();

    directionsService.route(
      {
        origin: formData.pickupLocation.coordinates,
        destination: formData.destinationLocation.coordinates,
        travelMode: googleMaps.TravelMode.DRIVING,
      },
      (result, status) => {
        setDistanceLoading(false);
        if (status === 'OK' && result.routes[0]) {
          const distanceInMeters = result.routes[0].legs[0].distance.value;
          const distanceInKm = distanceInMeters / 1000;
          
          const calculatedDist = formData.rideType === 'return' ? distanceInKm * 2 : distanceInKm;
          setDistance(calculatedDist);
        } else {
          console.error('Directions request failed:', status);
          setDistance(null);
        }
      }
    );
  }, [googleMaps, formData.pickupLocation, formData.destinationLocation, formData.rideType]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.rideType) {
      newErrors.rideType = 'Please select a ride type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.pickupLocation) {
      newErrors.pickupLocation = 'Please select a pickup location';
    }
    if (!formData.destinationLocation) {
      newErrors.destinationLocation = 'Please select a destination';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ UPDATED: Validate Step 3 with vehicle type
  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Please select a date';
    }
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Please select a time';
    }
    if (!formData.requiredVehicleType) {
      newErrors.requiredVehicleType = 'Please select a vehicle type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // ✅ UPDATED: Submit with vehicle type and fixed date
  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      // ✅ FIX: Format date as YYYY-MM-DD to prevent timezone issues
      const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const payload = {
        rideType: formData.rideType,
        pickupLocation: formData.pickupLocation,
        destinationLocation: formData.destinationLocation,
        scheduledDate: formatDateForAPI(formData.scheduledDate),
        scheduledTime: formData.scheduledTime,
        distance: distance,
        requiredVehicleType: formData.requiredVehicleType,  // ✅ ADD THIS
      };

      console.log('📅 Submitting ride request:', payload);

      await ridesAPI.create(payload);
      toast.success('Ride request submitted successfully!');
      onSuccess?.();
      handleClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit ride request';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Reset with vehicle type
  const handleClose = () => {
    setStep(1);
    setFormData({
      rideType: '',
      pickupLocation: null,
      destinationLocation: null,
      scheduledDate: null,
      scheduledTime: '',
      requiredVehicleType: '',  // ✅ ADD THIS
    });
    setErrors({});
    setDistance(null);
    onClose();
  };

  // Generate time options (every 30 minutes)
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? 'AM' : 'PM';
      timeOptions.push({
        value: `${hour}:${minute}`,
        label: `${hour12.toString().padStart(2, '0')}:${minute} ${ampm}`,
      });
    }
  }

  const requiresPMApproval = distance && distance > PM_APPROVAL_THRESHOLD_KM;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request a Ride" size="lg">
      <div className="p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s ? <FiCheck className="w-5 h-5" /> : s}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:inline ${
                    step >= s ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {s === 1 ? 'Trip Type' : s === 2 ? 'Locations' : 'Schedule'}
                </span>
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded ${
                    step > s ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Ride Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Trip Type
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Choose whether this is a one-way trip or a return trip.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleChange('rideType', RIDE_TYPES.ONE_WAY)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.rideType === RIDE_TYPES.ONE_WAY
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <FiArrowRight className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">One-Way Trip</h4>
                  <p className="text-sm text-gray-500">
                    Travel from pickup to destination only
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('rideType', RIDE_TYPES.RETURN)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.rideType === RIDE_TYPES.RETURN
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <FiRefreshCw className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Return Trip</h4>
                  <p className="text-sm text-gray-500">
                    Round trip - go and come back
                  </p>
                </button>
              </div>

              {errors.rideType && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.rideType}
                </p>
              )}
            </motion.div>
          )}

          {/* Step 2: Locations */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Locations
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Search and select your pickup and destination locations in Sri Lanka.
                </p>
              </div>

              <GoogleLocationSearch
                value={formData.pickupLocation}
                onChange={(location) => handleChange('pickupLocation', location)}
                label="Pickup Location"
                placeholder="Search pickup location..."
                icon={FiMapPin}
                iconColor="text-green-500"
                error={errors.pickupLocation}
                googleMaps={googleMaps}
              />

              <GoogleLocationSearch
                value={formData.destinationLocation}
                onChange={(location) => handleChange('destinationLocation', location)}
                label="Destination"
                placeholder="Search destination..."
                icon={FiNavigation}
                iconColor="text-red-500"
                error={errors.destinationLocation}
                googleMaps={googleMaps}
              />

              {googleMaps && (formData.pickupLocation || formData.destinationLocation) && (
                <SimpleMapDisplay
                  pickup={formData.pickupLocation}
                  destination={formData.destinationLocation}
                  distance={distance}
                />
              )}

              {distanceLoading && (
                <div className="p-4 rounded-xl bg-gray-50 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
                  <span className="text-gray-600">Calculating road distance...</span>
                </div>
              )}

              {distance && !distanceLoading && (
                <div
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    requiresPMApproval
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      Road Distance: {formatDistance(distance)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.rideType === 'return' && '(Round trip - distance calculated both ways)'}
                    </p>
                  </div>
                  {requiresPMApproval && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                      Requires PM Approval
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ✅ UPDATED Step 3: Schedule + Vehicle Type */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Schedule Your Ride
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Select the date, time, and vehicle type for your trip.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date Picker */}
                <div>
                  <label className="label">Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <DatePicker
                      selected={formData.scheduledDate}
                      onChange={(date) => handleChange('scheduledDate', date)}
                      minDate={minDate}
                      maxDate={maxDate}
                      placeholderText="Select date"
                      className={`input pl-12 w-full ${errors.scheduledDate ? 'input-error' : ''}`}
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  {errors.scheduledDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.scheduledDate}</p>
                  )}
                </div>

                {/* Time Picker */}
                <div>
                  <label className="label">Time</label>
                  <div className="relative">
                    <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={formData.scheduledTime}
                      onChange={(e) => handleChange('scheduledTime', e.target.value)}
                      className={`input select pl-12 ${errors.scheduledTime ? 'input-error' : ''}`}
                    >
                      <option value="">Select time</option>
                      {timeOptions.map((time) => (
                        <option key={time.value} value={time.value}>
                          {time.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.scheduledTime && (
                    <p className="mt-1 text-sm text-red-500">{errors.scheduledTime}</p>
                  )}
                </div>
              </div>

              {/* ✅ NEW: Vehicle Type Dropdown */}
              <div>
                <label className="label">Required Vehicle Type</label>
                <div className="relative">
                  <FiTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.requiredVehicleType}
                    onChange={(e) => handleChange('requiredVehicleType', e.target.value)}
                    className={`input select pl-12 ${errors.requiredVehicleType ? 'input-error' : ''}`}
                  >
                    <option value="">Select vehicle type</option>
                    {VEHICLE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.requiredVehicleType && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.requiredVehicleType}
                  </p>
                )}
              </div>

              {/* ✅ UPDATED Summary with Vehicle Type */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Ride Summary</h4>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Trip Type</p>
                    <p className="font-medium text-gray-900">
                      {formData.rideType === 'one_way' ? 'One-Way' : 'Return Trip'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Road Distance</p>
                    <p className="font-medium text-gray-900">{formatDistance(distance)}</p>
                  </div>
                  {/* ✅ NEW: Vehicle Type in Summary */}
                  <div>
                    <p className="text-gray-500">Vehicle Type</p>
                    <p className="font-medium text-gray-900">
                      {VEHICLE_TYPE_LABELS[formData.requiredVehicleType] || '-'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-start gap-2 mb-2">
                    <FiMapPin className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">From</p>
                      <p className="text-sm text-gray-900">{formData.pickupLocation?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiNavigation className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">To</p>
                      <p className="text-sm text-gray-900">{formData.destinationLocation?.address}</p>
                    </div>
                  </div>
                </div>

                {requiresPMApproval && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-amber-700">
                      <FiAlertCircle className="w-4 h-4" />
                      <p className="text-sm">
                        This ride exceeds 15km and will require Project Manager approval.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-outline"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
            >
              Continue
              <FiArrowRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Submitting...
                </span>
              ) : (
                'Submit Request'
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RideRequestForm;
