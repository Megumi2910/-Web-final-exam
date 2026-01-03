import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cartApi } from '../../services/cartApi';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  MapPin, 
  Phone, 
  ChevronDown,
  Clock,
  TrendingUp,
  Gift,
  Star,
  Settings,
  Store
} from 'lucide-react';

const Button = ({ children, variant = "default", className = "", onClick, type }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-orange-600 text-white hover:bg-orange-700",
    ghost: "hover:bg-gray-100 hover:text-gray-900"
  };
  
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ className = "", value, onChange, onFocus, onBlur, onKeyPress, placeholder, type }) => {
  return (
    <input 
      type={type}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
};

const Header = () => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated, hasRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch cart count when user is authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCartCount();
      // Refresh cart count every 30 seconds
      const interval = setInterval(fetchCartCount, 30000);
      
      // Listen for cart update events to refresh immediately
      const handleCartUpdate = () => {
        fetchCartCount();
      };
      window.addEventListener('cartUpdated', handleCartUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('cartUpdated', handleCartUpdate);
      };
    } else {
      setCartItemCount(0);
    }
  }, [isAuthenticated]);

  const fetchCartCount = async () => {
    try {
      const response = await cartApi.getCartItemCount();
      if (response.data.success) {
        setCartItemCount(response.data.data || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartItemCount(0);
    }
  };

  const categories = [
    { id: 1, name: 'Thời trang', icon: '👕', subcategories: ['Áo thun', 'Quần jean', 'Váy', 'Giày dép'] },
    { id: 2, name: 'Điện tử', icon: '📱', subcategories: ['Điện thoại', 'Laptop', 'Tai nghe', 'Sạc dự phòng'] },
    { id: 3, name: 'Gia dụng', icon: '🏠', subcategories: ['Nội thất', 'Đồ bếp', 'Dọn dẹp', 'Trang trí'] },
    { id: 4, name: 'Thể thao', icon: '⚽', subcategories: ['Thể hình', 'Chạy bộ', 'Bóng đá', 'Yoga'] },
    { id: 5, name: 'Làm đẹp', icon: '💄', subcategories: ['Mỹ phẩm', 'Chăm sóc da', 'Nước hoa', 'Trang điểm'] },
    { id: 6, name: 'Sách', icon: '📚', subcategories: ['Tiểu thuyết', 'Kỹ năng', 'Thiếu nhi', 'Tạp chí'] }
  ];

  const searchSuggestions = [
    'iPhone 15 Pro Max',
    'Laptop Dell XPS',
    'Áo thun nam',
    'Giày Nike Air Max',
    'Túi xách nữ',
    'Sách kỹ năng sống'
  ];

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchSuggestions(false);
    }
  };

  const handleSearchWithQuery = (query) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowSearchSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-orange-600 text-white sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-orange-700 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Giao hàng tới</span>
                <span className="font-medium">Hồ Chí Minh</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Hotline: 1900 1234</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button className="hover:text-gray-200 transition-colors">Tải ứng dụng</button>
              <button className="hover:text-gray-200 transition-colors">Kết nối</button>
              <Link to="/orders" className="hover:text-gray-200 transition-colors">Theo dõi đơn hàng</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header - ĐÃ TỐI ƯU */}
      <div className="bg-white text-gray-900 py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2">
            {/* Logo - Thu gọn hơn */}
            <Link to="/" className="bg-gradient-to-r from-orange-600 to-pink-500 text-white px-3 py-1.5 rounded-lg font-bold text-base hover:opacity-90 transition-opacity flex-shrink-0">
              CNVLTW
            </Link>

            {/* Categories Menu - Thu gọn */}
            <div className="hidden lg:block relative flex-shrink-0" ref={categoriesRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                <Menu className="w-4 h-4" />
                <span className="font-medium">Danh mục</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {categories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center space-x-2 font-medium text-gray-900">
                            <span className="text-lg">{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                          <div className="space-y-1">
                            {category.subcategories.map((sub, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  console.log('Category clicked:', sub);
                                  setIsCategoriesOpen(false);
                                }}
                                className="block w-full text-left text-sm text-gray-600 hover:text-orange-600 transition-colors"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search bar - Chiếm phần còn lại */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                    className="rounded-r-none border-r-0 flex-1 text-sm h-9"
                  />
                  <Button
                    type="button"
                    onClick={handleSearch}
                    className="rounded-l-none px-3 h-9"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {showSearchSuggestions && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 mb-2 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Tìm kiếm gần đây
                      </div>
                      {searchSuggestions
                        .filter(suggestion => 
                          suggestion.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearchWithQuery(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center"
                          >
                            <Search className="w-4 h-4 mr-2 text-gray-400" />
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right actions - Gọn gàng hơn */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {/* Promotions */}
              <button className="hidden lg:flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 px-1.5 py-1.5 rounded hover:bg-orange-50">
                <Gift className="w-4 h-4" />
                <span>Khuyến mãi</span>
              </button>

              {/* Trending */}
              <button className="hidden xl:flex items-center gap-1 text-xs text-gray-600 hover:text-orange-600 px-1.5 py-1.5 rounded hover:bg-gray-50">
                <TrendingUp className="w-4 h-4" />
                <span>Xu hướng</span>
              </button>

              {/* Hot deals */}
              <button className="hidden xl:flex items-center gap-1 text-xs text-red-600 hover:text-red-700 px-1.5 py-1.5 rounded hover:bg-red-50">
                <Star className="w-4 h-4" />
                <span>Hot deals</span>
              </button>

              {/* Cart */}
              {isAuthenticated() && (
                <Link to="/cart" className="relative p-2 h-9 w-9 hover:bg-gray-100 rounded-lg transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Login Link - Show when NOT logged in */}
              {!isAuthenticated() && (
                <Link to="/login" className="flex items-center gap-1 px-3 h-9 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Đăng nhập</span>
                </Link>
              )}

              {/* User Menu Dropdown - Show when logged in */}
              {isAuthenticated() && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1 px-3 h-9 text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : 'Tài khoản'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/customer/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Tài khoản của tôi</span>
                      </Link>
                      <Link
                        to="/customer/settings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Cài đặt</span>
                      </Link>
                      {hasRole('ADMIN') && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Admin</span>
                        </Link>
                      )}
                      {hasRole('SELLER') && (
                        <Link
                          to="/seller"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Store className="w-4 h-4" />
                          <span className="text-sm">Seller</span>
                        </Link>
                      )}
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                          navigate('/');
                        }}
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile menu */}
              <button
                className="lg:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Danh mục sản phẩm</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className="flex items-center space-x-2 p-2 text-left hover:bg-gray-100 rounded-lg"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Tài khoản</h3>
              <div className="space-y-2">
                {isAuthenticated() ? (
                  <>
                    <Link to="/customer/profile" className="flex items-center space-x-2 py-2 text-white bg-orange-600 hover:bg-orange-700 px-3 rounded-lg w-full text-left font-medium">
                      <User className="w-4 h-4" />
                      <span>Tài khoản của tôi</span>
                    </Link>
                    <Link to="/orders" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                    <Link to="/customer/settings" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                      <Settings className="w-4 h-4" />
                      <span>Cài đặt</span>
                    </Link>
                    <Link to="/cart" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Giỏ hàng</span>
                    </Link>
                    {hasRole('ADMIN') && (
                      <Link to="/admin" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    {hasRole('SELLER') && (
                      <Link to="/seller" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600 w-full text-left">
                        <Store className="w-4 h-4" />
                        <span>Seller</span>
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        setIsMenuOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="flex items-center space-x-2 py-2 text-red-600 hover:bg-red-50 w-full text-left px-3 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                      <User className="w-4 h-4" />
                      <span>Đăng nhập</span>
                    </Link>
                    <Link to="/register" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                      <User className="w-4 h-4" />
                      <span>Đăng ký</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Trang</h3>
              <div className="space-y-2">
                <Link to="/categories" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                  <Menu className="w-4 h-4" />
                  <span>Danh mục</span>
                </Link>
                <Link to="/flash-sale" className="flex items-center space-x-2 py-2 text-red-600 hover:text-red-700 w-full text-left">
                  <Star className="w-4 h-4" />
                  <span>🔥 Flash Sale</span>
                </Link>
                <Link to="/search" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                  <Search className="w-4 h-4" />
                  <span>Tìm kiếm</span>
                </Link>
                <Link to="/about" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                  <User className="w-4 h-4" />
                  <span>Về chúng tôi</span>
                </Link>
                <Link to="/help" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                  <span className="w-4 h-4 flex items-center justify-center">❓</span>
                  <span>Trợ giúp</span>
                </Link>
                <Link to="/contact" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                  <Phone className="w-4 h-4" />
                  <span>Liên hệ</span>
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Khác</h3>
              <div className="space-y-2">
                <button className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                  <Gift className="w-4 h-4" />
                  <span>Khuyến mãi</span>
                </button>
                <button className="flex items-center space-x-2 py-2 text-gray-700 hover:text-orange-600 w-full text-left">
                  <TrendingUp className="w-4 h-4" />
                  <span>Xu hướng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-pink-500 text-white py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span className="font-medium">🎉 Siêu Sale 11.11 - Giảm giá lên đến 70%</span>
            </div>
            <span className="hidden sm:inline text-white/80">•</span>
            <span className="hidden sm:inline">Miễn phí vận chuyển đơn từ 99k</span>
            <span className="hidden md:inline text-white/80">•</span>
            <span className="hidden md:inline">Tặng kèm quà tặng hấp dẫn</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="hidden md:flex items-center justify-center space-x-8 py-3">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
              Trang chủ
            </Link>
            <Link to="/categories" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
              Danh mục
            </Link>
            <Link to="/flash-sale" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
              🔥 Flash Sale
            </Link>
            <Link to="/search" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
              Tìm kiếm
            </Link>
            <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
              Về chúng tôi
            </Link>
            <Link to="/help" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
              Trợ giúp
            </Link>
            <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
              Liên hệ
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;