import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// User Pages
import UserDashboard from './pages/user/UserDashboard';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DailyRides from './pages/driver/DailyRides';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// PM Pages
import PMDashboard from './pages/pm/PMDashboard';
import PMMapView from './pages/pm/PMMapView';

// Shared Pages
import MapView from './pages/shared/MapView';
import Settings from './pages/shared/Settings';
import Profile from './pages/shared/Profile';
import Alerts from './pages/shared/Alerts';

// Role constants
import { ROLES } from './utils/constants';

// Role-based dashboard redirect component
const DashboardRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  switch (user.role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin" replace />;
    case ROLES.PROJECT_MANAGER:
      return <Navigate to="/pm" replace />;
    case ROLES.DRIVER:
      return <Navigate to="/driver" replace />;
    case ROLES.USER:
    default:
      return <Navigate to="/user" replace />;
  }
};

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <Home />,
  },

  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },

  // Dashboard redirect
  {
    path: '/dashboard',
    element: <DashboardRedirect />,
  },

  // User Dashboard
  {
    path: '/user',
    element: <DashboardLayout allowedRoles={[ROLES.USER]} />,
    children: [
      { index: true, element: <UserDashboard /> },
      { path: 'alerts', element: <Alerts /> },
    ],
  },

  // Driver Dashboard
  {
    path: '/driver',
    element: <DashboardLayout allowedRoles={[ROLES.DRIVER]} />,
    children: [
      { index: true, element: <DriverDashboard /> },
      { path: 'daily', element: <DailyRides /> },
      { path: 'alerts', element: <Alerts /> },
    ],
  },

  // Admin Dashboard
  {
    path: '/admin',
    element: <DashboardLayout allowedRoles={[ROLES.ADMIN]} />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'map', element: <MapView /> },
      { path: 'alerts', element: <Alerts /> },
    ],
  },

  // PM Dashboard
  {
    path: '/pm',
    element: <DashboardLayout allowedRoles={[ROLES.PROJECT_MANAGER]} />,
    children: [
      { index: true, element: <PMDashboard /> },
      { path: 'map', element: <PMMapView /> },
      { path: 'alerts', element: <Alerts /> },
    ],
  },

  // Shared routes (all authenticated users)
  {
    element: <DashboardLayout />,
    children: [
      { path: 'settings', element: <Settings /> },
      { path: 'profile', element: <Profile /> },
      { path: 'map-view', element: <MapView /> },
      { path: 'alerts', element: <Alerts /> },
    ],
  },

  // Unauthorized
  {
    path: '/unauthorized',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
        </div>
      </div>
    ),
  },

  // 404
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;