import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../store';
import { removeFromWishlist, clearWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import ProductCard from '../components/product/ProductCard';

const FiHeart = Icons.FiHeart as any;
const FiShoppingCart = Icons.FiShoppingCart as any;
const FiTrash2 = Icons.FiTrash2 as any;
const FiX = Icons.FiX as any;

const Wishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.wishlist);

  const handleRemoveFromWishlist = (productId: number) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (productId: number) => {
    dispatch(addToCart({ productId, quantity: 1 }));
    dispatch(removeFromWishlist(productId));
  };

  const handleAddAllToCart = () => {
    items.forEach(product => {
      dispatch(addToCart({ productId: product.id, quantity: 1 }));
    });
    dispatch(clearWishlist());
  };

  const handleClearWishlist = () => {
    if (window.confirm('Tüm favorileri kaldırmak istediğinizden emin misiniz?')) {
      dispatch(clearWishlist());
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHeart className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Favorileriniz Boş</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Henüz favori ürün eklemediniz. Beğendiğiniz ürünleri favorilere ekleyin!
          </p>
          <Link
            to="/products"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300"
          >
            Ürünleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Favorilerim ({items.length} ürün)
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleAddAllToCart}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <FiShoppingCart />
            Tümünü Sepete Ekle
          </button>
          <button
            onClick={handleClearWishlist}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition flex items-center gap-2"
          >
            <FiTrash2 />
            Tümünü Kaldır
          </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            
            {/* Quick Actions Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="flex-1 bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 transition text-sm flex items-center justify-center gap-1"
                >
                  <FiShoppingCart size={16} />
                  Sepete Ekle
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 transition"
                  title="Favorilerden Kaldır"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* List View Alternative (commented out) */}
      {/* 
      <div className="space-y-4">
        {items.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4">
            <img
              src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/150'}
              alt={product.name}
              className="w-full sm:w-32 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <div className="flex items-center gap-4">
                {product.discountPrice ? (
                  <>
                    <span className="text-2xl font-bold text-purple-600">
                      ₺{product.discountPrice.toFixed(2)}
                    </span>
                    <span className="text-gray-400 line-through">
                      ₺{product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-gray-800">
                    ₺{product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex sm:flex-col gap-2">
              <button
                onClick={() => handleAddToCart(product.id)}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
              >
                Sepete Ekle
              </button>
              <button
                onClick={() => handleRemoveFromWishlist(product.id)}
                className="bg-red-100 text-red-600 py-2 px-4 rounded-lg hover:bg-red-200 transition"
              >
                Kaldır
              </button>
            </div>
          </div>
        ))}
      </div>
      */}
    </div>
  );
};

export default Wishlist;