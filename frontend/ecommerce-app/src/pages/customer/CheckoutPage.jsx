import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  CreditCard, 
  FileText,
  ChevronRight,
  Edit2,
  Plus,
  Check,
  Truck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [note, setNote] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Addresses state - initialized empty, users can add addresses
  const [addresses, setAddresses] = useState([]);

  // State cho form thêm địa chỉ
  const [newAddress, setNewAddress] = useState({
    name: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    isDefault: false
  });

  // Lấy data từ router state (từ giỏ hàng)
  const checkoutData = location.state;
  
  // Initialize with user info if available (optional default address)
  useEffect(() => {
    if (user && user.fullName && addresses.length === 0) {
      // Create a default address from user info if available
      const defaultAddress = {
        id: 1,
        name: 'Địa chỉ mặc định',
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || 'TP. Hồ Chí Minh',
        isDefault: true
      };
      // Only add if user has at least name
      if (defaultAddress.fullName) {
        setAddresses([defaultAddress]);
        setSelectedAddress(1);
      }
    }
  }, [user]);

  // Nếu không có data (user vào trực tiếp URL), redirect về cart
  useEffect(() => {
    if (!checkoutData || !checkoutData.cartItems || checkoutData.cartItems.length === 0) {
      navigate('/cart');
    }
  }, [checkoutData, navigate]);

  // Nếu chưa có data, return null (sẽ redirect)
  if (!checkoutData || !checkoutData.cartItems) {
    return null;
  }

  const orderItems = checkoutData.cartItems.map(shop => ({
    shopId: shop.shopId,
    shopName: shop.shopName,
    products: shop.products.map(product => ({
      id: product.id,
      name: product.name,
      image: product.image,
      variant: product.variant,
      price: product.price,
      quantity: product.quantity
    })),
    shipping: shop.products.some(p => !p.freeShip) ? 30000 : 0,
    voucher: null
  }));

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: Truck,
      recommended: true
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: CreditCard,
      discount: 50000
    },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua Internet Banking',
      icon: CreditCard
    },
    {
      id: 'card',
      name: 'Thẻ tín dụng/Ghi nợ',
      description: 'Visa, Mastercard, JCB',
      icon: CreditCard
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((total, shop) => {
      return total + shop.products.reduce((shopTotal, product) => {
        return shopTotal + (product.price * product.quantity);
      }, 0);
    }, 0);
  };

  const calculateTotalShipping = () => {
    return orderItems.reduce((total, shop) => total + shop.shipping, 0);
  };

  const calculateTotalDiscount = () => {
    let discount = 0;
    orderItems.forEach(shop => {
      if (shop.voucher) {
        discount += shop.voucher.discount;
      }
    });
    
    // Add payment method discount
    const paymentMethod = paymentMethods.find(m => m.id === selectedPayment);
    if (paymentMethod?.discount) {
      discount += paymentMethod.discount;
    }
    
    return discount;
  };

  // Sử dụng giá trị từ cart hoặc tính toán lại
  const subtotal = checkoutData.subtotal || calculateSubtotal();
  const shipping = checkoutData.shipping || calculateTotalShipping();
  const discount = checkoutData.discount || calculateTotalDiscount();
  const total = checkoutData.total || (subtotal + shipping - discount);

  // Xử lý thêm địa chỉ mới
  const handleAddAddress = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Tạo địa chỉ mới
    const nextId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
    const addressToAdd = {
      id: nextId,
      name: newAddress.name || 'Địa chỉ mới',
      fullName: newAddress.fullName,
      phone: newAddress.phone,
      address: newAddress.address,
      city: newAddress.city,
      isDefault: newAddress.isDefault || addresses.length === 0
    };

    // Nếu địa chỉ mới là mặc định, cập nhật các địa chỉ cũ
    let updatedAddresses = addresses;
    if (newAddress.isDefault) {
      updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    // Thêm địa chỉ mới vào danh sách
    setAddresses([...updatedAddresses, addressToAdd]);
    
    // Tự động chọn địa chỉ mới
    setSelectedAddress(addressToAdd.id);

    // Reset form và đóng modal
    setNewAddress({
      name: '',
      fullName: '',
      phone: '',
      address: '',
      city: '',
      isDefault: false
    });
    setShowAddressModal(false);
  };

  const handlePlaceOrder = () => {
    console.log('Placing order:', {
      address: addresses.find(a => a.id === selectedAddress),
      payment: selectedPayment,
      note,
      items: orderItems,
      total
    });
    // TODO: Process order
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="bg-gradient-to-r from-orange-600 to-pink-500 text-white px-3 py-1.5 rounded-lg font-bold text-base hover:opacity-90 transition-opacity">
                CNVLTW
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 font-medium">Thanh toán</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Link to="/cart" className="hover:text-shopee-orange">Giỏ hàng</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-shopee-orange font-medium">Thanh toán</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin thanh toán</h1>
          <p className="text-gray-600">Vui lòng kiểm tra thông tin trước khi đặt hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-shopee-orange" />
                    Địa chỉ giao hàng
                  </Card.Title>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm mới
                  </Button>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address.id)}
                      className={clsx(
                        'p-4 border-2 rounded-lg cursor-pointer transition-all',
                        selectedAddress === address.id
                          ? 'border-shopee-orange bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={clsx(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                            selectedAddress === address.id
                              ? 'border-shopee-orange bg-shopee-orange'
                              : 'border-gray-300'
                          )}>
                            {selectedAddress === address.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {address.fullName}
                              </span>
                              <span className="text-gray-500">|</span>
                              <span className="text-gray-600">{address.phone}</span>
                              {address.isDefault && (
                                <Badge variant="primary" size="sm">Mặc định</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>{address.address}</div>
                              <div>{address.city}</div>
                            </div>
                          </div>
                        </div>
                        <button className="text-sm text-shopee-orange hover:text-shopee-orange-dark flex items-center gap-1">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>

            {/* Order Items */}
            <Card padding="none">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Sản phẩm đặt hàng</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {orderItems.map((shop) => (
                  <div key={shop.shopId} className="p-4">
                    <div className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      {shop.shopName}
                      {shop.voucher && (
                        <Badge variant="success" size="sm">
                          Giảm {formatCurrency(shop.voucher.discount)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {shop.products.map((product) => (
                        <div key={product.id} className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {product.variant}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">
                              x{product.quantity}
                            </div>
                            <div className="font-semibold text-shopee-orange">
                              {formatCurrency(product.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Truck className="w-4 h-4" />
                        <span>Phí vận chuyển:</span>
                      </div>
                      <span className="font-medium">
                        {shop.shipping === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          formatCurrency(shop.shipping)
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Method */}
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-shopee-orange" />
                  Phương thức thanh toán
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={clsx(
                          'p-4 border-2 rounded-lg cursor-pointer transition-all',
                          selectedPayment === method.id
                            ? 'border-shopee-orange bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={clsx(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                            selectedPayment === method.id
                              ? 'border-shopee-orange bg-shopee-orange'
                              : 'border-gray-300'
                          )}>
                            {selectedPayment === method.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-5 h-5 text-gray-600" />
                              <span className="font-medium text-gray-900">
                                {method.name}
                              </span>
                              {method.recommended && (
                                <Badge variant="warning" size="sm">Khuyên dùng</Badge>
                              )}
                              {method.discount && (
                                <Badge variant="success" size="sm">
                                  Giảm {formatCurrency(method.discount)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Content>
            </Card>

            {/* Note */}
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-shopee-orange" />
                  Ghi chú đơn hàng
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange resize-none"
                />
              </Card.Content>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <Card.Header>
                <Card.Title>Tổng đơn hàng</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatCurrency(shipping)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Tổng thanh toán:</span>
                      <span className="text-2xl font-bold text-shopee-orange">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      (Đã bao gồm VAT nếu có)
                    </div>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full mb-4"
                  onClick={handlePlaceOrder}
                >
                  Đặt hàng
                </Button>

                {/* Policies */}
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="text-sm text-blue-900">
                        <div className="font-medium mb-1">Cam kết bảo mật</div>
                        <div className="text-blue-700">
                          Thông tin thanh toán được mã hóa và bảo mật
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="text-sm text-green-900">
                        <div className="font-medium mb-1">Giao hàng nhanh</div>
                        <div className="text-green-700">
                          Nhận hàng trong 2-3 ngày
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <div className="text-sm text-yellow-900">
                        <div className="font-medium mb-1">Lưu ý</div>
                        <div className="text-yellow-700">
                          Vui lòng kiểm tra kỹ thông tin trước khi đặt hàng
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal thêm địa chỉ mới */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Thêm địa chỉ mới</h2>
            </div>
            
            <form onSubmit={handleAddAddress} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhãn địa chỉ (không bắt buộc)
                </label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  placeholder="VD: Nhà riêng, Văn phòng..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shopee-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shopee-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shopee-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shopee-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="VD: TP. Hồ Chí Minh"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shopee-orange focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="w-4 h-4 text-shopee-orange rounded focus:ring-shopee-orange"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddressModal(false);
                    setNewAddress({
                      name: '',
                      fullName: '',
                      phone: '',
                      address: '',
                      city: '',
                      isDefault: false
                    });
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  Thêm địa chỉ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;

