import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Star,
  TrendingUp,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';
import { clsx } from 'clsx';

const CustomerWishlist = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedItems, setSelectedItems] = useState([]);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement wishlist API call
      // const response = await wishlistApi.getWishlist();
      // if (response.data.success) {
      //   setWishlistItems(response.data.data);
      // }
      setWishlistItems([]); // Empty until API is implemented
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Không thể tải danh sách yêu thích. Vui lòng thử lại.');
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

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.id));
    }
  };

  const handleRemoveSelected = () => {
    console.log('Removing items:', selectedItems);
    setSelectedItems([]);
  };

  const handleAddToCart = (item) => {
    console.log('Adding to cart:', item);
  };

  const getPriceHistoryBadge = (history) => {
    if (history === 'down') {
      return (
        <Badge variant="success" size="sm" className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 rotate-180" />
          Giá giảm
        </Badge>
      );
    } else if (history === 'up') {
      return (
        <Badge variant="danger" size="sm" className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Giá tăng
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sản phẩm yêu thích</h1>
        <p className="text-gray-600">
          Danh sách {wishlistItems.length} sản phẩm bạn đang quan tâm
        </p>
      </div>

      {/* Toolbar */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.length === wishlistItems.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-shopee-orange border-gray-300 rounded focus:ring-shopee-orange"
              />
              <span className="ml-2 text-sm text-gray-700">
                Chọn tất cả ({selectedItems.length})
              </span>
            </label>

            {selectedItems.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRemoveSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa ({selectedItems.length})
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Lọc
            </Button>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-2 transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-shopee-orange text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-2 transition-colors',
                  viewMode === 'list' 
                    ? 'bg-shopee-orange text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Wishlist Items */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </Card>
      ) : error ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchWishlist}>
              Thử lại
            </Button>
          </div>
        </Card>
      ) : wishlistItems.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có sản phẩm yêu thích
            </h3>
            <p className="text-gray-600 mb-6">
              Thêm sản phẩm vào danh sách yêu thích để mua sau
            </p>
            <Button variant="primary">
              Khám phá sản phẩm
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} padding="none" hover className="relative">
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-5 h-5 text-shopee-orange border-gray-300 rounded focus:ring-shopee-orange"
                    />
                  </div>

                  <button
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shopee-shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>

                  <div className="relative aspect-square">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.discount > 0 && (
                      <Badge 
                        variant="danger" 
                        className="absolute bottom-3 left-3"
                      >
                        -{item.discount}%
                      </Badge>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      {getPriceHistoryBadge(item.priceHistory)}
                    </div>

                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        ({item.reviewCount})
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-shopee-orange">
                          {formatCurrency(item.price)}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      {item.stock > 0 ? (
                        <span className="text-green-600">Còn {item.stock} sản phẩm</span>
                      ) : (
                        <span className="text-red-600">Hết hàng</span>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Thêm vào giỏ
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <Card key={item.id} hover className="p-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-5 h-5 text-shopee-orange border-gray-300 rounded focus:ring-shopee-orange"
                    />

                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {item.discount > 0 && (
                        <Badge 
                          variant="danger" 
                          size="sm"
                          className="absolute top-1 left-1"
                        >
                          -{item.discount}%
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
                          {item.name}
                        </h3>
                        {getPriceHistoryBadge(item.priceHistory)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          {item.rating} ({item.reviewCount})
                        </div>
                        <span>Shop: {item.shop}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-shopee-orange">
                            {formatCurrency(item.price)}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="text-sm">
                          {item.stock > 0 ? (
                            <span className="text-green-600">Còn {item.stock} sản phẩm</span>
                          ) : (
                            <span className="text-red-600">Hết hàng</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handleAddToCart(item)}
                        disabled={item.stock === 0}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Thêm vào giỏ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-500 border-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerWishlist;

