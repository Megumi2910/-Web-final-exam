import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  Star,
  TrendingUp,
  AlertCircle,
  Upload,
  Image
} from 'lucide-react';
import { categoryApi } from '../../services/categoryApi';
import { sellerApi } from '../../services/sellerApi';

const ProductCard = ({ product, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
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
          <span className="font-medium text-gray-900">{product.price.toLocaleString()}đ</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Tồn kho:</span>
          <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
            {product.stock} sản phẩm
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Đánh giá:</span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Đã bán:</span>
          <span className="text-sm font-medium text-gray-900">{product.sold} sản phẩm</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        </div>
      </div>
    </div>
  );
};

const SellerProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    images: []
  });
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      fetchCategories();
    }
  }, [showAddModal]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sellerApi.getMyProducts(0, 100);
      if (response.data.success) {
        const productList = response.data.data.content || response.data.data || [];
        // Map API response to component format
        const mappedProducts = productList.map(product => ({
          id: product.id?.toString() || product.productId?.toString() || '',
          name: product.name || '',
          price: product.price ? parseFloat(product.price) : 0,
          stock: product.stock || 0,
          category: product.categories?.[0]?.name || 'Chưa phân loại',
          description: product.description || '',
          images: product.images || [],
          image: product.images?.[0] || product.imageUrl || '',
          status: product.status === 'APPROVED' ? 'active' : 'inactive',
          rating: product.rating || 0,
          sold: product.soldCount || 0
        }));
        setProducts(mappedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryApi.getAllCategories();
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (product) => {
    console.log('Edit product:', product);
  };

  const handleDelete = (product) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      console.log('Delete product:', product);
    }
  };

  const handleView = (product) => {
    console.log('View product:', product);
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement API call to create product
    console.log('Submitting product:', formData);
    // Reset form
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      description: '',
      images: []
    });
    setImageUrl('');
    setShowAddModal(false);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      description: '',
      images: []
    });
    setImageUrl('');
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalSold: products.reduce((sum, p) => sum + p.sold, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600">Quản lý sản phẩm của cửa hàng bạn</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đã bán</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSold}</p>
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
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
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
        </>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm sản phẩm mới</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giá</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                {loadingCategories ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-500">Đang tải danh mục...</span>
                  </div>
                ) : (
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={categories.length === 0}
                  >
                    <option value="">
                      {categories.length === 0 ? 'Chưa có danh mục nào' : 'Chọn danh mục'}
                    </option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả sản phẩm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Nhập URL hình ảnh"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm</span>
                    </button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-300"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.images.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nhập URL hình ảnh và nhấn "Thêm" để tải lên</p>
                    </div>
                  )}
                </div>
              </div>
            
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={formData.images.length === 0}
                >
                  Thêm sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
