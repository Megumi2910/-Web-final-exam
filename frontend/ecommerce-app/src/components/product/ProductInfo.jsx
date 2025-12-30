import React, { useState } from 'react';
import { 
  Heart, 
  Star, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RotateCcw, 
  Minus,
  Plus,
  Share2
} from 'lucide-react';
import { Button, Badge } from '../ui';
import { clsx } from 'clsx';

const ProductInfo = ({ 
  product, 
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  className = '' 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const {
    name,
    price,
    originalPrice,
    discount,
    rating,
    reviewCount,
    soldCount,
    variants = []
  } = product;

  const handleAddToCart = () => {
    onAddToCart?.({
      ...product,
      quantity,
      selectedVariant
    });
  };

  const handleToggleWishlist = () => {
    onToggleWishlist?.(product);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Product title and rating */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{name}</h1>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={clsx(
                    'w-4 h-4',
                    i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {rating} ({reviewCount} đánh giá)
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Đã bán {soldCount?.toLocaleString('vi-VN') || 0}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-bold text-shopee-orange">
            {price.toLocaleString('vi-VN')}đ
          </span>
          {originalPrice && originalPrice > price && (
            <>
              <span className="text-xl text-gray-500 line-through">
                {originalPrice.toLocaleString('vi-VN')}đ
              </span>
              <Badge variant="primary">
                -{discount}%
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Tùy chọn:</h3>
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index}>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {variant.name}:
                </div>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => setSelectedVariant({ ...variant, selectedOption: option })}
                      className={clsx(
                        'px-4 py-2 border rounded-lg text-sm transition-colors',
                        selectedVariant?.selectedOption?.value === option.value
                          ? 'border-shopee-orange bg-shopee-orange/10 text-shopee-orange'
                          : 'border-gray-300 hover:border-gray-400'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Số lượng:</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-600">
            {product.stock || 999} sản phẩm có sẵn
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={handleAddToCart}
          className="flex-1 shopee-gradient"
          size="lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Thêm vào giỏ hàng
        </Button>
        <Button
          onClick={handleToggleWishlist}
          variant={isWishlisted ? "primary" : "outline"}
          size="lg"
        >
          <Heart className={clsx('w-5 h-5', isWishlisted && 'fill-current')} />
        </Button>
        <Button
          variant="outline"
          size="lg"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Truck className="w-6 h-6 text-shopee-orange" />
          <div>
            <div className="font-medium text-gray-900">Miễn phí vận chuyển</div>
            <div className="text-sm text-gray-600">Đơn hàng từ 99k</div>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <RotateCcw className="w-6 h-6 text-shopee-orange" />
          <div>
            <div className="font-medium text-gray-900">Đổi trả dễ dàng</div>
            <div className="text-sm text-gray-600">Trong 7 ngày</div>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Shield className="w-6 h-6 text-shopee-orange" />
          <div>
            <div className="font-medium text-gray-900">Bảo hành chính hãng</div>
            <div className="text-sm text-gray-600">12 tháng</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
