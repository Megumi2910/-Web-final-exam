import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { clsx } from 'clsx';

const ProductGallery = ({ 
  images = [], 
  className = '' 
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [loadedImages, setLoadedImages] = useState({});

  if (!images || images.length === 0) {
    return (
      <div className={clsx('bg-gray-100 rounded-lg flex items-center justify-center', className)}>
        <div className="text-gray-500">Không có hình ảnh</div>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Main image */}
      <div className="relative group">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shopee-shadow">
          {!imageErrors[selectedImage] ? (
            <>
              {!loadedImages[selectedImage] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-shopee-orange border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={images[selectedImage]}
                alt={`Product ${selectedImage + 1}`}
                className={clsx(
                  "w-full h-full object-cover cursor-zoom-in",
                  !loadedImages[selectedImage] && "opacity-0"
                )}
                onClick={() => setIsZoomed(true)}
                onLoad={() => setLoadedImages(prev => ({ ...prev, [selectedImage]: true }))}
                onError={() => setImageErrors(prev => ({ ...prev, [selectedImage]: true }))}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📷</div>
                <div className="text-sm text-gray-500">Ảnh không khả dụng</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom indicator */}
        <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail images */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={clsx(
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-gray-100',
                selectedImage === index
                  ? 'border-shopee-orange'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              {!imageErrors[index] ? (
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => setImageErrors(prev => ({ ...prev, [index]: true }))}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[selectedImage]}
              alt={`Zoomed product ${selectedImage + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
