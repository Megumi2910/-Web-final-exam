import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component for role-based access control
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string|string[]} props.allowedRoles - Allowed roles (ADMIN, SELLER, CUSTOMER)
 * @param {string} props.redirectTo - Path to redirect unauthorized users
 */
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = '/login' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0) {
    const userRole = user?.role;
    const hasRequiredRole = Array.isArray(allowedRoles)
      ? allowedRoles.includes(userRole)
      : allowedRoles === userRole;

    if (!hasRequiredRole) {
      // User is authenticated but doesn't have required role
      // Redirect based on their actual role
      if (userRole === 'ADMIN') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'SELLER') {
        return <Navigate to="/seller" replace />;
      } else if (userRole === 'CUSTOMER') {
        return <Navigate to="/customer/dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;

