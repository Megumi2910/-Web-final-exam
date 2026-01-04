import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Star,
  Calendar
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, change, changeType, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    red: "bg-red-500"
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {changeType === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
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

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
};

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    newOrders: 0,
    newCustomers: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [dailyOrdersData, setDailyOrdersData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Fetch orders to calculate stats
      const ordersResponse = await adminApi.getAllOrders(0, 1000);
      const orders = ordersResponse.data.success ? (ordersResponse.data.data || []) : [];
      
      // Calculate monthly revenue (current month)
      const now = new Date();
      const currentMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      });
      const monthlyRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Get new orders count
      const newOrders = currentMonthOrders.length;

      // Get unique customers this month
      const newCustomers = new Set(currentMonthOrders.map(o => o.userId || o.customerId)).size;

      // Calculate conversion rate (simplified)
      const conversionRate = orders.length > 0 ? ((newOrders / orders.length) * 100).toFixed(1) : 0;

      setStats({
        monthlyRevenue,
        newOrders,
        newCustomers,
        conversionRate: parseFloat(conversionRate)
      });

      // Fetch top products
      const productsResponse = await adminApi.getAllProducts(0, 5);
      const products = productsResponse.data.success ? (productsResponse.data.data || []) : [];
      setTopProducts(products);

      // Calculate monthly revenue data (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('vi-VN', { month: 'short' });
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
        });
        const revenue = monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        monthlyData.push({
          month: monthName,
          revenue: revenue
        });
      }
      setMonthlyRevenueData(monthlyData);

      // Calculate daily orders (last 7 days)
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleString('vi-VN', { weekday: 'short' });
        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === date.toDateString();
        });
        dailyData.push({
          day: dayName,
          orders: dayOrders.length
        });
      }
      setDailyOrdersData(dailyData);

      // Calculate order status distribution
      const statusCounts = {};
      orders.forEach(order => {
        const status = order.orderStatus || 'PENDING';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const statusLabels = {
        'PENDING': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'SHIPPING': 'Đang giao',
        'DELIVERED': 'Đã giao',
        'CANCELLED': 'Đã hủy'
      };
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count
      }));
      setOrderStatusData(statusData);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thống kê & Phân tích</h1>
        <p className="text-gray-600">Phân tích dữ liệu và hiệu suất kinh doanh</p>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Doanh thu tháng này"
            value={`${stats.monthlyRevenue.toLocaleString()}đ`}
            change=""
            changeType="up"
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Đơn hàng mới"
            value={stats.newOrders.toString()}
            change=""
            changeType="up"
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Khách hàng mới"
            value={stats.newCustomers.toString()}
            change=""
            changeType="up"
            icon={Users}
            color="orange"
          />
          <StatCard
            title="Tỷ lệ chuyển đổi"
            value={`${stats.conversionRate}%`}
            change=""
            changeType="up"
            icon={TrendingUp}
            color="purple"
          />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Doanh thu theo tháng">
          {monthlyRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()}đ`, 'Doanh thu']}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chưa có dữ liệu</p>
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Đơn hàng theo ngày">
          {dailyOrdersData.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              <LineChart data={dailyOrdersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Đơn hàng"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chưa có dữ liệu</p>
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Sản phẩm bán chạy">
          <div className="space-y-3">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">Giá: {product.price?.toLocaleString()}đ</p>
                  </div>
                  <p className="font-medium text-gray-900">Tồn kho: {product.stock || 0}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu sản phẩm
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Phân tích khách hàng">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Khách hàng mới</p>
                  <p className="text-sm text-gray-500">Tháng này</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.newCustomers}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Tổng sản phẩm</p>
                  <p className="text-sm text-gray-500">Trong hệ thống</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{topProducts.length}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Tổng đơn hàng</p>
                  <p className="text-sm text-gray-500">Tất cả thời gian</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.newOrders}</p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Hiệu suất trang web">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ chuyển đổi</p>
                <p className="text-2xl font-bold text-blue-600">{stats.conversionRate}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-green-600">{stats.newOrders}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Khách hàng mới</p>
                <p className="text-2xl font-bold text-orange-600">{stats.newCustomers}</p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Phân bố đơn hàng">
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu
            </div>
          )}
        </ChartCard>

        <ChartCard title="Xu hướng tìm kiếm">
          <div className="space-y-3">
            {topProducts && topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 mr-2">#{index + 1}</span>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  </div>
                  <p className="text-sm text-gray-600">{product.price?.toLocaleString()}đ</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminAnalytics;
