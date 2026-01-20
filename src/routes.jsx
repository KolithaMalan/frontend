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

// ✅ NEW: Error Boundary
import ErrorFallback from './components/common/ErrorBoundary';

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
  // ✅ Public routes with error boundary
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorFallback />,
  },

  // ✅ Auth routes with error boundary
  {
    element: <AuthLayout />,
    errorElement: <ErrorFallback />,
    children: [
      { 
        path: 'login', 
        element: <Login />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'register', 
        element: <Register />,
        errorElement: <ErrorFallback />,
      },
    ],
  },

  // ✅ Dashboard redirect with error boundary
  {
    path: '/dashboard',
    element: <DashboardRedirect />,
    errorElement: <ErrorFallback />,
  },

  // ✅ User Dashboard with error boundary
  {
    path: '/user',
    element: <DashboardLayout allowedRoles={[ROLES.USER]} />,
    errorElement: <ErrorFallback />,
    children: [
      { 
        index: true, 
        element: <UserDashboard />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'alerts', 
        element: <Alerts />,
        errorElement: <ErrorFallback />,
      },
    ],
  },

  // ✅ Driver Dashboard with error boundary
  {
    path: '/driver',
    element: <DashboardLayout allowedRoles={[ROLES.DRIVER]} />,
    errorElement: <ErrorFallback />,
    children: [
      { 
        index: true, 
        element: <DriverDashboard />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'daily', 
        element: <DailyRides />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'alerts', 
        element: <Alerts />,
        errorElement: <ErrorFallback />,
      },
    ],
  },

  // ✅ Admin Dashboard with error boundary
  {
    path: '/admin',
    element: <DashboardLayout allowedRoles={[ROLES.ADMIN]} />,
    errorElement: <ErrorFallback />,
    children: [
      { 
        index: true, 
        element: <AdminDashboard />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'map', 
        element: <MapView />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'alerts', 
        element: <Alerts />,
        errorElement: <ErrorFallback />,
      },
    ],
  },

  // ✅ PM Dashboard with error boundary
  {
    path: '/pm',
    element: <DashboardLayout allowedRoles={[ROLES.PROJECT_MANAGER]} />,
    errorElement: <ErrorFallback />,
    children: [
      { 
        index: true, 
        element: <PMDashboard />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'map', 
        element: <PMMapView />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'alerts', 
        element: <Alerts />,
        errorElement: <ErrorFallback />,
      },
    ],
  },

  // ✅ Shared routes with error boundary
  {
    element: <DashboardLayout />,
    errorElement: <ErrorFallback />,
    children: [
      { 
        path: 'settings', 
        element: <Settings />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'profile', 
        element: <Profile />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'map-view', 
        element: <MapView />,
        errorElement: <ErrorFallback />,
      },
      { 
        path: 'alerts', 
        element: <Alerts />,
        errorElement: <ErrorFallback />,
      },
    ],
  },

  // ✅ Unauthorized with error boundary
  {
    path: '/unauthorized',
    errorElement: <ErrorFallback />,
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

  // ✅ 404 with error boundary
  {
    path: '*',
    element: <NotFound />,
    errorElement: <ErrorFallback />,
  },
]);

export default router;
