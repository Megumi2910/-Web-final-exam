import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Flame } from 'lucide-react';
import { ProductGrid } from '../components/product';
import Toast from '../components/ui/Toast';
import { cartApi } from '../services/cartApi';
import { useAuth } from '../context/AuthContext';

const FlashSalePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isVerified } = useAuth();
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 34,
    seconds: 56
  });
  const [wishlistItems, setWishlistItems] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchFlashSaleProducts();
  }, []);

  const fetchFlashSaleProducts = async () => {
    try {
      setLoading(true);
      // TODO: Implement flash sale products API call
      // const response = await productApi.getFlashSaleProducts();
      // if (response.data.success) {
      //   setFlashSaleProducts(response.data.data);
      // }
      setFlashSaleProducts([]); // Empty until API is implemented
    } catch (error) {
      console.error('Error fetching flash sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer when it reaches 0
          hours = 2;
          minutes = 0;
          seconds = 0;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/flash-sale' } });
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
    setWishlistItems(prev => 
      prev.includes(product.id) 
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
    );
  };

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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Flame className="w-12 h-12 mr-3 animate-pulse" />
            <h1 className="text-5xl font-bold">FLASH SALE</h1>
            <Flame className="w-12 h-12 ml-3 animate-pulse" />
          </div>
          <p className="text-center text-xl opacity-90">Giảm giá sốc - Số lượng có hạn!</p>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <Clock className="w-6 h-6 text-shopee-orange mr-2" />
              <span className="text-lg font-semibold text-gray-700">Kết thúc trong</span>
            </div>
            <div className="flex gap-3">
              <div className="bg-red-500 text-white rounded-lg p-4 min-w-[80px] text-center">
                <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-sm opacity-90">Giờ</div>
              </div>
              <div className="flex items-center text-2xl font-bold text-gray-600">:</div>
              <div className="bg-red-500 text-white rounded-lg p-4 min-w-[80px] text-center">
                <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-sm opacity-90">Phút</div>
              </div>
              <div className="flex items-center text-2xl font-bold text-gray-600">:</div>
              <div className="bg-red-500 text-white rounded-lg p-4 min-w-[80px] text-center">
                <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-sm opacity-90">Giây</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {flashSaleProducts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-red-500">{flashSaleProducts.length}</div>
                <div className="text-sm text-gray-600">Sản phẩm</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500">
                  {flashSaleProducts.reduce((acc, p) => acc + (p.sold || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Đã bán</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500">50%</div>
                <div className="text-sm text-gray-600">Giảm tối đa</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sản phẩm Flash Sale</h2>
          <p className="text-gray-600">Nhanh tay săn deal trước khi hết hàng!</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : flashSaleProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Hiện tại không có sản phẩm Flash Sale</p>
          </div>
        ) : (
          <ProductGrid
            products={flashSaleProducts}
            columns={5}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistItems={wishlistItems}
          />
        )}
      </div>

      {/* Notice */}
      <div className="bg-yellow-50 border-t border-yellow-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Lưu ý quan trọng:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Số lượng sản phẩm Flash Sale có hạn, hết hàng sẽ kết thúc sớm</li>
                <li>• Mỗi khách hàng chỉ được mua tối đa 2 sản phẩm/1 loại</li>
                <li>• Không áp dụng đồng thời với các chương trình khuyến mãi khác</li>
                <li>• Sản phẩm Flash Sale không hỗ trợ đổi trả</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSalePage;

