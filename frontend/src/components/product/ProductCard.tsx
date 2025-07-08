import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { Product } from '../../types';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { AppDispatch, RootState } from '../../store';

const FiHeart = Icons.FiHeart as any;
const FiShoppingCart = Icons.FiShoppingCart as any;

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(toggleWishlist(product));
  };

  const calculateDiscountPercentage = () => {
    if (product.discountPrice && product.price > product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  };

  const discountPercentage = calculateDiscountPercentage();
  const mainImage = product.images?.find(img => img.isMainImage) || product.images?.[0];

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative overflow-hidden h-64">
          {/* Product Image */}
          <img
            src={mainImage?.imageUrl || 'https://placehold.co/300x300?text=No+Image'}
            alt={mainImage?.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          {discountPercentage > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              %{discountPercentage} İndirim
            </span>
          )}
          
          {product.isFeatured && discountPercentage === 0 && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              Öne Çıkan
            </span>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100 ${
              isInWishlist ? 'bg-red-500 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title={isInWishlist ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <FiHeart size={16} className={isInWishlist ? 'fill-current' : 'text-gray-600'} />
          </button>
        </div>
        
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product.brand}
            </p>
          )}
          
          {/* Product Name */}
          <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          {/* Price and Cart */}
          <div className="flex items-center justify-between">
            <div>
              {product.discountPrice ? (
                <>
                  <span className="text-gray-400 line-through text-sm">
                    ₺{product.price.toFixed(2)}
                  </span>
                  <span className="text-2xl font-bold text-purple-600 ml-2">
                    ₺{product.discountPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-800">
                  ₺{product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition transform hover:scale-105"
              title="Sepete Ekle"
            >
              <FiShoppingCart size={20} />
            </button>
          </div>
          
          {/* Stock Status */}
          <div className="h-5 mt-2">
          {product.stockQuantity < 5 && product.stockQuantity > 0 && (
            <p className="text-xs text-orange-600 mt-2">
              Son {product.stockQuantity} ürün!
            </p>
          )}
          
          {product.stockQuantity === 0 && (
            <p className="text-xs text-red-600 mt-2">
              Stokta yok
            </p>
          )}</div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
