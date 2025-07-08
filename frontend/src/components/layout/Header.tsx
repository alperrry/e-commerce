import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleCart } from '../../store/slices/cartSlice';

const FiSearch = Icons.FiSearch as any;
const FiUser = Icons.FiUser as any;
const FiHeart = Icons.FiHeart as any;
const FiShoppingCart = Icons.FiShoppingCart as any;
const FiMenu = Icons.FiMenu as any;
const FiX = Icons.FiX as any;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);  // <-- eklendi

  const cartItemCount = cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate('/');
  };

  const categories = [
    { id: 1, name: 'Kadın', path: '/products?category=1' },
    { id: 2, name: 'Erkek', path: '/products?category=2' },
    { id: 3, name: 'Elektronik', path: '/products?category=3' },
    { id: 4, name: 'Ev & Yaşam', path: '/products?category=4' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-purple-700">
              ShopHub
            </Link>

            {/* Search - Hidden on mobile */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
              <FiSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full"
              />
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            {/* User Menu */}
            <div className="relative group">
              <button className="text-gray-600 hover:text-gray-800 transition">
                <FiUser size={24} />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Profilim
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Siparişlerim
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Giriş Yap
                    </Link>
                    <Link to="/register" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Üye Ol
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-gray-600 hover:text-gray-800 transition hidden md:block">
              <FiHeart size={24} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative text-gray-600 hover:text-gray-800 transition"
            >
              <FiShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-600"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:block py-4">
          <ul className="flex space-x-8">
            <li>
              <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium transition">
                Ana Sayfa
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={category.path}
                  className="text-gray-700 hover:text-purple-600 font-medium transition"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/products?sale=true" className="text-red-500 font-medium">
                İndirimler 🔥
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <FiSearch className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none w-full"
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="block py-2 text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Ana Sayfa
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={category.path}
                    className="block py-2 text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/products?sale=true"
                  className="block py-2 text-red-500 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  İndirimler 🔥
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
