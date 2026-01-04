import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, Star, Package, Users, Award, ArrowLeft } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import Toast from '../components/ui/Toast';
import { ProductGrid } from '../components/product';
import { productApi } from '../services/productApi';
import { userApi } from '../services/userApi';
import { cartApi } from '../services/cartApi';
import { useAuth } from '../context/AuthContext';

const ShopPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isVerified } = useAuth();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (sellerId) {
      fetchShopData();
    }
  }, [sellerId, page]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch seller information
      try {
        const sellerResponse = await userApi.getShopInfo(sellerId);
        if (sellerResponse.data.success) {
          const sellerData = sellerResponse.data.data;
          // Convert UserInfo to seller object format
          setSeller({
            userId: sellerData.userId,
            firstName: sellerData.firstName,
            lastName: sellerData.lastName,
            email: sellerData.email,
            phoneNumber: sellerData.phoneNumber,
            address: sellerData.address,
            role: sellerData.role,
            storeName: sellerData.storeName,
            storeDescription: sellerData.storeDescription
          });
        }
      } catch (err) {
        console.error('Error fetching seller:', err);
        // Continue even if seller info fails
      }

      // Fetch seller's products
      const productsResponse = await productApi.getSellerProducts(sellerId, page, 20);
      if (productsResponse.data.success) {
        const pageData = productsResponse.data;
        // PageResponse returns data as an array directly, not wrapped in content
        const productsList = Array.isArray(pageData.data) ? pageData.data : (pageData.data?.content || pageData.data?.data || []);
        
        const mappedProducts = productsList.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price ? parseFloat(product.price) : 0,
          originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
          discount: product.originalPrice && product.price 
            ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
            : 0,
          rating: product.averageRating || 0,
          reviewCount: product.reviewCount || 0,
          image: product.images && product.images.length > 0 
            ? product.images[0] 
            : product.imageUrl || 'https://via.placeholder.com/300',
          shop: product.sellerName || seller?.firstName + ' ' + seller?.lastName || 'Shop',
          slug: product.slug
        }));

        setProducts(mappedProducts);
        setTotalPages(pageData.totalPages || 1);
        setTotalProducts(pageData.totalElements || productsList.length);
        
        console.log('ShopPage - Products fetched:', {
          productsListLength: productsList.length,
          mappedProductsLength: mappedProducts.length,
          totalElements: pageData.totalElements,
          pageData: pageData
        });
      } else {
        setError('Không thể tải sản phẩm của shop');
      }
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/shop/${sellerId}` } });
      return;
    }

    if (!isVerified()) {
      alert('Vui lòng xác thực email để thêm sản phẩm vào giỏ hàng. Kiểm tra email của bạn để xác thực tài khoản.');
      return;
    }

    try {
      await cartApi.addToCart(product.id, 1);
      setToastMessage('Đã thêm sản phẩm vào giỏ hàng!');
      setShowToast(true);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setToastMessage(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      setShowToast(true);
    }
  };

  const handleToggleWishlist = (product) => {
    console.log('Toggle wishlist:', product);
    // TODO: Implement wishlist logic
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </Button>
          <Card>
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error || 'Không tìm thấy shop'}</p>
              <Button onClick={() => navigate('/')}>Về trang chủ</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const sellerName = seller.storeName || `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.email || 'Shop';
  const sellerInitial = sellerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Banner */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          duration={2000}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shop Header */}
        <Card className="mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-shopee-orange to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-white">
                {sellerInitial}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{sellerName}</h1>
                {seller.role === 'ADMIN' && (
                  <Badge variant="primary">Admin</Badge>
                )}
                {seller.role === 'SELLER' && (
                  <Badge variant="success">Seller</Badge>
                )}
              </div>
              {seller.storeDescription && (
                <p className="text-gray-600 mb-4">{seller.storeDescription}</p>
              )}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>{totalProducts} sản phẩm</span>
                </div>
                {seller.email && (
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4" />
                    <span>{seller.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sản phẩm của shop</h2>
            <div className="text-sm text-gray-600">
              {totalProducts} sản phẩm
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <ProductGrid
                products={products}
                columns={4}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlistItems={[]}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    disabled={page === 0}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-gray-600">
                    Trang {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Shop chưa có sản phẩm nào
                </h3>
                <p className="text-gray-600">
                  Shop này chưa đăng bán sản phẩm nào
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;

