import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Star, ShoppingCart } from 'lucide-react';
import { Button, Badge } from '../ui';
import { clsx } from 'clsx';

const ProductCard = ({ 
  product, 
  className = '',
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  isHot = false
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const {
    id,
    name,
    price,
    originalPrice,
    discount,
    rating,
    reviewCount,
    image,
    shop,
    isNew = false
  } = product;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };


  const handleProductClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div 
      onClick={handleProductClick}
      className={clsx('group bg-white rounded-lg shopee-shadow hover:shopee-shadow-lg transition-all duration-300 overflow-hidden cursor-pointer', className)}
    >
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-shopee-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={image}
              alt={name}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={clsx(
                "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
                !imageLoaded && "opacity-0"
              )}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-xs text-gray-500">Ảnh không khả dụng</div>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <Badge variant="primary" size="sm">Mới</Badge>}
          {discount > 0 && (
            <Badge variant="primary" size="sm">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Hot icon for hot products */}
        {isHot && (
          <div className="absolute top-2 right-2">
            <div className="bg-red-500 text-white rounded-full p-1.5 shadow-lg">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
        )}

        {/* Add to cart button */}
        <div className="absolute inset-x-0 bottom-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>

      {/* Product info */}
      <div className="p-3">
        {/* Shop name */}
        <div className="text-xs text-gray-500 mb-1 truncate">
          {shop}
        </div>

        {/* Product name */}
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-shopee-orange transition-colors">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={clsx(
                  'w-3 h-3',
                  i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-shopee-orange">
              {price.toLocaleString('vi-VN')}đ
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
