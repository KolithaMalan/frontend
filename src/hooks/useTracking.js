import { useState, useEffect, useCallback, useRef } from 'react';
import { trackingAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useTracking = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 15000, // 15 seconds default
    type = 'all' // 'all' | 'active-rides'
  } = options;

  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      let response;
      if (type === 'active-rides') {
        response = await trackingAPI.getActiveRides();
        setData(response.data.rides || []);
      } else {
        response = await trackingAPI.getAllVehicles();
        setData(response.data.vehicles || []);
      }

      // Also fetch stats
      const statsResponse = await trackingAPI.getStats();
      setStats(statsResponse.data.stats);

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError(err.message || 'Failed to fetch tracking data');
      if (showLoader) {
        toast.error('Failed to load tracking data');
      }
    } finally {
      setLoading(false);
    }
  }, [type]);

  const refresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(false);
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    stats,
    loading,
    error,
    lastUpdate,
    refresh
  };
};

export const useVehicleTracking = (vehicleId) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) return;

    try {
      setLoading(true);
      const response = await trackingAPI.getVehicle(vehicleId);
      setVehicle(response.data.vehicle);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  return { vehicle, loading, error, refresh: fetchVehicle };
};

export default useTracking;