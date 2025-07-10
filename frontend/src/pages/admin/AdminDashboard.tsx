import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';

const FiPackage = Icons.FiPackage as any;
const FiShoppingBag = Icons.FiShoppingBag as any;
const FiUsers = Icons.FiUsers as any;
const FiDollarSign = Icons.FiDollarSign as any;
const FiTrendingUp = Icons.FiTrendingUp as any;
const FiTrendingDown = Icons.FiTrendingDown as any;
const FiArrowRight = Icons.FiArrowRight as any;
const FiClock = Icons.FiClock as any;
const FiAlertCircle = Icons.FiAlertCircle as any;
const FiRefreshCw = Icons.FiRefreshCw as any;

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  todayOrders: number;
  todayRevenue: number;
}

interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  orderDate: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Debug: Check admin status
    checkAdminStatus();
    
    // Auto refresh her 30 saniyede bir
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await api.get('/admin/check-admin');
      console.log('Admin status:', response.data);
    } catch (error) {
      console.error('Admin check failed:', error);
    }
  };

  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Paralel olarak hem stats hem de recent orders'ı çek
      const [statsResponse, ordersResponse] = await Promise.all([
        api.get<DashboardStats>('/admin/dashboard/stats'),
        api.get<RecentOrder[]>('/admin/dashboard/recent-orders')
      ]);

      setStats(statsResponse.data);
      setRecentOrders(ordersResponse.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      Refunded: { color: 'bg-gray-100 text-gray-800', text: 'İade' },
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
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
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
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts.toLocaleString('tr-TR')}</p>
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

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders.toLocaleString('tr-TR')}</p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-yellow-600">
                  {stats.pendingOrders} beklemede
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiShoppingBag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers.toLocaleString('tr-TR')}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <FiTrendingUp className="mr-1" size={12} />
                Aktif kullanıcılar
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiUsers className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Bugün: {formatCurrency(stats.todayRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="text-yellow-600" size={24} />
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
                to="/admin/orders"
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
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-xs text-gray-400">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
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
          {/* Today's Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bugünün Özeti</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Yeni Siparişler</span>
                <span className="font-semibold text-blue-600">{stats.todayOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Günlük Gelir</span>
                <span className="font-semibold text-green-600">{formatCurrency(stats.todayRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bekleyen Siparişler</span>
                <span className="font-semibold text-yellow-600">{stats.pendingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Düşük Stok</span>
                <span className="font-semibold text-orange-600">{stats.lowStockProducts}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hızlı İşlemler</h3>
            <div className="space-y-2">
              <Link
                to="/admin/products/new"
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-center"
              >
                <FiPackage className="mr-2" />
                Yeni Ürün Ekle
              </Link>
              
              {stats.pendingOrders > 0 && (
                <Link
                  to="/admin/orders?status=pending"
                  className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center"
                >
                  <FiClock className="mr-2" />
                  Bekleyen Siparişler ({stats.pendingOrders})
                </Link>
              )}
              
              {stats.lowStockProducts > 0 && (
                <Link
                  to="/admin/products?stock=low"
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center"
                >
                  <FiAlertCircle className="mr-2" />
                  Düşük Stok ({stats.lowStockProducts})
                </Link>
              )}
              
              <Link
                to="/admin/users"
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
              >
                <FiUsers className="mr-2" />
                Kullanıcı Yönetimi
              </Link>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performans</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Sipariş Tamamlama</span>
                  <span className="font-medium">
                    {stats.totalOrders > 0 
                      ? Math.round(((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100)
                      : 0
                    }%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.totalOrders > 0 
                        ? ((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100
                        : 0
                      }%` 
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Stok Durumu</span>
                  <span className="font-medium">
                    {stats.totalProducts > 0 
                      ? Math.round(((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100)
                      : 0
                    }%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.totalProducts > 0 
                        ? ((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100
                        : 0
                      }%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;