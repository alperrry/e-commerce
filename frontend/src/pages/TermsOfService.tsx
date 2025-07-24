import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fi';

const FiArrowLeft = Icons.FiArrowLeft as any;
const FiFileText = Icons.FiFileText as any;
const FiCheckCircle = Icons.FiCheckCircle as any;
const FiXCircle = Icons.FiXCircle as any;
const FiShoppingCart = Icons.FiShoppingCart as any;
const FiCreditCard = Icons.FiCreditCard as any;
const FiTruck = Icons.FiTruck as any;
const FiAlertTriangle = Icons.FiAlertTriangle as any;

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-purple-600">E-Ticaret</h1>
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <FiFileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Kullanım Koşulları</h2>
              <p className="text-gray-600 mt-1">Son güncellenme: {new Date().toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Giriş */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiCheckCircle className="mr-2 text-blue-600" />
                Kullanım Koşullarını Kabul
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-800 font-medium mb-3">
                  E-Ticaret platformumuzu kullanarak aşağıdaki koşulları kabul etmiş olursunuz:
                </p>
                <ul className="text-blue-700 space-y-2">
                  <li>• Bu kullanım koşullarına uyacağınızı</li>
                  <li>• Yasal düzenlemelere riayet edeceğinizi</li>
                  <li>• Doğru bilgiler vereceğinizi</li>
                  <li>• Hesabınızın güvenliğinden sorumlu olduğunuzu</li>
                </ul>
              </div>
            </section>

            {/* Hesap Koşulları */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">👤 Hesap Oluşturma ve Kullanım</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <FiCheckCircle className="mr-2" />
                    İzin Verilen Kullanım
                  </h4>
                  <ul className="text-green-700 text-sm space-y-2">
                    <li>• 18 yaşını doldurmuş kişiler hesap açabilir</li>
                    <li>• Gerçek ve doğru bilgiler verilmelidir</li>
                    <li>• Kişi başına bir hesap açılabilir</li>
                    <li>• Şifrenizi güvenli tutmalısınız</li>
                    <li>• Hesap aktivitelerinizden sorumlusunuz</li>
                  </ul>
                </div>

                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                    <FiXCircle className="mr-2" />
                    Yasak Faaliyetler
                  </h4>
                  <ul className="text-red-700 text-sm space-y-2">
                    <li>• Sahte bilgiler vermek</li>
                    <li>• Başkasının hesabını kullanmak</li>
                    <li>• Dolandırıcılık faaliyetleri</li>
                    <li>• Sistemi kötüye kullanmak</li>
                    <li>• Telif hakkı ihlali</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Alışveriş Koşulları */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiShoppingCart className="mr-2 text-purple-600" />
                Alışveriş ve Sipariş Koşulları
              </h3>
              
              <div className="space-y-6">
                {/* Ürün Bilgileri */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-800 mb-3">📦 Ürün Bilgileri ve Stok</h4>
                  <div className="text-purple-700 space-y-2">
                    <p>• Ürün bilgileri mümkün olduğunca doğru verilmektedir</p>
                    <p>• Fiyatlar ve stok durumu anlık olarak değişebilir</p>
                    <p>• Ürün görselleri gerçek ürünü temsil etmektedir</p>
                    <p>• Teknik özellikler üretici tarafından değiştirilebilir</p>
                  </div>
                </div>

                {/* Sipariş Süreci */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <FiShoppingCart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h5 className="font-semibold text-gray-800 mb-2">1. Sepete Ekleme</h5>
                    <p className="text-gray-600 text-sm">Ürünleri sepetinize ekleyin</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <FiCreditCard className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h5 className="font-semibold text-gray-800 mb-2">2. Ödeme</h5>
                    <p className="text-gray-600 text-sm">Güvenli ödeme yapın</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <FiTruck className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <h5 className="font-semibold text-gray-800 mb-2">3. Teslimat</h5>
                    <p className="text-gray-600 text-sm">Siparişinizi teslim alın</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ödeme Koşulları */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiCreditCard className="mr-2 text-green-600" />
                Ödeme ve Faturalama
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">💳 Kabul Edilen Ödeme Yöntemleri</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Kredi Kartı (Visa, Mastercard, American Express)
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Banka Kartı
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Havale/EFT
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Kapıda Ödeme (Nakit/Kart)
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">📄 Faturalama Bilgileri</h4>
                  <div className="space-y-2 text-gray-600">
                    <p>• Faturalar elektronik ortamda düzenlenir</p>
                    <p>• E-fatura sistemi kullanılmaktadır</p>
                    <p>• KDV dahil fiyatlar gösterilir</p>
                    <p>• Kurumsal fatura talep edilebilir</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                  <FiAlertTriangle className="mr-2" />
                  Önemli Ödeme Koşulları
                </h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Ödeme onaylanmadan sipariş işleme alınmaz</li>
                  <li>• Kredi kartı bilgileri saklanmaz</li>
                  <li>• Taksit seçenekleri bankaya bağlıdır</li>
                  <li>• Havale ödemelerinde 2 iş günü beklenir</li>
                </ul>
              </div>
            </section>

            {/* Teslimat ve İade */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiTruck className="mr-2 text-blue-600" />
                Teslimat ve İade Koşulları
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">🚚 Teslimat</h4>
                  <ul className="text-blue-700 text-sm space-y-2">
                    <li>• Teslimat süresi 1-3 iş günüdür</li>
                    <li>• Ücretsiz kargo 150₺ üzeri siparişlerde</li>
                    <li>• Kargo ücreti checkout sırasında gösterilir</li>
                    <li>• Teslimat adresinde bulunmanız gerekir</li>
                    <li>• Kimlik kontrolü yapılabilir</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">↩️ İade Koşulları</h4>
                  <ul className="text-green-700 text-sm space-y-2">
                    <li>• 14 gün içinde ücretsiz iade</li>
                    <li>• Ürün orijinal ambalajında olmalı</li>
                    <li>• İade nedeni belirtilmelidir</li>
                    <li>• Kişisel hijyen ürünleri iade edilemez</li>
                    <li>• İade onayından sonra 5-7 iş günü içinde ödeme iadesi</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Fikri Mülkiyet */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">© Fikri Mülkiyet Hakları</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  Bu web sitesinde yer alan tüm içerik, tasarım, logo, metin, görsel ve yazılım 
                  telif hakkı ve fikri mülkiyet hukuku ile korunmaktadır.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">🚫 Yasak İşlemler</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• İçerikleri kopyalamak</li>
                      <li>• Tasarımı taklit etmek</li>
                      <li>• Logo ve markaları kullanmak</li>
                      <li>• Yazılımı reverse engineering yapmak</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">✅ İzin Verilen Kullanım</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Kişisel alışveriş amaçlı kullanım</li>
                      <li>• Sosyal medyada ürün paylaşımı</li>
                      <li>• Yasal çerçevede inceleme</li>
                      <li>• Akademik araştırmalar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Sorumluluk Sınırları */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiAlertTriangle className="mr-2 text-orange-600" />
                Sorumluluk ve Garanti Sınırları
              </h3>
              
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">⚠️ Platform Sorumluluğu</h4>
                  <p className="text-orange-700 text-sm">
                    Platformumuz, satıcılar ve alıcılar arasında aracılık hizmeti sunmaktadır. 
                    Ürün kalitesi, teslimat ve müşteri hizmetlerinden satıcılar sorumludur.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">🚨 Sorumluluk Reddi</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Teknik arızalar nedeniyle oluşabilecek kayıplar</li>
                    <li>• Üçüncü taraf hizmetlerinden kaynaklanan sorunlar</li>
                    <li>• Mücbir sebep durumları</li>
                    <li>• Kullanıcı hatalarından doğan zararlar</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Değişiklikler */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🔄 Koşul Değişiklikleri</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Önemli Uyarı:</strong> Bu kullanım koşulları yasal gereklilikler veya 
                  hizmet iyileştirmeleri nedeniyle güncellenebilir. Önemli değişiklikler 
                  30 gün önceden bildirilecektir. Güncel koşullar web sitemizde yayınlanır.
                </p>
              </div>
            </section>

            {/* İletişim */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📞 Hukuki İletişim</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Şirket Bilgileri</h4>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>E-Ticaret Ltd. Şti.</p>
                      <p>Mersis No: 123456789012345</p>
                      <p>İstanbul Ticaret Sicili</p>
                      <p>legal@ecommerce.com</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Uyuşmazlık Çözümü</h4>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>İstanbul Mahkemeleri yetkilidir</p>
                      <p>Türk Hukuku uygulanır</p>
                      <p>Arabuluculuk önceliklidir</p>
                      <p>Tüketici hakları saklıdır</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/register"
            className="flex items-center text-gray-600 hover:text-gray-800 transition"
          >
            <FiArrowLeft className="mr-2" />
            Kayıt Sayfasına Dön
          </Link>
          
          <Link
            to="/privacy"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Gizlilik Politikasını Görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;