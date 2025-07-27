import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { AppDispatch, RootState } from '../store';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import api from '../services/api';
import { Product } from '../types';

const FiShoppingCart = Icons.FiShoppingCart as any;
const FiHeart = Icons.FiHeart as any;
const FiShare2 = Icons.FiShare2 as any;
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiMinus = Icons.FiMinus as any;
const FiPlus = Icons.FiPlus as any;
const FiTruck = Icons.FiTruck as any;
const FiShield = Icons.FiShield as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiStar = Icons.FiStar as any;
const FiMessageCircle = Icons.FiMessageCircle as any;
const FiEye = Icons.FiEye as any;
const FiClock = Icons.FiClock as any;
const FiGift = Icons.FiGift as any;
const FiCheck = Icons.FiCheck as any;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading: cartLoading } = useSelector((state: RootState) => state.cart);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);

  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;

  // Resim URL'ini düzgün formatla
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return 'https://placehold.co/600x600?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5288${imageUrl}`;
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get<Product>(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ productId: product.id, quantity }));
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      dispatch(toggleWishlist(product));
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 10)) {
      setQuantity(newQuantity);
    }
  };

  const calculateDiscountPercentage = () => {
    if (product && product.discountPrice && product.price > product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification here
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center bg-white rounded-2xl shadow-lg p-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiEye size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ürün bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
          >
            Ürünlere Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const discountPercentage = calculateDiscountPercentage();
  
  // Resim listesini hazırla
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => ({
        ...img,
        imageUrl: getImageUrl(img.imageUrl)
      }))
    : [{ 
        imageUrl: 'https://placehold.co/600x600?text=No+Image', 
        altText: product.name,
        isMainImage: true,
        displayOrder: 0
      }];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm">
            <ol className="flex items-center space-x-2">
              <li><a href="/" className="text-gray-500 hover:text-orange-600 transition-colors">Ana Sayfa</a></li>
              <li className="text-gray-300">/</li>
              <li><a href="/products" className="text-gray-500 hover:text-orange-600 transition-colors">Ürünler</a></li>
              <li className="text-gray-300">/</li>
              <li className="text-gray-800 font-medium truncate max-w-xs">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Images - Sol taraf */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Ana resim */}
              <div className="relative mb-4 group">
                <div className="relative overflow-hidden rounded-xl bg-gray-50 aspect-square">
                  <img
                    src={images[selectedImage].imageUrl}
                    alt={images[selectedImage].altText || product.name}
                    className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in hover:scale-105'}`}
                    onClick={() => setIsZoomed(!isZoomed)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image';
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {discountPercentage > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                        %{discountPercentage} İNDİRİM
                      </span>
                    )}
                    {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                      <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        SON {product.stockQuantity} ADET!
                      </span>
                    )}
                  </div>

                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <FiChevronLeft size={20} className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <FiChevronRight size={20} className="text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      {selectedImage + 1} / {images.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail images */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index 
                          ? 'border-orange-500 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-orange-300 hover:scale-105'
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.altText || `${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Sağ taraf */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {/* Header section */}
              <div>
                {product.brand && (
                  <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {product.name}
                </h1>
                
                {/* Rating & Reviews */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        size={16} 
                        className={`${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(4.2)</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                    <FiMessageCircle size={14} />
                    127 Yorum
                  </button>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">2.3k görüntülenme</span>
                </div>
              </div>

              {/* Price section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                {product.discountPrice ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-red-600">
                        ₺{product.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        ₺{product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">
                      ₺{(product.price - product.discountPrice).toFixed(2)} tasarruf ediyorsunuz!
                    </p>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">
                    ₺{product.price.toFixed(2)}
                  </span>
                )}
                
                {/* Installment info */}
                <div className="mt-3 pt-3 border-t border-orange-100">
                  <p className="text-sm text-gray-600">
                    <strong>₺{(product.discountPrice || product.price / 3).toFixed(2)}</strong> x 3 taksit
                    <span className="text-green-600 ml-2 font-medium">komisyonsuz</span>
                  </p>
                </div>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-3">
                {product.stockQuantity > 0 ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Stokta Mevcut</span>
                    </div>
                    {product.stockQuantity < 10 && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                        Sadece {product.stockQuantity} adet kaldı!
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-semibold">Stokta Yok</span>
                  </div>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiMinus size={18} />
                    </button>
                    <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (product.stockQuantity || 10)}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    Toplam: <span className="font-bold text-lg text-gray-900">
                      ₺{((product.discountPrice || product.price) * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading || product.stockQuantity === 0}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <FiShoppingCart size={24} />
                    {cartLoading ? 'Ekleniyor...' : 'Sepete Ekle'}
                  </button>

                  <button 
                    onClick={handleToggleWishlist}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                      isInWishlist 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'border-gray-200 hover:border-red-200 hover:bg-red-50'
                    }`}
                    title={isInWishlist ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  >
                    <FiHeart size={24} className={isInWishlist ? 'fill-current' : ''} />
                  </button>

                  <button 
                    onClick={handleShare}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                    title="Paylaş"
                  >
                    <FiShare2 size={24} />
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiTruck className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Ücretsiz Kargo</p>
                    <p className="text-xs text-green-600">₺150 üzeri</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiShield className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">Güvenli Ödeme</p>
                    <p className="text-xs text-blue-600">SSL Korumalı</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiRefreshCw className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-800">Kolay İade</p>
                    <p className="text-xs text-purple-600">14 gün garanti</p>
                  </div>
                </div>
              </div>

              {/* Delivery info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FiClock className="text-blue-600" size={20} />
                  <span className="font-semibold text-gray-800">Teslimat Bilgileri</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <FiCheck className="inline text-green-500 mr-1" size={14} />
                  Bugün sipariş verirseniz <strong>yarın kargoda</strong>
                </p>
                <p className="text-sm text-gray-600">
                  <FiGift className="inline text-purple-500 mr-1" size={14} />
                  Hediye paketi seçeneği mevcut
                </p>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="bg-white rounded-2xl shadow-lg mt-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`py-4 border-b-2 font-semibold transition-colors ${
                      activeTab === 'description'
                        ? 'text-orange-600 border-orange-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    Ürün Açıklaması
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 border-b-2 font-semibold transition-colors ${
                      activeTab === 'details'
                        ? 'text-orange-600 border-orange-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    Ürün Özellikleri
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-4 border-b-2 font-semibold transition-colors ${
                      activeTab === 'reviews'
                        ? 'text-orange-600 border-orange-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    Değerlendirmeler (127)
                  </button>
                </nav>
              </div>

              <div className="p-8">
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
                
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">SKU:</span>
                        <span className="text-gray-900">{product.sku}</span>
                      </div>
                      {product.brand && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Marka:</span>
                          <span className="text-gray-900">{product.brand}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Stok Durumu:</span>
                        <span className="text-gray-900">{product.stockQuantity} adet</span>
                      </div>
                      {product.category && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Kategori:</span>
                          <span className="text-gray-900">{product.category.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <FiMessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Henüz değerlendirme bulunmuyor.</p>
                      <button className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                        İlk Yorumu Siz Yazın
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;