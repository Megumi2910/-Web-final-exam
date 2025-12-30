import React from 'react';
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

const RecentOrders = () => {
  const orders = [
    { id: 'DH001', customer: 'Nguyễn Văn A', total: 15990000, status: 'pending', time: '2 phút trước' },
    { id: 'DH002', customer: 'Trần Thị B', total: 29990000, status: 'confirmed', time: '15 phút trước' },
    { id: 'DH003', customer: 'Lê Văn C', total: 8990000, status: 'shipping', time: '1 giờ trước' },
    { id: 'DH004', customer: 'Phạm Thị D', total: 22990000, status: 'delivered', time: '2 giờ trước' },
    { id: 'DH005', customer: 'Hoàng Văn E', total: 5990000, status: 'pending', time: '3 giờ trước' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                  <p className="text-sm text-gray-500">{order.customer}</p>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{order.total.toLocaleString()}đ</p>
                  <p className="text-xs text-gray-500">{order.time}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopProducts = () => {
  const products = [
    { id: 1, name: 'iPhone 15 Pro Max', sales: 45, revenue: '1,350,000', rating: 4.8 },
    { id: 2, name: 'Samsung Galaxy S24', sales: 32, revenue: '896,000', rating: 4.7 },
    { id: 3, name: 'MacBook Air M2', sales: 18, revenue: '414,000', rating: 4.9 },
    { id: 4, name: 'iPad Pro 12.9', sales: 15, revenue: '300,000', rating: 4.5 },
    { id: 5, name: 'AirPods Pro 2', sales: 28, revenue: '168,000', rating: 4.8 },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Sản phẩm bán chạy</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {products.map((product, index) => (
          <div key={product.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-xs text-gray-500">{product.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{product.sales} bán</p>
                <p className="text-xs text-gray-500">{product.revenue}đ</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StorePerformance = () => {
  const metrics = [
    { label: 'Tỷ lệ chuyển đổi', value: '3.2%', change: '+0.5%', changeType: 'up' },
    { label: 'Thời gian phản hồi', value: '2.5h', change: '-0.3h', changeType: 'up' },
    { label: 'Đánh giá trung bình', value: '4.7', change: '+0.1', changeType: 'up' },
    { label: 'Tỷ lệ hoàn trả', value: '2.1%', change: '-0.2%', changeType: 'up' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất cửa hàng</h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500">{metric.label}</p>
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
          </div>
        ))}
      </div>
    </div>
  );
};

const SellerDashboard = () => {
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
          value="45,230,000đ"
          change="+12.5%"
          changeType="up"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Đơn hàng"
          value="156"
          change="+8.2%"
          changeType="up"
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Sản phẩm"
          value="24"
          change="+3.1%"
          changeType="up"
          icon={Package}
          color="orange"
        />
        <StatCard
          title="Đánh giá trung bình"
          value="4.7"
          change="+0.2"
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

        <StorePerformance />
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <TopProducts />
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
