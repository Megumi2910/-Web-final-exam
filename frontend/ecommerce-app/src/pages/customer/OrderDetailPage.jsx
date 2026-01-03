import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  QrCode,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../services/orderApi';
import CancelOrderModal from '../../components/order/CancelOrderModal';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showQR = searchParams.get('showQR') === 'true';
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderApi.getOrderById(id);
      if (response.data.success) {
        const orderData = response.data.data;
        console.log('Order data:', orderData);
        console.log('Order status:', orderData.orderStatus);
        console.log('Order status (string):', String(orderData.orderStatus));
        console.log('Order.status:', orderData.status);
        console.log('Cancellation reason:', orderData.cancellationReason);
        console.log('Is CANCELLED?', orderData.orderStatus === 'CANCELLED' || orderData.status === 'CANCELLED');
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }
      fetchOrder();
    }
  }, [id, authLoading, isAuthenticated, navigate, fetchOrder]);

  useEffect(() => {
    // Generate QR code URL if QR payment and pending
    if (order && showQR && order.payment) {
      const payment = order.payment;
      if (payment.paymentMethod === 'QR' && payment.paymentStatus === 'PENDING') {
        // Convert total amount to integer (VND doesn't use decimals)
        const amount = Math.round(order.totalAmount);
        const description = `Order #${order.orderNumber || order.id}`;
        // Using vietqr.io API (same as book_store)
        const qrUrl = `https://img.vietqr.io/image/MBBank-0774310907-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=Ecommerce Store`;
        setQrCodeUrl(qrUrl);
      }
    }
  }, [order, showQR]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', text: 'Chờ xử lý', icon: Clock },
      CONFIRMED: { variant: 'primary', text: 'Đã xác nhận', icon: CheckCircle },
      PROCESSING: { variant: 'primary', text: 'Đang xử lý', icon: Package },
      COMPLETED: { variant: 'success', text: 'Hoàn thành', icon: CheckCircle },
      CANCELLED: { variant: 'danger', text: 'Đã hủy', icon: XCircle }
    };
    const statusInfo = statusMap[status] || { variant: 'default', text: status, icon: Package };
    const Icon = statusInfo.icon;
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {statusInfo.text}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', text: 'Chờ thanh toán' },
      PAID: { variant: 'success', text: 'Đã thanh toán' },
      FAILED: { variant: 'danger', text: 'Thanh toán thất bại' }
    };
    const statusInfo = statusMap[status] || { variant: 'default', text: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
            <Button onClick={() => navigate('/orders')}>Quay lại danh sách đơn hàng</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Đơn hàng #{order.orderNumber || order.id}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Đặt ngày {new Date(order.orderDate || order.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            {getStatusBadge(order.orderStatus)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <Card.Header>
                <Card.Title>Sản phẩm</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <img
                        src={item.productImageUrl || item.productImages?.[0] || 'https://via.placeholder.com/100'}
                        alt={item.productName || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName || 'Product'}</h4>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-shopee-orange">
                          {formatCurrency(item.totalPrice || (item.unitPrice * item.quantity))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Cancellation Info - Display below products */}
                  {(() => {
                    const isCancelled = order.orderStatus === 'CANCELLED' || 
                                       order.status === 'CANCELLED' ||
                                       String(order.orderStatus) === 'CANCELLED' ||
                                       String(order.status) === 'CANCELLED';
                    console.log('Rendering cancellation section. isCancelled:', isCancelled, 'orderStatus:', order.orderStatus, 'status:', order.status);
                    if (isCancelled) {
                      return (
                        <div className="pt-4 mt-4 border-t border-gray-200">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-sm text-red-900">Đã hủy</span>
                            </div>
                            <div className="text-sm text-red-800">
                              <span className="font-medium">Lý do:</span>{' '}
                              <span>{order.cancellationReason || order.cancellation_reason || 'Không có lý do'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </Card.Content>
            </Card>

            {/* Shipping Address */}
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-shopee-orange" />
                  Địa chỉ giao hàng
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {order.phoneNumber}
                  </p>
                </div>
              </Card.Content>
            </Card>

            {/* Payment Information */}
            {order.payment && (
              <Card>
                <Card.Header>
                  <Card.Title>Thông tin thanh toán</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="font-medium">
                        {order.payment.paymentMethod === 'COD' 
                          ? 'Thanh toán khi nhận hàng (COD)'
                          : 'Thanh toán qua mã QR'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      {getPaymentStatusBadge(order.payment.paymentStatus)}
                    </div>
                    {order.payment.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã giao dịch:</span>
                        <span className="font-medium">{order.payment.transactionId}</span>
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* QR Code for QR Payment */}
            {showQR && qrCodeUrl && order.payment?.paymentMethod === 'QR' && order.payment?.paymentStatus === 'PENDING' && (
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-shopee-orange" />
                    Mã QR thanh toán
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="text-center space-y-4">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code" 
                        className="w-64 h-64"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                      </p>
                      <p className="text-lg font-semibold text-shopee-orange">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mã đơn hàng: {order.orderNumber || order.id}
                      </p>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <Card.Header>
                <Card.Title>Tổng đơn hàng</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatCurrency(order.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">{formatCurrency(order.shippingFee || 0)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(order.discount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Tổng thanh toán:</span>
                      <span className="text-xl font-bold text-shopee-orange">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link to="/orders">
                    <Button variant="outline" className="w-full">
                      Xem tất cả đơn hàng
                    </Button>
                  </Link>
                  {order.orderStatus === 'PENDING' && (
                    <Button 
                      variant="danger" 
                      className="w-full"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Hủy đơn hàng
                    </Button>
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={async (reason) => {
          try {
            console.log('Cancelling order with reason:', reason);
            await orderApi.cancelOrder(order.id, reason);
            setShowCancelModal(false);
            // Wait a bit before fetching to ensure backend has saved
            setTimeout(async () => {
              await fetchOrder();
            }, 500);
          } catch (error) {
            console.error('Error cancelling order:', error);
            alert(error.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
          }
        }}
        orderNumber={order?.orderNumber || order?.id}
      />

    </div>
  );
};

export default OrderDetailPage;

