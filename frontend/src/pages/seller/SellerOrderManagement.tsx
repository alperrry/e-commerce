import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import api from '../../services/api';

const FiShoppingBag = Icons.FiShoppingBag as any;
const FiSearch = Icons.FiSearch as any;
const FiX = Icons.FiX as any;
const FiAlertCircle = Icons.FiAlertCircle as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiClock = Icons.FiClock as any;
const FiEye = Icons.FiEye as any;
const FiEdit = Icons.FiEdit as any;
const FiPackage = Icons.FiPackage as any;
const FiTruck = Icons.FiTruck as any;
const FiCheck = Icons.FiCheck as any;
const FiDollarSign = Icons.FiDollarSign as any;

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  orderDate: string;
  shippingAddress: string;
  orderItems?: OrderItem[];
}

interface OrderItem {
  id: number;
  productId: number;
  product?: {
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  unitPrice: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const SellerOrderManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      // Seller endpoint kullan
      const response = await api.get<PaginatedResponse<Order>>(`/seller/orders?${params}`);
      
      setOrders(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalItems(response.data.pagination?.totalItems || 0);
      
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      setError(error.response?.data?.message || 'Sipariş durumu güncellenirken hata oluştu');
    }
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
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

  const getStatusActions = (order: Order) => {
    const actions = [];
    
    switch (order.status) {
      case 'Pending':
        actions.push(
          <button
            key="process"
            onClick={() => handleStatusUpdate(order.id, 'Processing')}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition text-sm"
          >
            <FiPackage size={14} className="inline mr-1" />
            İşle
          </button>
        );
        break;
      case 'Processing':
        actions.push(
          <button
            key="ship"
            onClick={() => handleStatusUpdate(order.id, 'Shipped')}
            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition text-sm"
          >
            <FiTruck size={14} className="inline mr-1" />
            Kargola
          </button>
        );
        break;
      case 'Shipped':
        actions.push(
          <button
            key="deliver"
            onClick={() => handleStatusUpdate(order.id, 'Delivered')}
            className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition text-sm"
          >
            <FiCheck size={14} className="inline mr-1" />
            Teslim Et
          </button>
        );
        break;
    }

    return actions;
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sipariş Yönetimi</h1>
          <p className="text-gray-600 mt-1">Siparişleri yönetin ve takip edin</p>
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <FiAlertCircle className="text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiShoppingBag className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Beklemede</p>
              <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'Pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiClock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">İşleniyor</p>
              <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'Processing').length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiPackage className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teslim Edildi</p>
              <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'Delivered').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheck className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Sipariş no, müşteri ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tümü', color: 'bg-gray-100 text-gray-700' },
              { value: 'Pending', label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
              { value: 'Processing', label: 'İşleniyor', color: 'bg-blue-100 text-blue-700' },
              { value: 'Shipped', label: 'Kargoda', color: 'bg-purple-100 text-purple-700' },
              { value: 'Delivered', label: 'Teslim Edildi', color: 'bg-green-100 text-green-700' },
              { value: 'Cancelled', label: 'İptal', color: 'bg-red-100 text-red-700' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setCurrentPage(1);
                  if (filter.value !== 'all') {
                    setSearchParams({ status: filter.value });
                  } else {
                    setSearchParams({});
                  }
                }}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  statusFilter === filter.value
                    ? 'bg-purple-600 text-white'
                    : `${filter.color} hover:bg-gray-200`
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiShoppingBag className="mx-auto mb-4" size={64} />
            <h3 className="text-lg font-medium mb-2">Sipariş bulunamadı</h3>
            <p>
              {searchQuery || statusFilter !== 'all'
                ? 'Arama kriterlerinize uygun sipariş bulunamadı.' 
                : 'Henüz sipariş bulunmuyor.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {order.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Bilinmeyen'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="text-purple-600 hover:text-purple-700 p-1 hover:bg-purple-50 rounded"
                            title="Detayları Görüntüle"
                          >
                            <FiEye size={16} />
                          </button>
                          {getStatusActions(order)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} / {totalItems} sipariş
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <FiChevronLeft size={14} />
                      Önceki
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === page
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Sonraki
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Sipariş Detayı - {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={closeOrderModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sipariş Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Sipariş No:</span>
                      <span className="ml-2 font-medium">{selectedOrder.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Durum:</span>
                      <span className="ml-2">{getStatusBadge(selectedOrder.status)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tarih:</span>
                      <span className="ml-2">{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Toplam:</span>
                      <span className="ml-2 font-bold text-purple-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Müşteri Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Ad Soyad:</span>
                      <span className="ml-2">{selectedOrder.user ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` : 'Bilinmeyen'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">E-posta:</span>
                      <span className="ml-2">{selectedOrder.user?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Adres:</span>
                      <span className="ml-2">{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Sipariş Ürünleri</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adet</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Birim Fiyat</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {item.product?.name || `Ürün #${item.productId}`}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Durum İşlemleri</h4>
                <div className="flex gap-3">
                  {getStatusActions(selectedOrder).map((action, index) => (
                    <div key={index}>{action}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={closeOrderModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrderManagement;