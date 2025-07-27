import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { RootState } from '../store';
import api from '../services/api';
import { Order, OrderStatus } from '../types';

const FiPackage = Icons.FiPackage as any;
const FiCalendar = Icons.FiCalendar as any;
const FiTruck = Icons.FiTruck as any;
const FiCheck = Icons.FiCheck as any;
const FiX = Icons.FiX as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiChevronDown = Icons.FiChevronDown as any;
const FiChevronUp = Icons.FiChevronUp as any;
const FiEye = Icons.FiEye as any;
const FiAlertTriangle = Icons.FiAlertTriangle as any;

// Modal interfaces
interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderNumber: string;
  onSuccess: () => void;
}

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  onSuccess: () => void;
}

// Cancel Order Modal Component
const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await api.post('/refund/cancel-order', {
        orderId,
        reason: reason.trim()
      });
      
      alert('Sipariş başarıyla iptal edildi.');
      onSuccess();
      onClose();
      setReason('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Sipariş iptal edilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiAlertTriangle className="text-red-600" size={24} />
          <h3 className="text-lg font-semibold">Siparişi İptal Et</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          <strong>#{orderNumber}</strong> numaralı siparişinizi iptal etmek istediğinizden emin misiniz?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İptal Nedeni <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="İptal nedeninizi açıklayın..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              disabled={loading || !reason.trim()}
            >
              {loading ? 'İptal Ediliyor...' : 'Siparişi İptal Et'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Refund Request Modal Component
const RefundRequestModal: React.FC<RefundRequestModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  totalAmount,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState(totalAmount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (refundType === 'full') {
      setRefundAmount(totalAmount);
    }
  }, [refundType, totalAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await api.post('/refund/request', {
        orderId,
        reason: reason.trim(),
        amount: refundType === 'partial' ? refundAmount : null
      });
      
      alert('İade talebi başarıyla oluşturuldu. Talebiniz incelendikten sonra email ile bilgilendirileceksiniz.');
      onSuccess();
      onClose();
      setReason('');
      setRefundType('full');
      setRefundAmount(totalAmount);
    } catch (error: any) {
      alert(error.response?.data?.message || 'İade talebi oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiRefreshCw className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold">İade Talebi Oluştur</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          <strong>#{orderNumber}</strong> numaralı siparişiniz için iade talebi oluşturun.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Refund Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İade Türü
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="full"
                  checked={refundType === 'full'}
                  onChange={(e) => setRefundType(e.target.value as 'full')}
                  className="mr-2"
                  disabled={loading}
                />
                <span>Tam İade (₺{totalAmount.toFixed(2)})</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="partial"
                  checked={refundType === 'partial'}
                  onChange={(e) => setRefundType(e.target.value as 'partial')}
                  className="mr-2"
                  disabled={loading}
                />
                <span>Kısmi İade</span>
              </label>
            </div>
          </div>

          {/* Partial Refund Amount */}
          {refundType === 'partial' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İade Miktarı (₺)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                min="1"
                max={totalAmount}
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>
          )}

          {/* Reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İade Nedeni <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="İade nedeninizi açıklayın..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading || !reason.trim()}
            >
              {loading ? 'Talep Oluşturuluyor...' : 'İade Talebi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  
  // Modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<Order[]>('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return { text: 'Beklemede', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: FiPackage };
      case OrderStatus.Processing:
        return { text: 'İşleniyor', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: FiRefreshCw };
      case OrderStatus.Shipped:
        return { text: 'Kargoda', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: FiTruck };
      case OrderStatus.Delivered:
        return { text: 'Teslim Edildi', color: 'text-green-600', bgColor: 'bg-green-100', icon: FiCheck };
      case OrderStatus.Cancelled:
        return { text: 'İptal Edildi', color: 'text-red-600', bgColor: 'bg-red-100', icon: FiX };
      case OrderStatus.Refunded:
        return { text: 'İade Edildi', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiRefreshCw };
      default:
        return { text: 'Bilinmiyor', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiPackage };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Handle cancel order
  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setCancelModalOpen(true);
  };

  // Handle refund request
  const handleRefundRequest = (order: Order) => {
    setSelectedOrder(order);
    setRefundModalOpen(true);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    fetchOrders(); // Refresh orders list
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiPackage className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Henüz Siparişiniz Yok</h2>
          <p className="text-gray-600 mb-8">
            İlk siparişinizi verin ve burada görüntüleyin.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Siparişlerim</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const StatusIcon = statusInfo.icon;
          const isExpanded = expandedOrder === order.id;

          return (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleOrderExpansion(order.id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        Sipariş #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
                        <StatusIcon size={14} />
                        {statusInfo.text}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={14} />
                        {formatDate(order.orderDate)}
                      </span>
                      <span className="font-medium">
                        {order.orderItems.length} ürün
                      </span>
                      <span className="font-bold text-purple-600">
                        ₺{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items (Expandable) */}
              {isExpanded && (
                <div className="border-t bg-gray-50 p-6">
                  <h4 className="font-semibold mb-4">Sipariş Ürünleri</h4>
                  <div className="space-y-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-lg">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0].imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FiPackage />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h5 className="font-medium">{item.productName}</h5>
                          <p className="text-sm text-gray-600">
                            {item.quantity} adet x ₺{item.unitPrice.toFixed(2)}
                          </p>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-semibold">₺{item.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ara Toplam</span>
                        <span>₺{(order.totalAmount - order.shippingCost - order.taxAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kargo</span>
                        <span>{order.shippingCost === 0 ? 'Ücretsiz' : `₺${order.shippingCost.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">KDV</span>
                        <span>₺{order.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Toplam</span>
                        <span className="text-purple-600">₺{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Teslimat Adresi</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingFirstName} {order.shippingLastName}<br />
                      {order.shippingAddress}<br />
                      {order.shippingCity}, {order.shippingPostalCode}<br />
                      {order.shippingPhone}
                    </p>
                  </div>

                  {/* Order Actions */}
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    {/* Cancel Order Button */}
                    {(order.status === OrderStatus.Pending || order.status === OrderStatus.Processing) && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                      >
                        <FiX size={16} />
                        Siparişi İptal Et
                      </button>
                    )}

                    {/* Refund Request Button - SHIPPED + DELIVERED */}
                    {(order.status === OrderStatus.Delivered || order.status === OrderStatus.Shipped) && (
                      <button
                        onClick={() => handleRefundRequest(order)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <FiRefreshCw size={16} />
                        {order.status === OrderStatus.Shipped ? 'Kargo İade Et' : 'İade Talep Et'}
                      </button>
                    )}

                    {/* Other existing buttons */}
                    {order.status === OrderStatus.Delivered && (
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Ürünleri Değerlendir
                      </button>
                    )}
                    {order.status === OrderStatus.Shipped && (
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Kargo Takibi
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedOrder && (
        <>
          <CancelOrderModal
            isOpen={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            orderId={selectedOrder.id}
            orderNumber={selectedOrder.orderNumber}
            onSuccess={handleModalSuccess}
          />
          
          <RefundRequestModal
            isOpen={refundModalOpen}
            onClose={() => setRefundModalOpen(false)}
            orderId={selectedOrder.id}
            orderNumber={selectedOrder.orderNumber}
            totalAmount={selectedOrder.totalAmount}
            onSuccess={handleModalSuccess}
          />
        </>
      )}
    </div>
  );
};

export default OrderHistory;