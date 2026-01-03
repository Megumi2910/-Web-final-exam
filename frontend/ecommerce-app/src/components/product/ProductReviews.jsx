import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, X } from 'lucide-react';
import { Button, Badge } from '../ui';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { reviewApi } from '../../services/reviewApi';

const ProductReviews = ({ 
  productId,
  reviews = [], 
  rating = 0,
  reviewCount = 0,
  ratingDistribution: propRatingDistribution = {},
  className = '',
  onReviewCreated
}) => {
  const { user, isAuthenticated, hasRole } = useAuth();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);

  // Use prop rating distribution if provided, otherwise calculate from reviews
  const ratingDistribution = Object.keys(propRatingDistribution).length > 0
    ? {
        5: propRatingDistribution[5] || 0,
        4: propRatingDistribution[4] || 0,
        3: propRatingDistribution[3] || 0,
        2: propRatingDistribution[2] || 0,
        1: propRatingDistribution[1] || 0,
      }
    : {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };

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
    const dateA = a.createdAt || a.date || a.updatedAt;
    const dateB = b.createdAt || b.date || b.updatedAt;
    
    if (sortBy === 'newest') return new Date(dateB) - new Date(dateA);
    if (sortBy === 'oldest') return new Date(dateA) - new Date(dateB);
    if (sortBy === 'highest') {
      // Handle null ratings (admin/seller comments) - put them at the end
      if (!a.rating && !b.rating) return 0;
      if (!a.rating) return 1;
      if (!b.rating) return -1;
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      // Handle null ratings (admin/seller comments) - put them at the end
      if (!a.rating && !b.rating) return 0;
      if (!a.rating) return 1;
      if (!b.rating) return -1;
      return a.rating - b.rating;
    }
    return 0;
  });

  // Check if user can review and has purchased
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!isAuthenticated() || !productId) {
        setCanReview(false);
        return;
      }

      const isAdmin = hasRole('ADMIN');
      const isSeller = hasRole('SELLER');
      const isCustomer = hasRole('CUSTOMER');

      try {
        // Check if user has already reviewed
        const hasReviewedResponse = await reviewApi.hasUserReviewedProduct(productId);
        if (hasReviewedResponse.data.success && hasReviewedResponse.data.data) {
          setHasReviewed(true);
          // Get user's review
          const userReviewResponse = await reviewApi.getUserReviewForProduct(productId);
          if (userReviewResponse.data.success && userReviewResponse.data.data) {
            setUserReview(userReviewResponse.data.data);
          }
        }

        // For customers, check if they purchased the product
        if (isCustomer) {
          // The backend will check this when creating review, but we can show a message
          setCanReview(true);
        } else if (isAdmin || isSeller) {
          // Admin and seller can always comment
          setCanReview(true);
        }
      } catch (err) {
        console.error('Error checking review eligibility:', err);
        setCanReview(false);
      }
    };

    checkReviewEligibility();
  }, [productId, isAuthenticated, hasRole]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated()) {
      alert('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }

    const isAdmin = hasRole('ADMIN');
    const isSeller = hasRole('SELLER');
    const isCustomer = hasRole('CUSTOMER');

    // Validation
    if (isCustomer) {
      if (reviewRating < 1 || reviewRating > 5) {
        alert('Vui lòng chọn đánh giá từ 1 đến 5 sao');
        return;
      }
    } else if (isAdmin || isSeller) {
      if (!reviewComment || reviewComment.trim() === '') {
        alert('Vui lòng nhập bình luận');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const reviewData = {
        productId: productId,
        rating: isCustomer ? reviewRating : null,
        comment: reviewComment.trim() || null
      };

      if (hasReviewed && userReview) {
        // Update existing review
        await reviewApi.updateReview(userReview.id, reviewData);
        alert('Cập nhật đánh giá thành công!');
      } else {
        // Create new review
        await reviewApi.createReview(reviewData);
        alert('Đánh giá thành công!');
      }

      // Reset form
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false);
      setHasReviewed(true);

      // Refresh reviews
      if (onReviewCreated) {
        onReviewCreated();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
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
                        {review.rating && (
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
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt || review.date || review.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.userRole === 'ADMIN' && (
                        <Badge variant="primary" size="sm">
                          Admin
                        </Badge>
                      )}
                      {review.userRole === 'SELLER' && review.sellerId && review.userId === review.sellerId && (
                        <Badge variant="primary" size="sm">
                          Seller
                        </Badge>
                      )}
                      {review.isVerifiedPurchase && (
                        <Badge variant="success" size="sm">
                          Đã mua hàng
                        </Badge>
                      )}
                    </div>
                  </div>

                  {(review.comment || review.content) && (
                    <div className="text-gray-700 mb-3">
                      {review.comment || review.content}
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

      {/* Review Form */}
      {isAuthenticated() && canReview && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          {!showReviewForm ? (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="w-full"
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {hasReviewed ? 'Chỉnh sửa đánh giá của bạn' : hasRole('CUSTOMER') ? 'Viết đánh giá' : 'Viết bình luận'}
            </Button>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {hasRole('CUSTOMER') ? 'Viết đánh giá' : hasRole('ADMIN') ? 'Bình luận (Admin)' : 'Bình luận (Seller)'}
                </h3>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewRating(0);
                    setReviewComment('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {hasRole('CUSTOMER') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={clsx(
                            'w-8 h-8 transition-colors',
                            star <= reviewRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          )}
                        />
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="text-sm text-gray-600 ml-2">
                        {reviewRating} sao
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {hasRole('CUSTOMER') ? 'Bình luận (tùy chọn)' : 'Bình luận'} <span className="text-red-500">{hasRole('CUSTOMER') ? '' : '*'}</span>
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={hasRole('CUSTOMER') ? 'Chia sẻ trải nghiệm của bạn về sản phẩm này...' : 'Nhập bình luận của bạn...'}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reviewComment.length}/2000 ký tự
                </p>
              </div>

              {hasRole('CUSTOMER') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá. Bạn có thể để trống bình luận nếu chỉ muốn đánh giá bằng sao.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewRating(0);
                    setReviewComment('');
                  }}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || (hasRole('CUSTOMER') && reviewRating === 0) || (!hasRole('CUSTOMER') && !reviewComment.trim())}
                >
                  {isSubmitting ? 'Đang gửi...' : hasReviewed ? 'Cập nhật' : 'Gửi đánh giá'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isAuthenticated() && hasRole('CUSTOMER') && !hasPurchased && !hasReviewed && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Bạn cần mua sản phẩm này trước khi có thể đánh giá.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
