import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';

const FiPackage = Icons.FiPackage as any;
const FiShoppingBag = Icons.FiShoppingBag as any;
const FiDollarSign = Icons.FiDollarSign as any;
const FiArrowRight = Icons.FiArrowRight as any;
const FiClock = Icons.FiClock as any;
const FiAlertCircle = Icons.FiAlertCircle as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiEye = Icons.FiEye as any;
const FiStar = Icons.FiStar as any;

interface SellerDashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  todayOrders: number;
  totalRevenue?: number;
  todayRevenue?: number;
  recentOrders?: RecentOrder[];
}

interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  orderDate: string;
}

const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState<SellerDashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Seller dashboard endpoint'ini çağır
      const response = await api.get('/seller/dashboard');
      
      // Response'dan stats ve recentOrders'ı ayır
      const dashboardData = response.data;
      
      // Stats'ı set et
      setStats({
        totalProducts: dashboardData.totalProducts || 0,
        lowStockProducts: dashboardData.lowStockProducts || 0,
        pendingOrders: dashboardData.pendingOrders || 0,
        todayOrders: dashboardData.todayOrders || 0,
        totalRevenue: dashboardData.totalRevenue,
        todayRevenue: dashboardData.todayRevenue,
      });
      
      // Recent orders'ı set et
      setRecentOrders(dashboardData.recentOrders || []);
      
      console.log('📊 Dashboard data loaded:', {
        totalProducts: dashboardData.totalProducts,
        lowStockProducts: dashboardData.lowStockProducts,
        pendingOrders: dashboardData.pendingOrders,
        todayOrders: dashboardData.todayOrders,
        recentOrdersCount: dashboardData.recentOrders?.length || 0
      });
      
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error);
      
      // Eğer seller endpoint yoksa fallback olarak products'tan veri çek
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('🔄 Fallback: Fetching data from products endpoint...');
        try {
          await fetchFallbackData();
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          setError('Dashboard verileri yüklenirken hata oluştu. Seller dashboard endpoint\'i kontrol edin.');
        }
      } else {
        setError(error.response?.data?.message || 'Dashboard verileri yüklenirken hata oluştu');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fallback: Eğer seller/dashboard endpoint'i yoksa products'tan hesapla
  const fetchFallbackData = async () => {
    try {
      // Products'ı çek
      const productsResponse = await api.get('/seller/products?pageSize=1000');
      const products = productsResponse.data.products || [];
      
      // Stats'ı hesapla
      const totalProducts = products.length;
      const lowStockProducts = products.filter((p: any) => p.stockQuantity <= 10).length;
      
      setStats({
        totalProducts,
        lowStockProducts,
        pendingOrders: 0, // Sipariş endpoint'i olmadığı için 0
        todayOrders: 0,
      });
      
      setRecentOrders([]); // Sipariş endpoint'i olmadığı için boş
      
      console.log('📊 Fallback data calculated:', {
        totalProducts,
        lowStockProducts,
        productsCount: products.length
      });
      
    } catch (error) {
      throw error; // Ana catch'e fırlat
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      Pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Beklemede' },
      Processing: { color: 'bg-blue-100 text-blue-800', text: 'İşleniyor' },
      Shipped: { color: 'bg-purple-100 text-purple-800', text: 'Kargoda' },
      Delivered: { color: 'bg-green-100 text-green-800', text: 'Teslim Edildi' },
      Cancelled: { color: 'bg-red-100 text-red-800', text: 'İptal' },
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <FiAlertCircle className="mx-auto text-red-500 mb-3" size={48} />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Hata Oluştu</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchDashboardData()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Satış durumunuzu takip edin</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Güncelleniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Ürün</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
              {stats.lowStockProducts > 0 && (
                <p className="text-xs text-orange-600 mt-1 flex items-center">
                  <FiAlertCircle className="mr-1" size={12} />
                  {stats.lowStockProducts} düşük stok
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiPackage className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen Siparişler</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
              <p className="text-xs text-gray-500 mt-1">İşlem bekliyor</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiClock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bugünün Siparişleri</p>
              <p className="text-2xl font-bold text-gray-800">{stats.todayOrders}</p>
              <p className="text-xs text-green-600 mt-1">Yeni siparişler</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiShoppingBag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Düşük Stok</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</p>
              <p className="text-xs text-orange-600 mt-1">Dikkat gerekiyor</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FiAlertCircle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Son Siparişler</h2>
              <Link
                to="/seller/orders"
                className="text-purple-600 hover:text-purple-700 text-sm flex items-center"
              >
                Tümünü Gör
                <FiArrowRight className="ml-1" />
              </Link>
            </div>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FiShoppingBag className="mx-auto mb-3" size={48} />
              <p>Henüz sipariş bulunmuyor</p>
              <p className="text-xs mt-1 text-gray-400">
                Siparişler burada görünecek
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sipariş No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiClock className="mr-1" size={12} />
                          {formatDate(order.orderDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hızlı İşlemler</h3>
            <div className="space-y-3">
              <Link
                to="/seller/products"
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-center font-medium"
              >
                <FiPackage className="mr-2" />
                Ürün Yönetimi
              </Link>
              
              {stats.pendingOrders > 0 && (
                <Link
                  to="/seller/orders?status=pending"
                  className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center font-medium"
                >
                  <FiClock className="mr-2" />
                  Bekleyen Siparişler ({stats.pendingOrders})
                </Link>
              )}
              
              {stats.lowStockProducts > 0 && (
                <Link
                  to="/seller/products?filter=low-stock"
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center font-medium"
                >
                  <FiAlertCircle className="mr-2" />
                  Düşük Stok ({stats.lowStockProducts})
                </Link>
              )}
              
              {/* Her zaman görünür butonlar */}
              {stats.pendingOrders === 0 && (
                <Link
                  to="/seller/orders"
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center font-medium"
                >
                  <FiShoppingBag className="mr-2" />
                  Sipariş Yönetimi
                </Link>
              )}
            </div>
          </div>

          {/* Revenue Card (if available) */}
          {(stats.totalRevenue || stats.todayRevenue) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Gelir Durumu</h3>
              <div className="space-y-3">
                {stats.totalRevenue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toplam Gelir</span>
                    <span className="font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                )}
                {stats.todayRevenue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bugünün Geliri</span>
                    <span className="font-bold text-blue-600">{formatCurrency(stats.todayRevenue)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;