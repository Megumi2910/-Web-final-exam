import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  User,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Wallet
} from 'lucide-react';
import { clsx } from 'clsx';
import { orderApi } from '../../services/orderApi';
import VerificationBanner from '../../components/VerificationBanner';

const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isAuthenticated, isVerified } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchOrderCount();
    }
  }, [isAuthenticated]);

  const fetchOrderCount = async () => {
    try {
      const response = await orderApi.getOrderStatistics();
      if (response.data.success) {
        const stats = response.data.data;
        // Count pending orders for the badge
        const pendingCount = stats.pendingCount || 0;
        setOrderCount(pendingCount);
      }
    } catch (error) {
      console.error('Error fetching order count:', error);
      setOrderCount(0);
    }
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Tổng quan',
      path: '/customer/dashboard',
      badge: null
    },
    {
      icon: ShoppingBag,
      label: 'Đơn hàng',
      path: '/customer/orders',
      badge: orderCount > 0 ? orderCount : null
    },
    {
      icon: Heart,
      label: 'Yêu thích',
      path: '/customer/wishlist',
      badge: null
    },
    {
      icon: Wallet,
      label: 'Ví của tôi',
      path: '/customer/wallet',
      badge: null
    },
    {
      icon: User,
      label: 'Tài khoản của tôi',
      path: '/customer/profile',
      badge: null
    }
  ];

  // Show verification banner if user is authenticated but not verified (non-closable)
  const shouldShowBanner = isAuthenticated() && !isVerified();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Verification Banner */}
      {shouldShowBanner && <VerificationBanner user={user} />}
      
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="bg-gradient-to-r from-orange-600 to-pink-500 text-white px-3 py-1.5 rounded-lg font-bold text-base hover:opacity-90 transition-opacity">
                CNVLTW
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 font-medium">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : 'Tài khoản của tôi'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-shopee-orange hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-shopee-orange to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shopee-shadow-lg z-50">
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
                        >
                          <User className="w-4 h-4 mr-3" />
                          Hồ sơ của tôi
                        </Link>
                        <Link
                          to="/customer/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shopee-shadow overflow-hidden sticky top-24">
              <div className="p-4 bg-gradient-to-r from-shopee-orange to-orange-600">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-shopee-orange text-lg font-bold">
                    {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-white">
                    <div className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-orange-100">
                      {user?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </div>
                  </div>
                </div>
              </div>

              <nav className="py-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={clsx(
                        'flex items-center justify-between px-4 py-3 text-sm transition-colors',
                        isActive
                          ? 'bg-orange-50 text-shopee-orange border-r-4 border-shopee-orange font-medium'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-shopee-orange'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Page Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;

