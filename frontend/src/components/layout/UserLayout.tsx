// src/components/layout/UserLayout.tsx
import React from 'react';
import Header from './Header';
import CartDrawer from '../cart/CartDrawer';
import { Outlet } from 'react-router-dom';

const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartDrawer />
      <main className="mt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
