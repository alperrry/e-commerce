import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fi';

const FiArrowLeft = Icons.FiArrowLeft as any;
const FiShield = Icons.FiShield as any;
const FiEye = Icons.FiEye as any;
const FiLock = Icons.FiLock as any;
const FiDatabase = Icons.FiDatabase as any;
const FiMail = Icons.FiMail as any;
const FiGlobe = Icons.FiGlobe as any;

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-purple-600">E-Ticaret</h1>
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <FiShield className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Gizlilik Politikası</h2>
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
                <FiEye className="mr-2 text-purple-600" />
                Giriş
              </h3>
              <p className="text-gray-600 leading-relaxed">
                E-Ticaret sitesi olarak, kişisel verilerinizin güvenliği bizim için son derece önemlidir. 
                Bu gizlilik politikası, kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı, 
                koruduğumuzu ve paylaştığımızı açıklamaktadır.
              </p>
            </section>

            {/* Toplanan Bilgiler */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiDatabase className="mr-2 text-purple-600" />
                Topladığımız Bilgiler
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Kişisel Bilgiler</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Ad ve soyad</li>
                    <li>• E-posta adresi</li>
                    <li>• Telefon numarası</li>
                    <li>• Teslimat adresi</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Alışveriş Bilgileri</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Sipariş geçmişi</li>
                    <li>• Ödeme bilgileri (şifrelenerek)</li>
                    <li>• Ürün tercihleri</li>
                    <li>• Sepet içeriği</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Teknik Bilgiler</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• IP adresi</li>
                    <li>• Tarayıcı bilgileri</li>
                    <li>• Cihaz bilgileri</li>
                    <li>• Site kullanım istatistikleri</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Bilgilerin Kullanımı */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiGlobe className="mr-2 text-purple-600" />
                Bilgilerin Kullanım Amaçları
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Hizmet Sunumu</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Sipariş işlemleri</li>
                    <li>• Teslimat organizasyonu</li>
                    <li>• Müşteri hizmetleri</li>
                    <li>• Hesap yönetimi</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">İletişim</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Sipariş bildirimleri</li>
                    <li>• Kampanya duyuruları</li>
                    <li>• Güvenlik uyarıları</li>
                    <li>• Destek mesajları</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Geliştirme</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Site performansı</li>
                    <li>• Kullanıcı deneyimi</li>
                    <li>• Yeni özellikler</li>
                    <li>• Hata düzeltmeleri</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Güvenlik</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Dolandırıcılık önleme</li>
                    <li>• Hesap koruması</li>
                    <li>• Yasal uyumluluk</li>
                    <li>• Risk analizi</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Veri Güvenliği */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiLock className="mr-2 text-purple-600" />
                Veri Güvenliği
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Teknik Önlemler</h4>
                    <ul className="text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        SSL şifreleme (HTTPS)
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Veri tabanı şifreleme
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Güvenlik duvarı koruması
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Düzenli güvenlik testleri
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">İdari Önlemler</h4>
                    <ul className="text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Sınırlı erişim yetkisi
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Personel eğitimleri
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Gizlilik sözleşmeleri
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Düzenli denetimler
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Çerezler */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🍪 Çerez Politikası</h3>
              <p className="text-gray-600 mb-4">
                Sitemizde kullanıcı deneyimini geliştirmek için çerezler kullanıyoruz. 
                Çerezler hakkında detaylı bilgi:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-semibold text-amber-800 mb-2">Gerekli Çerezler</h5>
                    <p className="text-amber-700">Site işlevselliği için zorunlu</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-amber-800 mb-2">Performans Çerezleri</h5>
                    <p className="text-amber-700">Site performansını ölçer</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-amber-800 mb-2">Pazarlama Çerezleri</h5>
                    <p className="text-amber-700">Kişiselleştirilmiş reklamlar</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Haklarınız */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">⚖️ Haklarınız</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">KVKK Hakları</h4>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>• İşlenen verileriniz hakkında bilgi talep etme</li>
                    <li>• İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>• Yanlış işlenmiş verilerin düzeltilmesini isteme</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">İşlem Hakları</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Verilerinizin silinmesini isteme</li>
                    <li>• İşlemin durdurulmasını talep etme</li>
                    <li>• Zarar görmüş olmanız halinde giderimin istenmesi</li>
                    <li>• Veri taşınabilirlik hakkı</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* İletişim */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiMail className="mr-2 text-purple-600" />
                İletişim
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  Gizlilik politikamız veya kişisel verileriniz hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Veri Sorumlusu</h4>
                    <p className="text-gray-600 text-sm">E-Ticaret Şirketi</p>
                    <p className="text-gray-600 text-sm">privacy@ecommerce.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">KVKK Başvuru</h4>
                    <p className="text-gray-600 text-sm">kvkk@ecommerce.com</p>
                    <p className="text-gray-600 text-sm">+90 (212) 123 45 67</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Güncellemeler */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🔄 Politika Güncellemeleri</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Önemli:</strong> Bu gizlilik politikası zaman zaman güncellenebilir. 
                  Önemli değişiklikler e-posta yoluyla bildirilecektir. 
                  Güncel versiyonu web sitemizden takip edebilirsiniz.
                </p>
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
            to="/terms"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Kullanım Koşullarını Görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;