import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign,
  Star,
  ArrowUpRight,
  ArrowDownRight
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

const RecentActivity = ({ orders }) => {
  const activities = orders.map(order => ({
    id: order.id,
    type: 'order',
    message: `Đơn hàng mới #${order.id}`,
    time: new Date(order.createdAt).toLocaleString('vi-VN'),
    status: order.orderStatus === 'DELIVERED' ? 'success' : order.orderStatus === 'CANCELLED' ? 'warning' : 'info'
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.type === 'order' ? 'Đơn hàng' : 
                     activity.type === 'product' ? 'Sản phẩm' : 'Người dùng'}
                  </div>
                  <p className="ml-3 text-sm text-gray-900">{activity.message}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            Chưa có hoạt động gần đây
          </div>
        )}
      </div>
    </div>
  );
};

const TopProducts = ({ products }) => {

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Sản phẩm bán chạy</h3>
      </div>
      <div className="divide-y divide-gray-200">
      {products && products.length > 0 ? (
        products.map((product, index) => (
          <div key={product.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  {product.rating && (
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-500">{product.rating}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{product.price?.toLocaleString()}đ</p>
                <p className="text-xs text-gray-500">Tồn kho: {product.stock || 0}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="px-6 py-4 text-center text-gray-500">
          Chưa có dữ liệu sản phẩm
        </div>
      )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch orders to calculate stats
      const ordersResponse = await adminApi.getAllOrders(0, 100);
      const orders = ordersResponse.data.success ? (ordersResponse.data.data || []) : [];
      
      // Fetch products
      const productsResponse = await adminApi.getAllProducts(0, 100);
      const products = productsResponse.data.success ? (productsResponse.data.data || []) : [];

      // Calculate stats from data
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const uniqueCustomers = new Set(orders.map(o => o.customerId)).size;
      const totalProducts = products.length;

      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
        totalProducts
      });

      // Set recent orders (first 5)
      setRecentOrders(orders.slice(0, 5));

      // Set top products (first 5)
      setTopProducts(products.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan về hoạt động của cửa hàng</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng doanh thu"
            value={`${stats.totalRevenue.toLocaleString()}đ`}
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
            title="Khách hàng"
            value={stats.totalCustomers.toString()}
            change=""
            changeType="up"
            icon={Users}
            color="orange"
          />
          <StatCard
            title="Sản phẩm"
            value={stats.totalProducts.toString()}
            change=""
            changeType="up"
            icon={Package}
            color="purple"
          />
        </div>
      )}

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Doanh thu theo tháng</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lượt xem trang</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Biểu đồ lượt xem sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Products */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity orders={recentOrders} />
          <TopProducts products={topProducts} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

