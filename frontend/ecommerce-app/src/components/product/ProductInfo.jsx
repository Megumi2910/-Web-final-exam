import React, { useState } from 'react';
import { 
  Star, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RotateCcw, 
  Minus,
  Plus
} from 'lucide-react';
import { Button, Badge } from '../ui';
import { clsx } from 'clsx';

const ProductInfo = ({ 
  product, 
  onAddToCart,
  onBuyNow,
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
    variants = [],
    status
  } = product;

  const isDiscontinued = status === 'DISCONTINUED';
  const isOutOfStock = status === 'OUT_OF_STOCK';
  const cannotPurchase = isDiscontinued || isOutOfStock;


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
      {/* Discontinued Banner */}
      {isDiscontinued && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-800 font-semibold text-lg">Sản phẩm đã ngừng bán</span>
          </div>
          <p className="text-red-700 text-sm mt-2">
            Sản phẩm này hiện không còn được bán. Bạn vẫn có thể xem thông tin sản phẩm và đánh giá.
          </p>
        </div>
      )}

      {/* Out of Stock Banner */}
      {isOutOfStock && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-orange-800 font-semibold text-lg">Sản phẩm đã hết hàng</span>
          </div>
          <p className="text-orange-700 text-sm mt-2">
            Sản phẩm này hiện đã hết hàng. Bạn vẫn có thể xem thông tin sản phẩm và đánh giá.
          </p>
        </div>
      )}

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

      {/* Quantity - Only show if product can be purchased */}
      {!cannotPurchase && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Số lượng:</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuantityChange(quantity - 1);
                }}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuantityChange(quantity + 1);
                }}
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
      )}

      {/* Action buttons - Hide if product cannot be purchased */}
      {!cannotPurchase && (
        <div className="flex flex-col space-y-3" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Capture current quantity value to prevent any state changes
              const currentQuantity = quantity;
              onBuyNow?.({ ...product, quantity: currentQuantity, selectedVariant });
            }}
            className="w-full shopee-gradient"
            size="lg"
            type="button"
          >
            Mua ngay
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Capture current quantity value to prevent any state changes
              const currentQuantity = quantity;
              onAddToCart?.({
                ...product,
                quantity: currentQuantity,
                selectedVariant
              });
            }}
            className="w-full shopee-gradient"
            size="lg"
            type="button"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Thêm vào giỏ hàng
          </Button>
        </div>
      )}

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
