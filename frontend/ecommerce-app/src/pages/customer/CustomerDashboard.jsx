import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Wallet, 
  MapPin, 
  Heart, 
  Star,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  Settings,
  User,
  Gift,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../services/orderApi';
import { productApi } from '../../services/productApi';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance] = useState(500000); // TODO: Implement wallet API when available

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch order statistics
      const statsResponse = await orderApi.getOrderStatistics();
      if (statsResponse.data.success) {
        const stats = statsResponse.data.data;
        setOrderStats({
          pending: stats.pendingCount || 0,
          shipping: stats.shippingCount || 0,
          completed: stats.completedCount || 0,
          cancelled: stats.cancelledCount || 0,
          total: stats.totalCount || 0
        });
      }

      // Fetch recent orders
      const ordersResponse = await orderApi.getMyOrders(0, 5);
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.data.content || [];
        setRecentOrders(orders.map(order => ({
          id: order.id,
          date: order.createdAt,
          status: mapOrderStatus(order.orderStatus, order.deliveryStatus),
          items: order.orderItems?.map(item => ({
            name: item.productName,
            image: item.productImage || 'https://via.placeholder.com/100',
            quantity: item.quantity,
            price: item.price
          })) || [],
          total: order.totalAmount
        })));
      }

      // Fetch recently viewed products (using featured products as placeholder)
      // TODO: Implement recently viewed products API when available
      const productsResponse = await productApi.getFeaturedProducts(4);
      if (productsResponse.data.success) {
        setRecentlyViewed(productsResponse.data.data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || 'https://via.placeholder.com/200',
          rating: product.averageRating || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapOrderStatus = (orderStatus, deliveryStatus) => {
    if (orderStatus === 'CANCELLED') return 'cancelled';
    if (orderStatus === 'COMPLETED') return 'completed';
    if (deliveryStatus === 'SHIPPING' || deliveryStatus === 'IN_TRANSIT') return 'shipping';
    if (orderStatus === 'PENDING' || orderStatus === 'CONFIRMED') return 'pending';
    return 'pending';
  };


  // Mock addresses (TODO: Implement address API)
  const addresses = [
    {
      id: 1,
      name: 'Nhà riêng',
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Đường ABC, Phường XYZ',
      city: 'TP. Hồ Chí Minh',
      isDefault: true
    },
    {
      id: 2,
      name: 'Văn phòng',
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '456 Đường DEF, Quận 1',
      city: 'TP. Hồ Chí Minh',
      isDefault: false
    }
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'warning', text: 'Chờ xác nhận', icon: Clock },
      shipping: { variant: 'primary', text: 'Đang giao', icon: Truck },
      completed: { variant: 'success', text: 'Hoàn thành', icon: CheckCircle },
      cancelled: { variant: 'danger', text: 'Đã hủy', icon: null }
    };
    
    const config = statusMap[status];
    const StatusIcon = config.icon;
    
    return (
      <Badge variant={config.variant} size="sm" className="flex items-center gap-1">
        {StatusIcon && <StatusIcon className="w-3 h-3" />}
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.email?.split('@')[0] || 'Người dùng';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-shopee-orange to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userInitial}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Xin chào, {userName}!
                </h1>
                <p className="text-gray-600">
                  Chào mừng bạn quay trở lại
                </p>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Cài đặt
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <Card hover className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
                <Badge variant="secondary" size="sm">
                  +{orderStats.pending} mới
                </Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {orderStats.total}
              </div>
              <div className="text-sm text-gray-600">Tổng đơn hàng</div>
            </div>
          </Card>

          {/* Wallet */}
          <Card hover className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(walletBalance)}
              </div>
              <div className="text-sm text-gray-600">Ví của tôi</div>
            </div>
          </Card>

          {/* Points */}
          <Card hover className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -mr-12 -mt-12" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {(user.loyaltyPoints || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Điểm tích lũy</div>
            </div>
          </Card>

          {/* Vouchers */}
          <Card hover className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-shopee-orange/10 rounded-full -mr-12 -mt-12" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-shopee-orange/10 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-shopee-orange" />
                </div>
                <Badge variant="primary" size="sm">
                  0 mã
                </Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                0
              </div>
              <div className="text-sm text-gray-600">Voucher khả dụng</div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <Card.Header>
            <Card.Title>Truy cập nhanh</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
                  <Clock className="w-6 h-6 text-shopee-orange" />
                </div>
                <span className="text-sm font-medium text-gray-700">Chờ xác nhận</span>
                {orderStats.pending > 0 && (
                  <Badge variant="danger" size="sm" className="mt-1">
                    {orderStats.pending}
                  </Badge>
                )}
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                  <Truck className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">Đang giao</span>
                {orderStats.shipping > 0 && (
                  <Badge variant="primary" size="sm" className="mt-1">
                    {orderStats.shipping}
                  </Badge>
                )}
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-500/20 transition-colors">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">Hoàn thành</span>
                <span className="text-xs text-gray-500 mt-1">{orderStats.completed}</span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-pink-500/20 transition-colors">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">Yêu thích</span>
              </button>
            </div>
          </Card.Content>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title>Đơn hàng gần đây</Card.Title>
                  <button className="text-shopee-orange hover:text-shopee-orange-dark text-sm font-medium flex items-center gap-1">
                    Xem tất cả
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có đơn hàng nào
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-shopee-orange transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Package className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">
                                Đơn hàng #{order.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(order.date).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3 mb-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Số lượng: {item.quantity}
                              </div>
                            </div>
                            <div className="text-shopee-orange font-semibold">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="text-gray-600">Tổng thanh toán:</div>
                          <div className="text-xl font-bold text-shopee-orange">
                            {formatCurrency(order.total)}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {order.status === 'completed' && (
                            <>
                              <Button variant="outline" size="sm" className="flex-1">
                                Mua lại
                              </Button>
                              <Button variant="primary" size="sm" className="flex-1">
                                Đánh giá
                              </Button>
                            </>
                          )}
                          {order.status === 'shipping' && (
                            <Button variant="outline" size="sm" className="flex-1">
                              Theo dõi đơn hàng
                            </Button>
                          )}
                          {order.status === 'pending' && (
                            <>
                              <Button variant="outline" size="sm" className="flex-1">
                                Hủy đơn
                              </Button>
                              <Button variant="primary" size="sm" className="flex-1">
                                Thanh toán
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Recently Viewed */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-gray-400" />
                    Sản phẩm đã xem
                  </Card.Title>
                  <button className="text-shopee-orange hover:text-shopee-orange-dark text-sm font-medium">
                    Xóa lịch sử
                  </button>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recentlyViewed.map((product) => (
                    <div 
                      key={product.id}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="text-sm text-gray-900 line-clamp-2 mb-1">
                        {product.name}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-shopee-orange font-semibold">
                          {formatCurrency(product.price)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                          {product.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  Thông tin tài khoản
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Thành viên từ:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Hạng thành viên:</span>
                    <Badge variant="primary" size="sm">
                      {user.role === 'CUSTOMER' ? 'Khách hàng' : user.role}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Chỉnh sửa hồ sơ
                </Button>
              </Card.Content>
            </Card>

            {/* Addresses */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    Địa chỉ giao hàng
                  </Card.Title>
                  <button className="text-shopee-orange hover:text-shopee-orange-dark text-sm font-medium">
                    Thêm
                  </button>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div 
                      key={address.id}
                      className={clsx(
                        'p-3 rounded-lg border transition-colors cursor-pointer',
                        address.isDefault 
                          ? 'border-shopee-orange bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900 text-sm">
                          {address.name}
                        </div>
                        {address.isDefault && (
                          <Badge variant="primary" size="sm">Mặc định</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{address.fullName} | {address.phone}</div>
                        <div>{address.address}</div>
                        <div>{address.city}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>

            {/* Stats */}
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  Thống kê mua sắm
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tổng chi tiêu:</span>
                    <span className="text-lg font-bold text-shopee-orange">
                      {formatCurrency(32878000)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Đã mua:</span>
                      <span className="font-medium">{orderStats.completed} đơn</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Đã hủy:</span>
                      <span className="font-medium">{orderStats.cancelled} đơn</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tỷ lệ thành công:</span>
                      <span className="font-medium text-green-500">100%</span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

