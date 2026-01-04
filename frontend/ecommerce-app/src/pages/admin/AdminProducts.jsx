import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Store,
  ChevronDown
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { productApi } from '../../services/productApi';
import { useAuth } from '../../context/AuthContext';
import ProductForm from '../../components/admin/ProductForm';

const ProductCard = ({ product, onEdit, onDelete, onView, onApprove, onReject }) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED': return 'Đã duyệt';
      case 'PENDING': return 'Chờ duyệt';
      case 'REJECTED': return 'Đã từ chối';
      case 'DISCONTINUED': return 'Ngừng bán';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'DISCONTINUED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {product.images && product.images.length > 0 && product.images[0] ? (
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-12 h-12 object-cover rounded-lg" 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <Package className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">ID: {product.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(product)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Edit className="w-4 h-4" />
          </button>
          {product.status === 'PENDING' && (
            <>
              <button
                onClick={() => onApprove(product)}
                className="p-1 text-green-400 hover:text-green-600"
                title="Duyệt"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(product)}
                className="p-1 text-red-400 hover:text-red-600"
                title="Từ chối"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(product)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Giá:</span>
          <span className="font-medium text-gray-900">{product.price?.toLocaleString()}đ</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Tồn kho:</span>
          <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
            {product.stock || 0} sản phẩm
          </span>
        </div>
        {product.rating && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Đánh giá:</span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
          </div>
        )}
        {product.sellerName && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Seller:</span>
            <span className="text-sm font-medium text-gray-900">{product.sellerName}</span>
          </div>
        )}
        {product.soldCount !== undefined && product.soldCount !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Đã bán:</span>
            <span className="text-sm font-medium text-gray-900">{product.soldCount || 0} sản phẩm</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
            {getStatusText(product.status)}
          </span>
        </div>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSellerId, setSelectedSellerId] = useState(null); // null = all shops
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllProducts(page, 20);
      console.log('Products API response:', response.data); // Debugging log
      if (response.data.success) {
        // PageResponse structure: data.data is the list, pagination fields are at response.data level
        const productsList = response.data.data || [];
        setProducts(productsList);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setError(response.data.message || 'Failed to fetch products');
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique shops from products, including admin if they have storeName
  const shops = useMemo(() => {
    const shopMap = new Map();
    
    // Add admin's store if they have storeName set (show even with 0 products)
    if (user && user.storeName && user.userId && user.storeName.trim()) {
      // Count admin's products
      const adminProductCount = products.filter(p => p.sellerId === user.userId).length;
      shopMap.set(user.userId, {
        id: user.userId,
        name: user.storeName,
        email: user.email,
        productCount: adminProductCount
      });
    }
    
    // Add shops from products
    products.forEach(product => {
      if (product.sellerId && product.sellerName) {
        if (!shopMap.has(product.sellerId)) {
          shopMap.set(product.sellerId, {
            id: product.sellerId,
            name: product.sellerName,
            email: product.sellerEmail,
            productCount: 0
          });
        }
        shopMap.get(product.sellerId).productCount++;
      }
    });
    
    return Array.from(shopMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, user]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.id?.toString().includes(searchQuery) ||
                         product.sellerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.status === 'APPROVED') ||
                         (filterStatus === 'inactive' && product.status !== 'APPROVED');
    const matchesSeller = selectedSellerId === null || product.sellerId === selectedSellerId;
    return matchesSearch && matchesStatus && matchesSeller;
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, productData);
      } else {
        await productApi.createProduct(productData);
      }
      fetchProducts();
      setShowAddModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to save product:', err);
      throw err; // Let ProductForm handle the error display
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Bạn có chắc chắn muốn ngừng bán sản phẩm "${product.name}"?\n\nSản phẩm sẽ được đánh dấu là "Ngừng bán" và sẽ không hiển thị cho khách hàng nữa. Các đơn hàng liên quan sẽ được giữ lại để lưu trữ.`)) {
      try {
        await productApi.deleteProduct(product.id);
        alert('Sản phẩm đã được đánh dấu là "Ngừng bán" thành công.');
        fetchProducts();
      } catch (err) {
        console.error('Failed to delete product:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Không thể ngừng bán sản phẩm';
        alert(`Không thể ngừng bán sản phẩm: ${errorMessage}`);
      }
    }
  };

  const handleView = (product) => {
    // Navigate to product detail page using product ID
    window.open(`/product/${product.id}`, '_blank');
  };

  const handleApprove = async (product) => {
    try {
      await adminApi.approveProduct(product.id);
      fetchProducts();
    } catch (err) {
      console.error('Failed to approve product:', err);
      alert('Không thể duyệt sản phẩm');
    }
  };

  const handleReject = async (product) => {
    try {
      await adminApi.rejectProduct(product.id);
      fetchProducts();
    } catch (err) {
      console.error('Failed to reject product:', err);
      alert('Không thể từ chối sản phẩm');
    }
  };

  const stats = {
    total: filteredProducts.length,
    active: filteredProducts.filter(p => p.status === 'APPROVED').length,
    lowStock: filteredProducts.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: filteredProducts.filter(p => p.stock === 0).length
  };

  return (
    <div className="flex gap-6">
      {/* Shops Sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow p-4 sticky top-4">
          <div className="flex items-center space-x-2 mb-4">
            <Store className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Cửa hàng</h2>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedSellerId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedSellerId === null
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Tất cả cửa hàng</span>
                <span className="text-xs text-gray-500">({products.length})</span>
              </div>
            </button>
            {shops.map(shop => (
              <button
                key={shop.id}
                onClick={() => setSelectedSellerId(shop.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedSellerId === shop.id
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{shop.name}</div>
                    {shop.email && (
                      <div className="text-xs text-gray-500 truncate">{shop.email}</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">({shop.productCount})</span>
                </div>
              </button>
            ))}
          </div>
          {shops.length === 0 && !loading && (
            <p className="text-sm text-gray-500 text-center py-4">Chưa có cửa hàng nào</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
            <p className="text-gray-600">
              {selectedSellerId 
                ? `Sản phẩm của ${shops.find(s => s.id === selectedSellerId)?.name || 'cửa hàng'}`
                : 'Quản lý danh sách sản phẩm trong cửa hàng'}
            </p>
          </div>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đang bán</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sắp hết hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Hết hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {/* Seller Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSellerDropdown(!showSellerDropdown)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 min-w-[180px] justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Store className="w-4 h-4" />
                  <span>
                    {selectedSellerId === null 
                      ? 'Tất cả cửa hàng' 
                      : shops.find(s => s.id === selectedSellerId)?.name || 'Chọn cửa hàng'}
                  </span>
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSellerDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSellerDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-64 overflow-y-auto">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSelectedSellerId(null);
                          setShowSellerDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          selectedSellerId === null
                            ? 'bg-orange-50 text-orange-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Tất cả cửa hàng
                      </button>
                      {shops.map(shop => (
                        <button
                          key={shop.id}
                          onClick={() => {
                            setSelectedSellerId(shop.id);
                            setShowSellerDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            selectedSellerId === shop.id
                              ? 'bg-orange-50 text-orange-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{shop.name}</div>
                              {shop.email && (
                                <div className="text-xs text-gray-500 truncate">{shop.email}</div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 ml-2">({shop.productCount})</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải sản phẩm...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-gray-600">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSave}
          isAdmin={true}
        />
      )}
      </div>
    </div>
  );
};

export default AdminProducts;
