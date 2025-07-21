// ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  sellerOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly, sellerOnly }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Önce authentication kontrolü
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User yüklenmemişse bekle
  if (!user) {
    return <div>Loading...</div>;
  }

  const userRoles = user.role || [];

  // Admin kontrolü
  if (adminOnly && !userRoles.includes('Admin')) {
    return <Navigate to="/" replace />;
  }

  // Seller kontrolü - Seller VEYA Admin olabilir
  if (sellerOnly && !userRoles.includes('Seller') && !userRoles.includes('Admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;