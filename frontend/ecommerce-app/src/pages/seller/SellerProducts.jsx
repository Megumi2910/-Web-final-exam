import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Upload
} from 'lucide-react';
import { categoryApi } from '../../services/categoryApi';
import { sellerApi } from '../../services/sellerApi';

const ProductCard = ({ product, onEdit, onDelete, onView }) => {
  const getStatusText = (status) => {
    if (typeof status === 'string') {
      switch (status.toUpperCase()) {
        case 'APPROVED': return 'Đã duyệt';
        case 'PENDING': return 'Chờ duyệt';
        case 'REJECTED': return 'Đã từ chối';
        case 'DISCONTINUED': return 'Ngừng bán';
        case 'OUT_OF_STOCK': return 'Hết hàng';
        case 'ACTIVE': return 'Hoạt động';
        default: return status;
      }
    }
    // Fallback for old status format
    return status === 'active' ? 'Hoạt động' : 'Tạm dừng';
  };

  const getStatusColor = (status) => {
    if (typeof status === 'string') {
      switch (status.toUpperCase()) {
        case 'APPROVED': return 'bg-green-100 text-green-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'REJECTED': return 'bg-red-100 text-red-800';
        case 'DISCONTINUED': return 'bg-red-100 text-red-800';
        case 'OUT_OF_STOCK': return 'bg-orange-100 text-orange-800';
        case 'ACTIVE': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    // Fallback for old status format
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Use product.status directly if available, otherwise use mapped status
  const displayStatus = product.originalStatus || product.status || 'PENDING';

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
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(displayStatus)}`}>
            {getStatusText(displayStatus)}
          </span>
        </div>
      </div>
    </div>
  );
};

const SellerProducts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    images: [],
    status: 'PENDING' // Default status for new products
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
          originalStatus: product.status, // Preserve original status for display
          rating: product.rating || 0,
          sold: product.soldCount || 0,
          slug: product.slug || product.id?.toString() || '',
          brand: product.brand || '',
          sku: product.sku || '',
          originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
          isFeatured: product.isFeatured || false,
          categoryIds: product.categoryIds ? (Array.isArray(product.categoryIds) ? product.categoryIds : Array.from(product.categoryIds)) : (product.categories ? product.categories.map(c => c.id || c) : [])
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
    
    // Use originalStatus if available, otherwise fall back to status
    const productStatus = product.originalStatus || product.status;
    
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        matchesStatus = productStatus === 'APPROVED';
      } else if (filterStatus === 'inactive') {
        matchesStatus = productStatus !== 'APPROVED' && productStatus !== 'DISCONTINUED';
      } else if (filterStatus === 'discontinued') {
        matchesStatus = productStatus === 'DISCONTINUED';
      } else {
        matchesStatus = product.status === filterStatus;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (product) => {
    // Set editing product and open modal
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      try {
        await sellerApi.deleteProduct(product.id);
        alert('Sản phẩm đã được xóa thành công');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Không thể xóa sản phẩm: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleView = (product) => {
    // Navigate to product detail page using product ID
    window.open(`/product/${product.id}`, '_blank');
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
    
    // Validate required fields
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate at least one image
    if (!formData.images || formData.images.length === 0) {
      alert('Vui lòng thêm ít nhất một hình ảnh');
      return;
    }

    try {
      setSubmitting(true);
      
      // Generate slug from name (simple version - backend can also handle this)
      const generateSlug = (name) => {
        return name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      };

      // Prepare data for API
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description.trim() || null,
        images: formData.images,
        slug: editingProduct ? editingProduct.slug : generateSlug(formData.name),
        categoryIds: formData.category ? [parseInt(formData.category)] : []
      };

      // Include status when editing (sellers can change status between APPROVED, OUT_OF_STOCK, DISCONTINUED)
      if (editingProduct && formData.status) {
        productData.status = formData.status;
      }

      let response;
      if (editingProduct) {
        // Update existing product
        response = await sellerApi.updateProduct(editingProduct.id, productData);
      } else {
        // Create new product
        response = await sellerApi.createProduct(productData);
      }
      
      if (response.data.success) {
        alert(editingProduct 
          ? 'Sản phẩm đã được cập nhật thành công!' 
          : 'Sản phẩm đã được tạo thành công! Đang chờ phê duyệt từ quản trị viên.');
        // Reset form
        setFormData({
          name: '',
          price: '',
          stock: '',
          category: '',
          description: '',
          images: [],
          status: 'PENDING'
        });
        setImageUrl('');
        setEditingProduct(null);
        setShowAddModal(false);
        // Refresh product list
        await fetchProducts();
      } else {
        alert('Không thể ' + (editingProduct ? 'cập nhật' : 'tạo') + ' sản phẩm: ' + (response.data.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo sản phẩm. Vui lòng thử lại.';
      alert('Lỗi: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
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

  // Update form when editing product
  useEffect(() => {
    if (editingProduct && showAddModal) {
      setFormData({
        name: editingProduct.name || '',
        price: editingProduct.price ? editingProduct.price.toString() : '',
        stock: editingProduct.stock ? editingProduct.stock.toString() : '',
        category: editingProduct.categoryIds?.[0]?.toString() || editingProduct.categories?.[0]?.id?.toString() || '',
        description: editingProduct.description || '',
        images: editingProduct.images || [],
        status: editingProduct.originalStatus || editingProduct.status || 'PENDING'
      });
    } else if (!editingProduct && showAddModal) {
      // Reset form for new product
      setFormData({
        name: '',
        price: '',
        stock: '',
        category: '',
        description: '',
        images: [],
        status: 'PENDING' // New products always start as PENDING
      });
      setImageUrl('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddModal]);

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
              <option value="active">Đã duyệt</option>
              <option value="inactive">Chờ duyệt/Từ chối</option>
              <option value="discontinued">Ngừng bán</option>
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            
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

              {/* Status field - only show when editing */}
              {editingProduct && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={formData.status === 'PENDING' || formData.status === 'REJECTED'}
                  >
                    {formData.status === 'PENDING' && (
                      <option value="PENDING">Chờ duyệt (Chỉ admin có thể thay đổi)</option>
                    )}
                    {formData.status === 'REJECTED' && (
                      <option value="REJECTED">Đã từ chối (Chỉ admin có thể thay đổi)</option>
                    )}
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                    <option value="DISCONTINUED">Ngừng bán</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Bạn có thể thay đổi trạng thái giữa "Đã duyệt", "Hết hàng" và "Ngừng bán". Trạng thái "Chờ duyệt" và "Đã từ chối" chỉ có thể được thay đổi bởi quản trị viên.
                  </p>
                </div>
              )}
            
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formData.images.length === 0 || submitting}
                >
                  {submitting ? (editingProduct ? 'Đang cập nhật...' : 'Đang thêm...') : (editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm')}
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
