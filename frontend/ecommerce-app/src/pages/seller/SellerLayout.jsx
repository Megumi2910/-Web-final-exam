import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Bell,
  Search,
  Store,
  TrendingUp,
  Users,
  User,
  ChevronDown
} from 'lucide-react';
import VerificationBanner from '../../components/VerificationBanner';

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isAuthenticated, isVerified } = useAuth();
  
  // Show verification banner if user is authenticated but not verified (non-closable)
  const shouldShowBanner = isAuthenticated() && !isVerified();

  const navigation = [
    { name: 'Dashboard', href: '/seller', icon: LayoutDashboard },
    { name: 'Sản phẩm', href: '/seller/products', icon: Package },
    { name: 'Đơn hàng', href: '/seller/orders', icon: ShoppingCart },
    { name: 'Thống kê', href: '/seller/analytics', icon: BarChart3 },
    { name: 'Cửa hàng', href: '/seller/store', icon: Store },
    { name: 'Cài đặt', href: '/seller/settings', icon: Settings },
  ];

  const isActive = (href) => {
    if (href === '/seller') {
      return location.pathname === '/seller';
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
              className="bg-gradient-to-r from-blue-600 to-purple-500 text-white px-3 py-1.5 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
            >
              CNVLTW
            </Link>
            <span className="ml-2 text-sm text-gray-500">Seller</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Info */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {user?.storeName || 'Cửa hàng của tôi'}
              </h3>
              <p className="text-xs text-gray-500">
                {user?.isSellerApproved ? 'Đã xác thực' : 'Chờ duyệt'}
              </p>
            </div>
          </div>
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
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-4 h-5 w-5 flex-shrink-0 ${
                    isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
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
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/customer/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Hồ sơ của tôi
                        </Link>
                        <Link
                          to="/seller/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Cài đặt
                        </Link>
                      </div>
                      <div className="border-t border-gray-200 py-2">
                        <button
                          onClick={async () => {
                            setShowProfileMenu(false);
                            await logout();
                            navigate('/');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
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

export default SellerLayout;
