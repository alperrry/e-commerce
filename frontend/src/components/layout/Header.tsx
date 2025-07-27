import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleCart } from '../../store/slices/cartSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { isSeller, isAdmin, debugAuth } from '../../utils/auth';

const FiSearch = Icons.FiSearch as any;
const FiUser = Icons.FiUser as any;
const FiHeart = Icons.FiHeart as any;
const FiShoppingCart = Icons.FiShoppingCart as any;
const FiMenu = Icons.FiMenu as any;
const FiX = Icons.FiX as any;
const FiChevronDown = Icons.FiChevronDown as any;
const FiPackage = Icons.FiPackage as any;
const FiSettings = Icons.FiSettings as any;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    debugAuth();
    dispatch(fetchCategories()); // Kategorileri fetch et
  }, [dispatch]);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { categories } = useSelector((state: RootState) => state.categories); // Backend'ten kategoriler

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

  // Sabit kategoriler
  const staticCategories = [
    { 
      id: 1, 
      name: 'Kadın', 
      path: '/products?categoryId=1',
      icon: '👗'
    },
    { 
      id: 2, 
      name: 'Erkek', 
      path: '/products?categoryId=2',
      icon: '👔'
    },
    { 
      id: 3, 
      name: 'Elektronik', 
      path: '/products?categoryId=3',
      icon: '📱'
    },
    { 
      id: 4, 
      name: 'Ev & Yaşam', 
      path: '/products?categoryId=4',
      icon: '🏠'
    },
  ];

  // Kategoriler için default ikonlar
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('kadın') || name.includes('woman')) return '👗';
    if (name.includes('erkek') || name.includes('man')) return '👔';
    if (name.includes('elektronik') || name.includes('electronic')) return '📱';
    if (name.includes('ev') || name.includes('home')) return '🏠';
    if (name.includes('spor') || name.includes('sport')) return '⚽';
    if (name.includes('çocuk') || name.includes('kid')) return '🧸';
    if (name.includes('ayakkabı') || name.includes('shoe')) return '👟';
    if (name.includes('aksesuar') || name.includes('accessory')) return '💎';
    return '📦'; // Default ikon
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 text-sm font-medium">
        🎉 Ücretsiz kargo 150₺ ve üzeri alışverişlerde! 🚚
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              {/* Yöntem 1: Kendi logo resminizi kullanmak için bu satırın yorumunu kaldırın */}
              {/* <img 
                src="/src/assets/logo.png" 
                alt="ShopHub Logo" 
                className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
              /> */}
              
              {/* Yöntem 2: Logo + Text kombinasyonu için bu satırın yorumunu kaldırın */}
              {/* <img 
                src="/src/assets/logo-icon.png" 
                alt="ShopHub" 
                className="h-8 w-8 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-2xl font-bold text-gray-800">
                ShopHub
              </span> */}
              
              {/* Yöntem 3: Mevcut gradient tasarım (varsayılan) */}
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ShopHub
              </span>
            </Link>

            {/* Category Menu - Desktop */}
            <div className="hidden lg:block relative group">
              <button className="flex items-center space-x-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <FiMenu className="text-gray-600" size={18} />
                <span className="text-gray-700 font-medium">Kategoriler</span>
                <FiChevronDown className="text-gray-500" size={16} />
              </button>
              
              {/* Category Dropdown */}
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-3">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?categoryId=${category.id}`}
                      className="flex items-center px-4 py-3 text-sm text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-lg mr-3">{getCategoryIcon(category.name)}</span>
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative flex w-full">
                <input
                  type="text"
                  placeholder="Aradığınız ürünü yazın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl focus:border-orange-500 focus:outline-none bg-gray-50 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-r-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FiSearch size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* User Account */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <FiUser className="text-white" size={16} />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs text-gray-500">
                    {isAuthenticated ? 'Hoş geldin' : 'Giriş Yap'}
                  </div>
                  <div className="text-sm font-medium text-gray-700 flex items-center">
                    {isAuthenticated ? user?.firstName : 'Hesabım'}
                    <FiChevronDown className="ml-1" size={12} />
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                      <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <FiUser className="mr-3 text-gray-400" size={16} />
                        Profilim
                      </Link>
                      <Link to="/orders" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <FiPackage className="mr-3 text-gray-400" size={16} />
                        Siparişlerim
                      </Link>
                      {isAdmin() && (
                        <Link to="/admin/dashboard" className="flex items-center px-4 py-3 text-sm hover:bg-blue-50 text-blue-600 transition-colors">
                          <FiSettings className="mr-3 text-blue-500" size={16} />
                          Admin Paneli
                        </Link>
                      )}
                      {isSeller() && (
                        <Link to="/seller/dashboard" className="flex items-center px-4 py-3 text-sm hover:bg-blue-50 text-blue-600 transition-colors">
                          <FiSettings className="mr-3 text-blue-500" size={16} />
                          Seller Paneli
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-2">
                    <Link to="/login" className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors font-medium">
                      Giriş Yap
                    </Link>
                    <Link to="/register" className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                      Üye Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors hidden md:block">
              <FiHeart size={24} className="text-gray-600" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiShoppingCart size={24} className="text-gray-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <FiX size={24} className="text-gray-600" /> : <FiMenu size={24} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Categories Navigation - Desktop */}
        <nav className="hidden md:block border-t border-gray-100 py-4">
          <div className="flex items-center justify-between">
            <ul className="flex space-x-8">
              <li>
                <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium transition-colors relative group">
                  Ana Sayfa
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              {staticCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={category.path}
                    className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 font-medium transition-colors relative group"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link 
              to="/products?sale=true" 
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>🔥</span>
              <span>İndirimler</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none bg-gray-50"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </form>

            {/* Mobile Categories */}
            <div className="space-y-3">
              <Link
                to="/"
                className="flex items-center py-3 text-gray-700 hover:text-orange-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-xl mr-3">🏠</span>
                Ana Sayfa
              </Link>
              
              {staticCategories.map((category) => (
                <Link
                  key={category.id}
                  to={category.path}
                  className="flex items-center py-3 text-gray-700 hover:text-orange-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-xl mr-3">{category.icon}</span>
                  {category.name}
                </Link>
              ))}
              
              <Link
                to="/products?sale=true"
                className="flex items-center py-3 text-red-500 font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-xl mr-3">🔥</span>
                İndirimler
              </Link>

              {/* Mobile Wishlist */}
              <Link
                to="/wishlist"
                className="flex items-center justify-between py-3 text-gray-700 hover:text-orange-600 transition-colors border-t border-gray-100 mt-4 pt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FiHeart className="mr-3" size={20} />
                  Favorilerim
                </div>
                {wishlistItems.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;