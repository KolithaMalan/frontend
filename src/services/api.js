import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// ============ RIDES API ============
export const ridesAPI = {
  // General
  create: (data) => api.post('/rides', data),
  getAll: (params) => api.get('/rides', { params }),
  getOne: (id) => api.get(`/rides/${id}`),
  getMyStats: () => api.get('/rides/my-stats'),
  cancel: (id) => api.put(`/rides/${id}/cancel`),
  
  // PM Actions
  getAwaitingPM: () => api.get('/rides/awaiting-pm'),
  pmApprove: (id) => api.put(`/rides/${id}/pm-approve`),
  pmReject: (id, reason) => api.put(`/rides/${id}/pm-reject`, { reason }),
  
  // Admin Actions
  getAwaitingAdmin: () => api.get('/rides/awaiting-admin'),
  getReadyForAssignment: () => api.get('/rides/ready-for-assignment'),
  adminApprove: (id, note = '') => api.put(`/rides/${id}/admin-approve`, { note }), // ✅ UPDATED: Accept note parameter
  adminReject: (id, reason) => api.put(`/rides/${id}/admin-reject`, { reason }),
  assign: (id, data) => api.put(`/rides/${id}/assign`, data),
  reassign: (id, data) => api.put(`/rides/${id}/reassign`, data),
  getAvailableDrivers: (params) => api.get('/rides/available-drivers', { params }),
  getAvailableVehicles: (params) => api.get('/rides/available-vehicles', { params }),
  
  // Driver Actions
  getDriverAssigned: () => api.get('/rides/driver/assigned'),
  getDriverDaily: () => api.get('/rides/driver/daily'),
  startRide: (id, startMileage) => api.put(`/rides/${id}/start`, { startMileage }),
  completeRide: (id, endMileage) => api.put(`/rides/${id}/complete`, { endMileage }),
};

// ============ USERS API ============
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getCounts: () => api.get('/users/counts'),
  getDrivers: () => api.get('/users/drivers'),
  getAvailableDrivers: () => api.get('/users/drivers/available'),
  getDriverStats: (id) => api.get(`/users/drivers/${id}/stats`),
  resetPassword: (id, newPassword) => api.put(`/users/${id}/reset-password`, { newPassword }),
};

// ============ VEHICLES API ============
export const vehiclesAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  getCounts: () => api.get('/vehicles/counts'),
  getAvailable: () => api.get('/vehicles/available'),
  getStats: (id) => api.get(`/vehicles/${id}/stats`),
  getMileageSummary: () => api.get('/vehicles/mileage-summary'),
  resetMonthlyMileage: () => api.post('/vehicles/reset-monthly-mileage'),
  setMaintenance: (id) => api.put(`/vehicles/${id}/maintenance`),
};

// ============ REPORTS API ============
export const reportsAPI = {
  getDashboardStats: () => api.get('/reports/dashboard-stats'),
  getMonthlyRides: (params) => api.get('/reports/monthly-rides', { params }),
  getDriverPerformance: (params) => api.get('/reports/driver-performance', { params }),
  getVehicleUsage: (params) => api.get('/reports/vehicle-usage', { params }),
  getRideHistory: (params) => api.get('/reports/ride-history', { params }),
  exportReport: (type, params) => api.get(`/reports/export/${type}`, { params }),
  getMyHistory: (params) => api.get('/reports/my-history', { params }),
};

// ============ NOTIFICATIONS API ============
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
