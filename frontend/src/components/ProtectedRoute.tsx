import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    // Giriş yapmamış kullanıcıları login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }

  // Şimdilik admin kontrolünü kaldıralım
  // Backend'de role sistemi hazır olunca aşağıdaki satırları açın:
  /*
  if (adminOnly && user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }
  */

  return <Outlet />;
};

export default ProtectedRoute;