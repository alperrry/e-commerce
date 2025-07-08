import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const FiHome = Icons.FiHome as any;
const FiPackage = Icons.FiPackage as any;
const FiShoppingBag = Icons.FiShoppingBag as any;
const FiUsers = Icons.FiUsers as any;
const FiGrid = Icons.FiGrid as any;
const FiMenu = Icons.FiMenu as any;
const FiX = Icons.FiX as any;
const FiLogOut = Icons.FiLogOut as any;
const FiUser = Icons.FiUser as any;
const FiChevronRight = Icons.FiChevronRight as any;

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: FiHome, exact: true },
    { path: '/admin/products', label: 'Ürün Yönetimi', icon: FiPackage },
    { path: '/admin/orders', label: 'Sipariş Yönetimi', icon: FiShoppingBag },
    { path: '/admin/users', label: 'Kullanıcı Yönetimi', icon: FiUsers },
    { path: '/admin/categories', label: 'Kategori Yönetimi', icon: FiGrid },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-lg shadow-md"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        bg-purple-800 text-white
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-purple-700">
            <Link to="/admin" className={`font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>
              Admin Panel
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-1 hover:bg-purple-700 rounded"
            >
              {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg transition-colors
                    ${active 
                      ? 'bg-purple-900 text-white' 
                      : 'text-purple-200 hover:bg-purple-700 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} className={isSidebarOpen ? 'mr-3' : 'mx-auto'} />
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {active && <FiChevronRight size={16} />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-purple-700 p-4">
            <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
              {isSidebarOpen && (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <FiUser size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-purple-300">Admin</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-purple-700 rounded-lg transition"
                title="Çıkış Yap"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`
        transition-all duration-300
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        min-h-screen
      `}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Admin Panel'}
            </h1>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
              >
                <FiHome />
                Siteye Dön
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;