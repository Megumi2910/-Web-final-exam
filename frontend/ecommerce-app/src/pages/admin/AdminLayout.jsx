import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Bell,
  Search,
  Folder,
  User,
  ChevronDown,
  Store
} from 'lucide-react';
import VerificationBanner from '../../components/VerificationBanner';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isAuthenticated, isVerified, hasRole } = useAuth();
  const profileMenuRef = useRef(null);
  const shopMenuRef = useRef(null);
  
  // Show verification banner if user is authenticated but not verified (non-closable)
  const shouldShowBanner = isAuthenticated() && !isVerified();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target)) {
        setIsShopMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Danh mục', href: '/admin/categories', icon: Folder },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Người dùng', href: '/admin/users', icon: Users },
    { name: 'Thống kê', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Verification Banner */}
      {shouldShowBanner && <VerificationBanner user={user} />}
      
      <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col h-full ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="bg-gradient-to-r from-orange-600 to-pink-500 text-white px-3 py-1.5 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
            >
              CNVLTW
            </Link>
            <span className="ml-2 text-sm text-gray-500">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-4 h-5 w-5 flex-shrink-0 ${
                    isActive(item.href) ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button 
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <LogOut className="mr-4 h-5 w-5 text-gray-400 flex-shrink-0" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
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

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                      to={location.pathname === '/admin/profile' ? '/admin' : '/admin/profile'}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                      <User className="w-4 h-4" />
                      <span className="text-sm">
                        {location.pathname === '/admin/profile' ? 'Admin Dashboard' : 'Tài khoản của tôi'}
                      </span>
                        </Link>
                        <Link
                          to="/admin/settings"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Cài đặt</span>
                    </Link>
                    {(hasRole('SELLER') || hasRole('ADMIN')) && (
                      <div className="relative" ref={shopMenuRef}>
                        <button
                          onClick={() => setIsShopMenuOpen(!isShopMenuOpen)}
                          className="flex items-center justify-between gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors w-full text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Store className="w-4 h-4" />
                            <span className="text-sm">Cửa hàng</span>
                          </div>
                          <ChevronDown className={`w-3 h-3 transition-transform ${isShopMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isShopMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[60]">
                            {user?.storeName ? (
                              <Link
                                to="/seller"
                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-sm"
                                onClick={() => {
                                  setIsShopMenuOpen(false);
                                  setShowProfileMenu(false);
                                }}
                              >
                                <Store className="w-4 h-4" />
                                <span>{user.storeName}</span>
                              </Link>
                            ) : (
                              <Link
                                to="/seller"
                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-sm"
                                onClick={() => {
                                  setIsShopMenuOpen(false);
                                  setShowProfileMenu(false);
                                }}
                              >
                                <Store className="w-4 h-4" />
                                <span>Quản lý cửa hàng</span>
                              </Link>
                            )}
                            {hasRole('ADMIN') && (
                              <>
                                <div className="border-t border-gray-200 my-1"></div>
                                <Link
                                  to="/admin/products"
                                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-sm"
                                  onClick={() => {
                                    setIsShopMenuOpen(false);
                                    setShowProfileMenu(false);
                                  }}
                                >
                                  <Store className="w-4 h-4" />
                                  <span>Tất cả cửa hàng</span>
                        </Link>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="border-t border-gray-200 my-2"></div>
                        <button
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                          onClick={async () => {
                            setShowProfileMenu(false);
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
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      </div>
    </div>
  );
};

export default AdminLayout;
