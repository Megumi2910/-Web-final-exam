import React, { useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Button, Badge } from '../ui';
import { clsx } from 'clsx';

const ProductReviews = ({ 
  reviews = [], 
  rating = 0,
  reviewCount = 0,
  className = '' 
}) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === '5') return review.rating === 5;
    if (filter === '4') return review.rating === 4;
    if (filter === '3') return review.rating === 3;
    if (filter === '2') return review.rating === 2;
    if (filter === '1') return review.rating === 1;
    if (filter === 'with-images') return review.images && review.images.length > 0;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return 0;
  });

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Rating summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-shopee-orange mb-2">
              {rating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={clsx(
                    'w-6 h-6',
                    i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <div className="text-gray-600">
              {reviewCount.toLocaleString('vi-VN')} đánh giá
            </div>
          </div>

          {/* Rating distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center space-x-3">
                <span className="text-sm font-medium w-8">{star} sao</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-shopee-orange h-2 rounded-full"
                    style={{
                      width: `${reviewCount > 0 ? (ratingDistribution[star] / reviewCount) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {ratingDistribution[star]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tất cả ({reviewCount})
          </Button>
          {[5, 4, 3, 2, 1].map((star) => (
            <Button
              key={star}
              variant={filter === star.toString() ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(star.toString())}
            >
              {star} sao ({ratingDistribution[star]})
            </Button>
          ))}
          <Button
            variant={filter === 'with-images' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('with-images')}
          >
            Có hình ảnh
          </Button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-shopee-orange"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="highest">Đánh giá cao</option>
          <option value="lowest">Đánh giá thấp</option>
        </select>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có đánh giá nào
          </div>
        ) : (
          sortedReviews.map((review, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {review.userName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        {review.userName || 'Người dùng ẩn danh'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={clsx(
                                'w-4 h-4',
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    {review.verified && (
                      <Badge variant="success" size="sm">
                        Đã mua hàng
                      </Badge>
                    )}
                  </div>

                  {review.content && (
                    <div className="text-gray-700 mb-3">
                      {review.content}
                    </div>
                  )}

                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-3">
                      {review.images.map((image, imgIndex) => (
                        <div
                          key={imgIndex}
                          className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={image}
                            alt={`Review ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {review.variant && (
                    <div className="text-sm text-gray-600 mb-3">
                      Phân loại: {review.variant}
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-shopee-orange transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">Hữu ích ({review.helpful || 0})</span>
                    </button>
                    <button className="text-sm text-gray-500 hover:text-shopee-orange transition-colors">
                      Trả lời
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load more button */}
      {sortedReviews.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Xem thêm đánh giá
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
