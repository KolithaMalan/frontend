import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiTruck } from 'react-icons/fi';
import Loader from '../components/common/Loader';

const AuthLayout = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <FiTruck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">RideManager</h1>
              <p className="text-sm text-white/70">Transport Solutions</p>
            </div>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Efficient Vehicle &<br />
              Ride Management
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-md">
              Streamline your transportation operations with our comprehensive ride management solution. Book rides, track vehicles, and manage your fleet effortlessly.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-white/70">Rides Completed</p>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-sm text-white/70">Active Vehicles</p>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">99%</p>
              <p className="text-sm text-white/70">Satisfaction</p>
            </div>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          © 2024 RideManager. Powered by Sobadhanavi Solutions.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;