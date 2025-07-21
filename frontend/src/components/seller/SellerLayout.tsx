import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../../store';  // AppDispatch'i de import ediyoruz
import { logout } from '../../store/slices/authSlice';

const FiHome = Icons.FiHome as any;
const FiPackage = Icons.FiPackage as any;
const FiShoppingBag = Icons.FiShoppingBag as any;
const FiMenu = Icons.FiMenu as any;
const FiX = Icons.FiX as any;
const FiLogOut = Icons.FiLogOut as any;
const FiUser = Icons.FiUser as any;

const SellerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();  // AppDispatch tipini kullan
  const user = useSelector((state: RootState) => state.auth.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/seller/dashboard',
      name: 'Dashboard',
      icon: FiHome
    },
    {
      path: '/seller/products',
      name: 'Ürün Yönetimi',
      icon: FiPackage
    },
    {
      path: '/seller/orders',
      name: 'Sipariş Yönetimi',
      icon: FiShoppingBag
    }
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b bg-purple-600">
          <h1 className="text-xl font-bold text-white">Satıcı Paneli</h1>
        </div>

        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FiUser className="text-purple-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">Satıcı</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <IconComponent className="mr-3" size={20} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="mr-3" size={20} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => isActiveRoute(item.path))?.name || 'Satıcı Paneli'}
            </h2>
            <Link
              to="/"
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              <FiHome size={16} />
              Mağazaya Dön
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SellerLayout;