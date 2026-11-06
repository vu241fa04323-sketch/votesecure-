import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" message="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to respective login page based on target role
    const redirectPath = requiredRole === 'admin' ? '/admin/login' : '/voter/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If authenticated as voter trying to access admin, send to voter dashboard
    if (user?.role === 'voter' && requiredRole === 'admin') {
      return <Navigate to="/voter/dashboard" replace />;
    }
    // If authenticated as admin trying to access voter, send to admin dashboard
    if (user?.role === 'admin' && requiredRole === 'voter') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
