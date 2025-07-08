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

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

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

                  {/* Actions */}
                  {/*<div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order/${order.orderNumber}`);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="Sipariş Detayı"
                    >
                      <FiEye size={20} />
                    </button>
                    <div className="text-gray-400">
                      {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </div>
                  </div>*/}
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
                    {(order.status === OrderStatus.Pending || order.status === OrderStatus.Processing) && (
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Siparişi İptal Et
                      </button>
                    )}
                   {/* <button
                      onClick={() => navigate(`/order/${order.orderNumber}`)}
                      className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition"
                    >
                      Detaylı Görüntüle
                    </button>*/}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;