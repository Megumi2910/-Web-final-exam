import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
  products = [], 
  columns = 5,
  onAddToCart,
  onToggleWishlist,
  wishlistItems = [],
  className = '',
  isHot = false
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Không có sản phẩm nào</div>
        <div className="text-gray-400 text-sm mt-2">Hãy thử tìm kiếm với từ khóa khác</div>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistItems.includes(product.id)}
          isHot={isHot}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
