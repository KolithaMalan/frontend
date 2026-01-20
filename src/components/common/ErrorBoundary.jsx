import React from 'react';
import { FiAlertCircle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { useNavigate, useRouteError } from 'react-router-dom';

// Error Fallback Component
const ErrorFallback = () => {
  const navigate = useNavigate();
  const error = useRouteError();

  console.error('❌ Route Error:', error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          {error?.message || error?.statusText || 'An unexpected error occurred'}
        </p>

        {error?.stack && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-h-40 overflow-auto">
            <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
              {error.stack.split('\n').slice(0, 5).join('\n')}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary flex-1"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Reload Page
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline flex-1"
          >
            <FiHome className="w-5 h-5 mr-2" />
            Dashboard
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Error ID: {new Date().getTime()}
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;
