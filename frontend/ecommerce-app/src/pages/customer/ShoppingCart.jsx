import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart as CartIcon, 
  Trash2, 
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Heart,
  PackageCheck,
  TrendingDown
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { cartApi } from '../../services/cartApi';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }
      fetchCart();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartApi.getCart();
      if (response.data.success) {
        const cart = response.data.data;
        // Transform cart data to match component structure
        // Group items by seller
        const itemsBySeller = {};
        
        cart.items?.forEach(item => {
          const sellerId = item.product?.sellerId || 0;
          const sellerName = item.product?.sellerName || 'Shop';
          
          if (!itemsBySeller[sellerId]) {
            itemsBySeller[sellerId] = {
              shopId: sellerId,
              shopName: sellerName,
              products: []
            };
          }
          
          itemsBySeller[sellerId].products.push({
            id: item.id, // cart item ID
            productId: item.product?.id,
            name: item.product?.name || 'Unknown Product',
            image: item.product?.images?.[0] || 'https://via.placeholder.com/100',
            variant: item.productVariant || 'Default',
            price: item.price,
            originalPrice: item.product?.originalPrice || item.price,
            quantity: item.quantity,
            stock: item.product?.stock || 0,
            freeShip: false // TODO: Add freeShip logic from backend
          });
        });
        
        setCartItems(Object.values(itemsBySeller));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleQuantityChange = async (shopId, cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await cartApi.updateCartItem(cartItemId, { quantity: newQuantity });
      if (response.data.success) {
        // Refresh cart after update
        await fetchCart();
        // Update selected items if needed
        const itemKey = `${shopId}-${cartItemId}`;
        if (newQuantity === 0 && selectedItems.includes(itemKey)) {
          setSelectedItems(prev => prev.filter(key => key !== itemKey));
        }
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      alert('Không thể cập nhật số lượng. Vui lòng thử lại.');
    }
  };

  const handleRemoveItem = async (shopId, cartItemId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      return;
    }
    
    try {
      const response = await cartApi.removeFromCart(cartItemId);
      if (response.data.success) {
        // Remove from selected items
        const itemKey = `${shopId}-${cartItemId}`;
        setSelectedItems(prev => prev.filter(key => key !== itemKey));
        // Refresh cart
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleSelectItem = (shopId, cartItemId) => {
    const itemKey = `${shopId}-${cartItemId}`;
    setSelectedItems(prev =>
      prev.includes(itemKey)
        ? prev.filter(key => key !== itemKey)
        : [...prev, itemKey]
    );
  };

  const handleSelectShop = (shopId) => {
    const shop = cartItems.find(s => s.shopId === shopId);
    if (!shop) return;
    
    const shopItemKeys = shop.products.map(p => `${shopId}-${p.id}`);
    const allSelected = shopItemKeys.every(key => selectedItems.includes(key));

    if (allSelected) {
      setSelectedItems(prev => prev.filter(key => !shopItemKeys.includes(key)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...shopItemKeys])]);
    }
  };

  const handleSelectAll = () => {
    const allKeys = cartItems.flatMap(shop =>
      shop.products.map(p => `${shop.shopId}-${p.id}`)
    );
    
    if (selectedItems.length === allKeys.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allKeys);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, shop) => {
      return total + shop.products.reduce((shopTotal, product) => {
        const itemKey = `${shop.shopId}-${product.id}`;
        if (selectedItems.includes(itemKey)) {
          return shopTotal + (product.price * product.quantity);
        }
        return shopTotal;
      }, 0);
    }, 0);
  };

  const calculateShipping = () => {
    // Simple calculation: 30k per shop, free if all products have freeShip
    let shipping = 0;
    cartItems.forEach(shop => {
      const hasSelectedItems = shop.products.some(p => 
        selectedItems.includes(`${shop.shopId}-${p.id}`)
      );
      
      if (hasSelectedItems) {
        const allFreeShip = shop.products.every(p => 
          !selectedItems.includes(`${shop.shopId}-${p.id}`) || p.freeShip
        );
        
        if (!allFreeShip) {
          shipping += 30000;
        }
      }
    });
    return shipping;
  };

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const discount = 0; // Calculate based on applied vouchers
  const total = subtotal + shipping - discount;

  const totalItems = cartItems.reduce((count, shop) => 
    count + shop.products.reduce((shopCount, p) => 
      selectedItems.includes(`${shop.shopId}-${p.id}`) ? shopCount + p.quantity : shopCount
    , 0)
  , 0);

  // Handle checkout - truyền selected items qua router state
  const handleCheckout = () => {
    if (selectedItems.length === 0) return;

    // Lấy dữ liệu các sản phẩm đã chọn
    const checkoutData = cartItems
      .map(shop => ({
        shopId: shop.shopId,
        shopName: shop.shopName,
        products: shop.products.filter(product => 
          selectedItems.includes(`${shop.shopId}-${product.id}`)
        )
      }))
      .filter(shop => shop.products.length > 0);

    // Navigate đến checkout với state
    navigate('/checkout', {
      state: {
        cartItems: checkoutData,
        subtotal,
        shipping,
        discount,
        total
      }
    });
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của tôi</h1>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchCart}>
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của tôi</h1>
        <p className="text-gray-600">
          Bạn có {cartItems.reduce((sum, shop) => sum + shop.products.length, 0)} sản phẩm trong giỏ hàng
        </p>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Giỏ hàng trống
            </h3>
            <p className="text-gray-600 mb-6">
              Thêm sản phẩm vào giỏ hàng để mua sắm
            </p>
            <Link to="/">
              <Button variant="primary">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <Card>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cartItems.flatMap(s => s.products).length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-shopee-orange border-gray-300 rounded focus:ring-shopee-orange"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Chọn tất cả ({cartItems.reduce((sum, s) => sum + s.products.length, 0)} sản phẩm)
                  </span>
                </label>

                {selectedItems.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa ({selectedItems.length})
                  </Button>
                )}
              </div>
            </Card>

            {/* Shop Items */}
            {cartItems.map((shop) => {
              const shopItemKeys = shop.products.map(p => `${shop.shopId}-${p.id}`);
              const allShopSelected = shopItemKeys.every(key => selectedItems.includes(key));

              return (
                <Card key={shop.shopId} padding="none">
                  {/* Shop Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center flex-1">
                        <input
                          type="checkbox"
                          checked={allShopSelected}
                          onChange={() => handleSelectShop(shop.shopId)}
                          className="w-4 h-4 text-shopee-orange border-gray-300 rounded focus:ring-shopee-orange"
                        />
                        <span className="ml-3 font-medium text-gray-900">
                          {shop.shopName}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="divide-y divide-gray-200">
                    {shop.products.map((product) => {
                      const itemKey = `${shop.shopId}-${product.id}`;
                      const isSelected = selectedItems.includes(itemKey);

                      return (
                        <div 
                          key={product.id}
                          className={clsx(
                            'p-4 transition-colors',
                            isSelected ? 'bg-orange-50' : 'bg-white'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectItem(shop.shopId, product.id)}
                              className="w-4 h-4 text-shopee-orange border-gray-300 rounded focus:ring-shopee-orange mt-1"
                            />

                            {/* Image */}
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-500 mb-2">
                                {product.variant}
                              </p>

                              <div className="flex items-center gap-2 mb-2">
                                {product.originalPrice > product.price && (
                                  <>
                                    <span className="text-sm text-gray-400 line-through">
                                      {formatCurrency(product.originalPrice)}
                                    </span>
                                    <Badge variant="danger" size="sm" className="flex items-center gap-1">
                                      <TrendingDown className="w-3 h-3" />
                                      {Math.round((1 - product.price / product.originalPrice) * 100)}%
                                    </Badge>
                                  </>
                                )}
                                {product.freeShip && (
                                  <Badge variant="success" size="sm">
                                    Freeship
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-shopee-orange">
                                  {formatCurrency(product.price)}
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleQuantityChange(shop.shopId, product.id, product.quantity - 1)}
                                    disabled={product.quantity <= 1}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <input
                                    type="number"
                                    value={product.quantity}
                                    onChange={(e) => handleQuantityChange(shop.shopId, product.id, parseInt(e.target.value) || 1)}
                                    onBlur={(e) => {
                                      const value = parseInt(e.target.value) || 1;
                                      if (value !== product.quantity) {
                                        handleQuantityChange(shop.shopId, product.id, value);
                                      }
                                    }}
                                    className="w-16 h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-shopee-orange"
                                  />
                                  <button
                                    onClick={() => handleQuantityChange(shop.shopId, product.id, product.quantity + 1)}
                                    disabled={product.quantity >= product.stock}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <div className="text-sm text-gray-600">
                                  Còn {product.stock} sản phẩm
                                </div>
                                <div className="flex items-center gap-2">
                                  <button className="text-sm text-gray-600 hover:text-shopee-orange flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    Yêu thích
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveItem(shop.shopId, product.id)}
                                    className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}

            {/* Voucher Section - TODO: Implement voucher API when available */}
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-shopee-orange" />
                  Mã giảm giá
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange"
                  />
                  <Button variant="primary" disabled>Tính năng sắp có</Button>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Tính năng mã giảm giá đang được phát triển
                </p>
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
                    <span className="text-gray-600">Tạm tính ({totalItems} sản phẩm):</span>
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
                      <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-shopee-orange">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full flex items-center justify-center gap-2"
                  disabled={selectedItems.length === 0}
                  onClick={handleCheckout}
                >
                  Mua hàng ({totalItems})
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <PackageCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <div className="font-medium mb-1">Chính sách mua hàng</div>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Freeship đơn từ 99k</li>
                        <li>• Đổi trả trong 7 ngày</li>
                        <li>• Thanh toán khi nhận hàng</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;

