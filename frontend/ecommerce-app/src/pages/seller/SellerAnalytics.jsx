import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Eye,
  Star,
  Calendar,
  Users,
  Clock,
  Target,
  Award,
  Activity
} from 'lucide-react';

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

const SellerAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    revenue: { value: '0', change: '0%', changeType: 'up' },
    orders: { value: '0', change: '0%', changeType: 'up' },
    newCustomers: { value: '0', change: '0%', changeType: 'up' },
    conversionRate: { value: '0%', change: '0%', changeType: 'up' },
    topProducts: [],
    customerInsights: [],
    performanceMetrics: [],
    orderStatuses: [],
    searchTrends: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // TODO: Implement analytics API call
      // const response = await sellerApi.getAnalytics(timeRange);
      // if (response.data.success) {
      //   setAnalytics(response.data.data);
      // }
      // For now, set empty data
      setAnalytics({
        revenue: { value: '0', change: '0%', changeType: 'up' },
        orders: { value: '0', change: '0%', changeType: 'up' },
        newCustomers: { value: '0', change: '0%', changeType: 'up' },
        conversionRate: { value: '0%', change: '0%', changeType: 'up' },
        topProducts: [],
        customerInsights: [],
        performanceMetrics: [],
        orderStatuses: [],
        searchTrends: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê & Phân tích</h1>
          <p className="text-gray-600">Phân tích hiệu suất và xu hướng bán hàng</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
            <option value="1year">1 năm qua</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Doanh thu tháng này"
            value={analytics.revenue.value}
            change={analytics.revenue.change}
            changeType={analytics.revenue.changeType}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Đơn hàng"
            value={analytics.orders.value}
            change={analytics.orders.change}
            changeType={analytics.orders.changeType}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Khách hàng mới"
            value={analytics.newCustomers.value}
            change={analytics.newCustomers.change}
            changeType={analytics.newCustomers.changeType}
            icon={Users}
            color="orange"
          />
          <StatCard
            title="Tỷ lệ chuyển đổi"
            value={analytics.conversionRate.value}
            change={analytics.conversionRate.change}
            changeType={analytics.conversionRate.changeType}
            icon={Target}
            color="purple"
          />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Doanh thu theo ngày">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Biểu đồ doanh thu theo ngày</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Đơn hàng theo trạng thái">
          <div className="space-y-3">
            {analytics.orderStatuses.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
            ) : (
              analytics.orderStatuses.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.status}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>

      {/* Top Products and Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Sản phẩm bán chạy">
          <div className="space-y-3">
            {analytics.topProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
            ) : (
              analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} bán</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{product.revenue}đ</p>
                  <p className="text-sm text-green-600">{product.growth}</p>
                </div>
              </div>
              ))
            )}
          </div>
        </ChartCard>

        <ChartCard title="Thông tin khách hàng">
          <div className="space-y-4">
            {analytics.customerInsights.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
            ) : (
              analytics.customerInsights.map((insight, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{insight.metric}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
                  <div className="flex items-center justify-end">
                    {insight.changeType === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${insight.changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {insight.change}
                    </span>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>

      {/* Performance Metrics */}
      <ChartCard title="Chỉ số hiệu suất">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.performanceMetrics.length === 0 ? (
            <p className="text-center text-gray-500 py-8 col-span-2">Chưa có dữ liệu</p>
          ) : (
            analytics.performanceMetrics.map((metric, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status === 'excellent' ? 'Xuất sắc' :
                   metric.status === 'good' ? 'Tốt' :
                   metric.status === 'warning' ? 'Cảnh báo' : 'Kém'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                <span className="text-sm text-gray-500">Mục tiêu: {metric.target}</span>
              </div>
            </div>
            ))
          )}
        </div>
      </ChartCard>

      {/* Trends and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Xu hướng tìm kiếm">
          <div className="space-y-3">
            {analytics.searchTrends.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
            ) : (
              analytics.searchTrends.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{item.keyword}</span>
                  {item.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-500 ml-2" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500 ml-2" />
                  )}
                </div>
                <span className="text-sm text-gray-500">{item.searches}</span>
              </div>
              ))
            )}
          </div>
        </ChartCard>

        <ChartCard title="Thời gian hoạt động">
          <div className="space-y-4">
            {analytics.performanceMetrics.length > 0 ? (
              <>
                {analytics.performanceMetrics.filter(m => m.label === 'Thời gian phản hồi').map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{metric.label}</p>
                        <p className="text-sm text-gray-500">Trong 24h qua</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{metric.value}</p>
                  </div>
                ))}
                {analytics.performanceMetrics.filter(m => m.label === 'Đánh giá trung bình').map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Award className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{metric.label}</p>
                        <p className="text-sm text-gray-500">Từ khách hàng</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{metric.value}</p>
                  </div>
                ))}
                {analytics.performanceMetrics.filter(m => m.label.includes('chuyển đổi')).map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-8 h-8 text-purple-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{metric.label}</p>
                        <p className="text-sm text-gray-500">Tháng này</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{metric.value}</p>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default SellerAnalytics;
