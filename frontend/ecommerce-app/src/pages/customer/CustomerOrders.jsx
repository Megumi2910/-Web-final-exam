import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  ChevronDown,
  MessageCircle,
  Star,
  RotateCcw
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../services/orderApi';
import CancelOrderModal from '../../components/order/CancelOrderModal';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, navigate, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderApi.getMyOrders(0, 100); // Fetch more orders to allow filtering
      if (response.data.success) {
        // PageResponse extends ApiResponse<List<T>>, so data is directly in response.data.data
        const ordersData = response.data.data || [];
        console.log('Orders data:', ordersData); // Debug log
        // Transform orders to match component structure
        // OrderDto has items array, not orderItems
        const transformedOrders = ordersData.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber || order.id,
          date: order.orderDate || order.createdAt,
          status: mapOrderStatus(order.orderStatus, order.deliveryStatus),
          items: order.items?.map(item => ({
            id: item.id,
            name: item.productName || 'Product',
            image: item.productImageUrl || item.productImages?.[0] || 'https://via.placeholder.com/100',
            variant: item.productVariant || 'Default',
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice || 0),
            totalPrice: parseFloat(item.totalPrice || (item.unitPrice * item.quantity) || 0)
          })) || [],
          shipping: parseFloat(order.shippingFee || 0),
          total: parseFloat(order.totalAmount || 0),
          shop: 'Shop', // Orders can have multiple sellers, using generic shop name
          trackingNumber: null, // TODO: Add tracking number to OrderDto if needed
          estimatedDelivery: null, // TODO: Add estimated delivery to OrderDto if needed
          payment: order.payment, // Include payment info for display
          cancellationReason: order.cancellationReason // Include cancellation reason
        }));
        
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Không thể tải đơn hàng. Vui lòng thử lại.');
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

  const handleCancelOrderClick = (orderId, orderNumber) => {
    setSelectedOrderId(orderId);
    setSelectedOrderNumber(orderNumber);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async (reason) => {
    if (!selectedOrderId) return;
    
    try {
      const response = await orderApi.cancelOrder(selectedOrderId, reason);
      if (response.data.success) {
        setCancelModalOpen(false);
        setSelectedOrderId(null);
        setSelectedOrderNumber(null);
        // Refresh orders
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
    }
  };


  const getStatusConfig = (status) => {
    const statusMap = {
      pending: { 
        variant: 'warning', 
        text: 'Chờ xác nhận', 
        icon: Clock,
        color: 'text-yellow-600 bg-yellow-50'
      },
      shipping: { 
        variant: 'primary', 
        text: 'Đang giao hàng', 
        icon: Truck,
        color: 'text-blue-600 bg-blue-50'
      },
      completed: { 
        variant: 'success', 
        text: 'Hoàn thành', 
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50'
      },
      cancelled: { 
        variant: 'danger', 
        text: 'Đã hủy', 
        icon: XCircle,
        color: 'text-red-600 bg-red-50'
      }
    };
    return statusMap[status];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders by search query (status filtering is done in fetchOrders)
  // Calculate tab counts from all orders
  const tabs = [
    { key: 'all', label: 'Tất cả', count: orders.length, icon: Package },
    { key: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => o.status === 'pending').length, icon: Clock },
    { key: 'shipping', label: 'Đang giao', count: orders.filter(o => o.status === 'shipping').length, icon: Truck },
    { key: 'completed', label: 'Hoàn thành', count: orders.filter(o => o.status === 'completed').length, icon: CheckCircle },
    { key: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length, icon: XCircle }
  ];

  // Filter orders by active tab and search query
  const filteredOrders = orders.filter(order => {
    // Filter by active tab
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    
    // Filter by search query
    if (searchQuery) {
      return (
        order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đơn hàng của tôi</h1>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchOrders}>
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đơn hàng của tôi</h1>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange focus:border-transparent"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Bộ lọc
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Card padding="none">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap border-b-2',
                  activeTab === tab.key
                    ? 'text-shopee-orange border-shopee-orange'
                    : 'text-gray-600 border-transparent hover:text-shopee-orange'
                )}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.count > 0 && (
                  <Badge 
                    variant={activeTab === tab.key ? 'primary' : 'default'} 
                    size="sm"
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có đơn hàng nào
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Không tìm thấy đơn hàng phù hợp' : 'Bạn chưa có đơn hàng nào'}
              </p>
              <Button variant="primary">
                Tiếp tục mua sắm
              </Button>
            </div>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={order.id} padding="none" hover>
                {/* Order Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Link 
                        to={`/orders/${order.id}`}
                        className="flex items-center space-x-2 cursor-pointer hover:text-shopee-orange transition-colors"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          Đơn hàng #{order.orderNumber || order.id}
                        </span>
                      </Link>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(order.date)}
                      </span>
                    </div>
                    <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.text}
                    </Badge>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-4">
                  {/* Shop Info */}
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-gray-900">{order.shop}</span>
                    <Button variant="ghost" size="sm" className="p-1">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Items */}
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4">
                      <Link 
                        to={`/orders/${order.id}`}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/orders/${order.id}`}
                          className="cursor-pointer hover:text-shopee-orange transition-colors"
                        >
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.name}
                          </h4>
                        </Link>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.variant}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            x{item.quantity}
                          </span>
                          <span className="font-semibold text-shopee-orange">
                            {formatCurrency(item.totalPrice || (item.unitPrice * item.quantity))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Tracking Info */}
                  {order.status === 'shipping' && (
                    <div className={clsx('p-3 rounded-lg', statusConfig.color)}>
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          Đang vận chuyển
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>Mã vận đơn: <span className="font-medium">{order.trackingNumber}</span></div>
                        <div>Dự kiến giao: <span className="font-medium">
                          {new Date(order.estimatedDelivery).toLocaleDateString('vi-VN')}
                        </span></div>
                      </div>
                    </div>
                  )}

                  {/* Cancel Info */}
                  {order.status === 'cancelled' && (
                    <div className={clsx('p-3 rounded-lg', statusConfig.color)}>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">Đã hủy</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Lý do:</span>{' '}
                        {order.cancellationReason || 'Không có lý do'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      Tổng thanh toán:
                    </div>
                    <div className="text-xl font-bold text-shopee-orange">
                      {formatCurrency(order.total)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    {order.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelOrderClick(order.id, order.orderNumber)}
                        >
                          Hủy đơn
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Xem chi tiết
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'shipping' && (
                      <>
                        <Button variant="outline" size="sm">
                          Liên hệ người bán
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Theo dõi đơn hàng
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'completed' && (
                      <>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" />
                          Mua lại
                        </Button>
                        {order.canReview && (
                          <Button variant="primary" size="sm" className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Đánh giá
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Liên hệ người bán
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'cancelled' && (
                      <>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" />
                          Mua lại
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Xem chi tiết
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

        {/* Cancel Order Modal */}
        <CancelOrderModal
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setSelectedOrderId(null);
            setSelectedOrderNumber(null);
          }}
          onConfirm={handleCancelConfirm}
          orderNumber={selectedOrderNumber}
        />
      </div>
    </div>
  );
};

export default CustomerOrders;

