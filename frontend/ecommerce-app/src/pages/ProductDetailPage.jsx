import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';
import Toast from '../components/ui/Toast';
import { ProductGallery, ProductInfo, ProductReviews } from '../components/product';
import { ProductGrid } from '../components/product';
import { productApi } from '../services/productApi';
import { cartApi } from '../services/cartApi';
import { reviewApi } from '../services/reviewApi';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isVerified } = useAuth();
  const [product, setProduct] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productApi.getProductById(id);
      const productData = response.data.data;
      
      // Transform API data to match component expectations
      const transformedProduct = {
        ...productData,
        images: productData.imageUrls || [productData.imageUrl].filter(Boolean),
        shop: productData.sellerName || 'N/A',
        sellerId: productData.sellerId, // Store sellerId for navigation
        originalPrice: productData.originalPrice || productData.price,
        discount: productData.originalPrice ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100) : 0,
        variants: productData.variants || [],
        specifications: productData.specifications || [],
        features: productData.features || [],
        status: productData.status // Preserve status for discontinued check
      };
      
      setProduct(transformedProduct);
      
      // Fetch related products (products from same category)
      if (productData.categoryId) {
        try {
          const relatedResponse = await productApi.getProductsByCategory(productData.categoryId, 0, 4);
          const related = (relatedResponse.data.data.content || [])
            .filter(p => p.id !== productData.id)
            .slice(0, 4);
          setRelatedProducts(related);
        } catch (err) {
          console.error('Failed to fetch related products:', err);
        }
      }
      
      // Fetch reviews and rating statistics
      try {
        const [reviewsResponse, ratingResponse, countResponse, distributionResponse] = await Promise.all([
          reviewApi.getReviewsByProductId(productData.id, 0, 10),
          reviewApi.getAverageRating(productData.id),
          reviewApi.getReviewCount(productData.id),
          reviewApi.getRatingDistribution(productData.id)
        ]);

        if (reviewsResponse.data.success) {
          const reviewsData = reviewsResponse.data.data.content || reviewsResponse.data.data || [];
          setReviews(reviewsData);
        }

        if (ratingResponse.data.success) {
          setAverageRating(ratingResponse.data.data || 0);
        }

        if (countResponse.data.success) {
          setReviewCount(countResponse.data.data || 0);
        }

        if (distributionResponse.data.success) {
          setRatingDistribution(distributionResponse.data.data || {});
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        // Set defaults if reviews fail
      setReviews([]);
        setAverageRating(0);
        setReviewCount(0);
        setRatingDistribution({});
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productData) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    // Unverified users cannot add to cart (same as guests)
    if (!isVerified()) {
      alert('Vui lòng xác thực email để thêm sản phẩm vào giỏ hàng. Kiểm tra email của bạn để xác thực tài khoản.');
      return;
    }

    try {
      const quantity = productData.quantity || 1;
      await cartApi.addToCart(productData.id, quantity);
      // Show toast banner instead of alert
      setToastMessage('Đã thêm sản phẩm vào giỏ hàng!');
      setShowToast(true);
      // Trigger cart count refresh in header by dispatching custom event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setToastMessage(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      setShowToast(true);
    }
  };

  const handleBuyNow = async (productData) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    // Unverified users cannot buy now (same as guests)
    if (!isVerified()) {
      alert('Vui lòng xác thực email để mua hàng. Kiểm tra email của bạn để xác thực tài khoản.');
      return;
    }

    try {
      const quantity = productData.quantity || 1;
      const selectedVariant = productData.selectedVariant || 'Default';
      
      // Format product data directly for checkout (without adding to cart)
      const checkoutData = {
        cartItems: [{
          shopId: product.sellerId || 0,
          shopName: product.sellerName || product.storeName || 'Shop',
          products: [{
            id: `temp-${product.id}`, // Temporary ID for buy now (not a cart item)
            productId: product.id,
            name: product.name || 'Product',
            image: product.images?.[0] || 'https://via.placeholder.com/100',
            variant: selectedVariant,
            price: parseFloat(product.price || 0),
            originalPrice: parseFloat(product.originalPrice || product.price || 0),
            quantity: quantity,
            stock: product.stock || 0,
            freeShip: false
          }]
        }],
        subtotal: parseFloat(product.price || 0) * quantity,
        shipping: 0, // Will be calculated on checkout page
        discount: 0,
        total: parseFloat(product.price || 0) * quantity,
        isBuyNow: true // Flag to indicate this is a buy-now order (not from cart)
      };
      
      // Navigate directly to checkout without adding to cart
      navigate('/checkout', { state: checkoutData });
    } catch (error) {
      console.error('Failed to buy now:', error);
      alert(error.response?.data?.message || 'Không thể thực hiện mua ngay');
    }
  };

  const handleToggleWishlist = (productData) => {
    setIsWishlisted(!isWishlisted);
    console.log('Toggled wishlist:', productData);
    // TODO: Implement wishlist logic
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shopee-orange mx-auto mb-4"></div>
          <div className="text-gray-600">Đang tải sản phẩm...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">Không tìm thấy sản phẩm</div>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Banner */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          duration={1000}
        />
      )}
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={handleBack} className="hover:text-shopee-orange">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span>/</span>
            <span>Điện thoại</span>
            <span>/</span>
            <span>iPhone</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Gallery */}
          <ProductGallery images={product.images} />

          {/* Product Info */}
          <ProductInfo
            product={product}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={isWishlisted}
          />
        </div>

        {/* Shop Info - Full width */}
        <div className="bg-white rounded-lg shopee-shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-shopee-orange to-red-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {product.shop?.charAt(0) || 'S'}
                </span>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">{product.shop}</div>
                <div className="text-sm text-gray-600 mt-1">Online 2 giờ trước</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-shopee-orange text-shopee-orange hover:bg-shopee-orange hover:text-white"
              onClick={() => {
                if (product.sellerId) {
                  navigate(`/shop/${product.sellerId}`);
                } else {
                  alert('Không tìm thấy thông tin shop');
                }
              }}
            >
              Xem shop
            </Button>
          </div>
        </div>

        {/* Product Description & Specifications - Full width */}
        <div className="bg-white rounded-lg shopee-shadow p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.description}
                </div>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
                <div className="space-y-3">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-700">{spec.name}:</span>
                      <span className="text-gray-900 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Reviews */}
        <div className="bg-white rounded-lg shopee-shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá sản phẩm</h2>
          <ProductReviews
            productId={product.id}
            reviews={reviews}
            rating={averageRating || product.rating || 0}
            reviewCount={reviewCount || reviews.length}
            ratingDistribution={ratingDistribution}
            onReviewCreated={fetchProduct}
          />
        </div>

        {/* Related Products */}
        <div className="bg-white rounded-lg shopee-shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
          <ProductGrid
            products={relatedProducts}
            columns={4}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistItems={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
