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

  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ürün bulunamadı</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-purple-600 hover:text-purple-700"
          >
            Ürünlere dön
          </button>
        </div>
      </div>
    );
  }

  const discountPercentage = calculateDiscountPercentage();
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ imageUrl: 'https://placehold.co/600x600?text=No+Image', altText: product.name }];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center space-x-2">
          <li><a href="/" className="text-gray-500 hover:text-gray-700">Ana Sayfa</a></li>
          <li className="text-gray-400">/</li>
          <li><a href="/products" className="text-gray-500 hover:text-gray-700">Ürünler</a></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-800">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative bg-white rounded-lg overflow-hidden">
            <img
              src={images[selectedImage].imageUrl}
              alt={images[selectedImage].altText || product.name}
              className="w-full h-[600px] object-contain"
            />
            
            {discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded">
                %{discountPercentage} İndirim
              </span>
            )}

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <FiChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === index ? 'border-purple-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText || `${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand & Name */}
          {product.brand && (
            <p className="text-sm text-gray-500 uppercase tracking-wide">{product.brand}</p>
          )}
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

          {/* Price */}
          <div className="space-y-2">
            {product.discountPrice ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-purple-600">
                  ₺{product.discountPrice.toFixed(2)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ₺{product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-800">
                ₺{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stockQuantity > 0 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Stokta var</span>
                {product.stockQuantity < 10 && (
                  <span className="text-orange-600 ml-2">(Son {product.stockQuantity} adet!)</span>
                )}
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600">Stokta yok</span>
              </>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiMinus />
              </button>
              <span className="px-6 py-3 font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (product.stockQuantity || 10)}
                className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stockQuantity === 0}
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiShoppingCart size={20} />
              Sepete Ekle
            </button>

            <button 
              onClick={handleToggleWishlist}
              className={`p-3 border rounded-lg transition ${
                isInWishlist 
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                  : 'hover:bg-gray-100'
              }`}
              title={isInWishlist ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <FiHeart size={20} className={isInWishlist ? 'fill-current' : ''} />
            </button>

            <button className="p-3 border rounded-lg hover:bg-gray-100">
              <FiShare2 size={20} />
            </button>
          </div>

          {/* Features */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <FiTruck className="text-purple-600" size={24} />
              <div>
                <p className="font-medium">Ücretsiz Kargo</p>
                <p className="text-sm text-gray-600">₺100 ve üzeri alışverişlerde</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiShield className="text-purple-600" size={24} />
              <div>
                <p className="font-medium">Güvenli Ödeme</p>
                <p className="text-sm text-gray-600">256-bit SSL sertifikası</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiRefreshCw className="text-purple-600" size={24} />
              <div>
                <p className="font-medium">Kolay İade</p>
                <p className="text-sm text-gray-600">14 gün içinde ücretsiz iade</p>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t pt-6">
            <div className="flex gap-6 mb-4 border-b">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-2 font-medium transition ${
                  activeTab === 'description'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Açıklama
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 font-medium transition ${
                  activeTab === 'details'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Ürün Detayları
              </button>
            </div>

            <div className="prose max-w-none">
              {activeTab === 'description' ? (
                <div>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><strong>SKU:</strong> {product.sku}</p>
                  {product.brand && <p><strong>Marka:</strong> {product.brand}</p>}
                  <p><strong>Stok Durumu:</strong> {product.stockQuantity} adet</p>
                  {product.category && <p><strong>Kategori:</strong> {product.category.name}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;