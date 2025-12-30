import React, { useState } from 'react';
import { clsx } from 'clsx';

const CategoryCard = ({ 
  category, 
  className = '',
  onClick 
}) => {
  const { name, image, productCount } = category;
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={() => onClick?.(category)}
      className={clsx(
        'group cursor-pointer bg-white rounded-lg shopee-shadow hover:shopee-shadow-lg transition-all duration-300 overflow-hidden',
        className
      )}
    >
      {/* Category image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-shopee-orange border-t-transparent rounded-full animate-spin"></div>
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
            <div className="text-5xl mb-2">📦</div>
            <div className="text-xs text-gray-600 font-medium">{name}</div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
      </div>

      {/* Category info */}
      <div className="p-4 text-center">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-shopee-orange transition-colors">
          {name}
        </h3>
        {productCount && (
          <p className="text-xs text-gray-500 mt-1">
            {productCount} sản phẩm
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
