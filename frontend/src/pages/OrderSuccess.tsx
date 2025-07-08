import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as Icons from 'react-icons/fi';

const FiCheckCircle = Icons.FiCheckCircle as any;
const FiPackage = Icons.FiPackage as any;
const FiMail = Icons.FiMail as any;
const FiArrowRight = Icons.FiArrowRight as any;

const OrderSuccess: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // If no order number, redirect to home
    if (!orderNumber) {
      navigate('/');
    }
  }, [orderNumber, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FiPackage className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Siparişiniz Alındı!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Siparişiniz başarıyla oluşturuldu ve işleme alındı.
          </p>

          {/* Order Number */}
          <div className="bg-purple-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-2">Sipariş Numaranız</p>
            <p className="text-2xl font-bold text-purple-600">{orderNumber}</p>
            <p className="text-sm text-gray-500 mt-2">
              Bu numarayı kullanarak siparişinizi takip edebilirsiniz.
            </p>
          </div>

          {/* Info Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <FiMail className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">E-posta Gönderildi</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Sipariş detaylarınız e-posta adresinize gönderildi.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <FiPackage className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">Kargoya Hazırlanıyor</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Siparişiniz 1-2 iş günü içinde kargoya verilecek.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sıradaki Adımlar</h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-purple-600">1</span>
                </div>
                <p className="text-sm text-gray-600">
                  Siparişiniz onaylandı ve ödeme işlemi başarıyla tamamlandı.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-purple-600">2</span>
                </div>
                <p className="text-sm text-gray-600">
                  Ürünleriniz depomuzda hazırlanıp paketlenecek.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-purple-600">3</span>
                </div>
                <p className="text-sm text-gray-600">
                  Kargo firmasına teslim edildiğinde takip numarası SMS ile gönderilecek.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-purple-600">4</span>
                </div>
                <p className="text-sm text-gray-600">
                  Siparişiniz belirtilen adrese teslim edilecek.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              to="/orders"
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 flex items-center justify-center gap-2"
            >
              Siparişlerim
              <FiArrowRight />
            </Link>
            <Link
              to="/products"
              className="flex-1 bg-white text-purple-600 border-2 border-purple-600 py-3 px-6 rounded-lg font-semibold hover:bg-purple-50 transform hover:scale-105 transition duration-300"
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sorularınız mı var?{' '}
            <Link to="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
              Bize ulaşın
            </Link>
            {' '}veya{' '}
            <Link to="/faq" className="text-purple-600 hover:text-purple-700 font-medium">
              SSS sayfamızı ziyaret edin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;