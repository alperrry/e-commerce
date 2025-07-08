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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Gerçek API çağrıları yapılacak
      // const statsResponse = await api.get('/admin/dashboard/stats');
      // const ordersResponse = await api.get('/admin/dashboard/recent-orders');
      
      // Şimdilik mock data
      setStats({
        totalProducts: 156,
        totalOrders: 1234,
        totalUsers: 892,
        totalRevenue: 125650.50,
        pendingOrders: 23,
        lowStockProducts: 8,
        todayOrders: 12,
        todayRevenue: 4580.00,
      });

      setRecentOrders([
        {
          id: 1,
          orderNumber: 'ORD-2024-001',
          customerName: 'Ahmet Yılmaz',
          totalAmount: 299.90,
          status: 'Pending',
          orderDate: new Date().toISOString(),
        },
        {
          id: 2,
          orderNumber: 'ORD-2024-002',
          customerName: 'Ayşe Demir',
          totalAmount: 450.00,
          status: 'Processing',
          orderDate: new Date().toISOString(),
        },
        {
          id: 3,
          orderNumber: 'ORD-2024-003',
          customerName: 'Mehmet Kaya',
          totalAmount: 189.99,
          status: 'Shipped',
          orderDate: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Ürün</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.lowStockProducts > 0 && (
                  <span className="text-orange-600">
                    <FiAlertCircle className="inline mr-1" />
                    {stats.lowStockProducts} düşük stok
                  </span>
                )}
              </p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">
                <FiTrendingUp className="inline mr-1" />
                %12 artış
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
              <p className="text-2xl font-bold text-gray-800">₺{stats.totalRevenue.toLocaleString('tr-TR')}</p>
              <p className="text-xs text-gray-500 mt-1">
                Bugün: ₺{stats.todayRevenue.toLocaleString('tr-TR')}
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
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <FiClock className="inline mr-1" />
                      {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bugünün Özeti</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Yeni Siparişler</span>
                <span className="font-semibold">{stats.todayOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Günlük Gelir</span>
                <span className="font-semibold">₺{stats.todayRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bekleyen Siparişler</span>
                <span className="font-semibold text-yellow-600">{stats.pendingOrders}</span>
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
              <Link
                to="/admin/orders?status=pending"
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center"
              >
                <FiClock className="mr-2" />
                Bekleyen Siparişler ({stats.pendingOrders})
              </Link>
              <Link
                to="/admin/products?stock=low"
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center"
              >
                <FiAlertCircle className="mr-2" />
                Düşük Stok ({stats.lowStockProducts})
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;