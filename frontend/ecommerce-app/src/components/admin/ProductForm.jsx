import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Store } from 'lucide-react';
import { categoryApi } from '../../services/categoryApi';

const ProductForm = ({ product, onClose, onSave, isAdmin = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    sku: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: 0,
    images: [],
    categories: [],
    isFeatured: false,
    status: 'PENDING'
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price ? parseFloat(product.price).toString() : '',
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice).toString() : '',
        stock: product.stock || 0,
        images: product.images || [],
        categories: product.categories || [],
        isFeatured: product.isFeatured || false,
        status: product.status || 'PENDING'
      });
      // Handle both categoryIds (Set/Array) and categories (array of objects)
      if (product.categoryIds) {
        // categoryIds can be Set or Array
        const categoryIdsArray = Array.isArray(product.categoryIds) 
          ? product.categoryIds 
          : Array.from(product.categoryIds || []);
        setSelectedCategories(categoryIdsArray);
      } else if (product.categories && Array.isArray(product.categories)) {
        // categories is array of objects with id property
        setSelectedCategories(product.categories.map(c => c.id || c));
      }
    } else if (isAdmin) {
      // Auto-approve for admin
      setFormData(prev => ({ ...prev, status: 'APPROVED' }));
    }
  }, [product, isAdmin]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryApi.getAllCategoriesAdmin();
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Set selected categories when both product and categories are available
  // This runs after categories are loaded to ensure proper initialization
  useEffect(() => {
    if (product && categories.length > 0) {
      // Handle both categoryIds (Set/Array) and categories (array of objects)
      let categoryIdsToSet = [];
      
      if (product.categoryIds) {
        // categoryIds can be Set or Array
        categoryIdsToSet = Array.isArray(product.categoryIds) 
          ? product.categoryIds 
          : Array.from(product.categoryIds || []);
      } else if (product.categories && Array.isArray(product.categories)) {
        // categories is array of objects with id property
        categoryIdsToSet = product.categories.map(c => c.id || c);
      }
      
      // Set categories if we found any
      if (categoryIdsToSet.length > 0) {
        setSelectedCategories(prev => {
          // Only update if different to avoid unnecessary re-renders
          const prevSorted = [...prev].sort((a, b) => a - b).join(',');
          const newSorted = [...categoryIdsToSet].sort((a, b) => a - b).join(',');
          return prevSorted === newSorted ? prev : categoryIdsToSet;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, categories.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Giá sản phẩm phải lớn hơn 0';
    }
    
    if (formData.stock < 0) {
      newErrors.stock = 'Số lượng tồn kho không được âm';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'Vui lòng thêm ít nhất một hình ảnh';
    }
    
    if (selectedCategories.length === 0) {
      newErrors.categories = 'Vui lòng chọn ít nhất một danh mục';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      
      // Prepare data for API
      const submitData = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || null,
        sku: formData.sku.trim() || null,
        slug: product?.slug || generateSlug(formData.name),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock) || 0,
        images: formData.images,
        isFeatured: formData.isFeatured,
        // Don't send status in regular updates - status should only be changed via approve/reject endpoints
        // This prevents accidental status reverts when editing other product fields
        // status: formData.status, // Removed to prevent accidental status changes
        categories: selectedCategories.map(id => ({ id }))
      };

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Không thể lưu sản phẩm: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="Ví dụ: iPhone 15 Pro Max"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thương hiệu
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ví dụ: Apple"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU (Mã sản phẩm)
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ví dụ: IPH15PM256"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Mô tả chi tiết về sản phẩm..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Giá và tồn kho</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá bán <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="0"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                {formData.price && (
                  <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(formData.price || 0).toLocaleString('vi-VN')} đ
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá nhập hàng
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.originalPrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="0"
                />
                {errors.originalPrice && <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>}
                {formData.originalPrice && (
                  <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(formData.originalPrice || 0).toLocaleString('vi-VN')} đ
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tồn kho <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="0"
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>
            </div>
          </div>

          {/* Shop Information (Admin only, when editing existing product) */}
          {isAdmin && product && (product.sellerName || product.sellerId) && (
            <div className="border-b pb-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Store className="w-5 h-5 mr-2 text-orange-600" />
                Thông tin cửa hàng
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {product.sellerName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên cửa hàng
                    </label>
                    <div className="text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2">
                      {product.sellerName}
                    </div>
                  </div>
                )}
                {product.sellerEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email cửa hàng
                    </label>
                    <div className="text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2">
                      {product.sellerEmail}
                    </div>
                  </div>
                )}
                {product.sellerId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID cửa hàng
                    </label>
                    <div className="text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2">
                      {product.sellerId}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Danh mục <span className="text-red-500">*</span>
            </h4>
            
            {loadingCategories ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Đang tải danh mục...</p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có danh mục nào. Vui lòng tạo danh mục trước.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label
                        key={category.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                        {!category.isActive && (
                          <span className="text-xs text-gray-400">(Tạm dừng)</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
          </div>

          {/* Images */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Hình ảnh <span className="text-red-500">*</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Nhập URL hình ảnh"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            </div>
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
          </div>

          {/* Flags */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Tùy chọn</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Lưu ý: Sản phẩm hot được xác định tự động dựa trên số lượng bán (soldCount). Sản phẩm mới được xác định tự động dựa trên ngày tạo (trong vòng 30 ngày).
            </p>

            {isAdmin && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="APPROVED">Đã duyệt</option>
                  <option value="REJECTED">Đã từ chối</option>
                  <option value="OUT_OF_STOCK">Hết hàng</option>
                  <option value="DISCONTINUED">Ngừng bán</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{product ? 'Cập nhật' : 'Thêm sản phẩm'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

