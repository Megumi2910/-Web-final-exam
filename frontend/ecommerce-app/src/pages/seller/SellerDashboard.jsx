import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Store,
  Clock,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { sellerApi } from '../../services/sellerApi';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, change, changeType, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    orange: "bg-orange-500",
    purple: "bg-purple-500"
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {changeType === 'up' ? (
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const RecentOrders = ({ orders = [] }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PROCESSING': return 'Đang xử lý';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status || 'N/A';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{Number(order.total).toLocaleString('vi-VN')}₫</p>
                    <p className="text-xs text-gray-500">{order.timeAgo}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            <p>Chưa có đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TopProducts = ({ products = [] }) => {

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Sản phẩm bán chạy</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={product.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-500">{product.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{product.sales || 0} bán</p>
                  <p className="text-xs text-gray-500">{Number(product.price).toLocaleString('vi-VN')}₫</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            <p>Chưa có sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StorePerformance = ({ averageRating = 0, completionRate = 0 }) => {
  const metrics = [
    { label: 'Tỷ lệ hoàn thành', value: `${completionRate.toFixed(1)}%`, change: '', changeType: 'up' },
    { label: 'Đánh giá trung bình', value: averageRating.toFixed(1), change: '', changeType: 'up' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất cửa hàng</h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500">{metric.label}</p>
            {metric.change && (
              <div className="flex items-center justify-center mt-1">
                {metric.changeType === 'up' ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${metric.changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageRating: 0,
    monthlyRevenue: 0,
    completionRate: 0,
    recentOrders: [],
    topProducts: []
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await sellerApi.getStatistics();
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalCustomers: data.totalCustomers || 0,
          averageRating: data.averageRating || 0,
          monthlyRevenue: data.monthlyRevenue || 0,
          completionRate: data.completionRate || 0,
          recentOrders: data.recentOrders || [],
          topProducts: data.topProducts || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch seller statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan về hoạt động cửa hàng của bạn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Doanh thu tháng này"
          value={`${Number(stats.monthlyRevenue).toLocaleString('vi-VN')}₫`}
          change=""
          changeType="up"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Đơn hàng"
          value={stats.totalOrders.toString()}
          change=""
          changeType="up"
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Sản phẩm"
          value={stats.totalProducts.toString()}
          change=""
          changeType="up"
          icon={Package}
          color="orange"
        />
        <StatCard
          title="Đánh giá trung bình"
          value={stats.averageRating.toFixed(1)}
          change=""
          changeType="up"
          icon={Star}
          color="purple"
        />
      </div>

      {/* Charts and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Doanh thu theo ngày</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
          </div>
        </div>

        <StorePerformance 
          averageRating={stats.averageRating}
          completionRate={stats.completionRate}
        />
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={stats.recentOrders} />
        <TopProducts products={stats.topProducts} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="w-8 h-8 text-blue-500 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Thêm sản phẩm</p>
              <p className="text-sm text-gray-500">Tạo sản phẩm mới</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingCart className="w-8 h-8 text-green-500 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Xem đơn hàng</p>
              <p className="text-sm text-gray-500">Quản lý đơn hàng</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-8 h-8 text-purple-500 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Xem thống kê</p>
              <p className="text-sm text-gray-500">Phân tích hiệu suất</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
