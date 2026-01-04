import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Star, SearchX } from 'lucide-react';
import { Input, Button } from '../components/ui';
import Toast from '../components/ui/Toast';
import { ProductGrid } from '../components/product';
import { productApi } from '../services/productApi';
import { categoryApi } from '../services/categoryApi';
import { cartApi } from '../services/cartApi';
import { useAuth } from '../context/AuthContext';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isVerified } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    rating: '',
    shipping: false,
    location: ''
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Get search query from URL on mount
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        if (response.data.success) {
          setCategories(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Helper function to map product data
  const mapProductData = (product) => ({
    id: product.id,
    name: product.name,
    price: product.price ? parseFloat(product.price) : 0,
    originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
    discount: product.discountPercentage || (product.originalPrice && product.price 
      ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
      : 0),
    rating: product.averageRating || 0,
    reviewCount: product.reviews?.length || 0,
    image: product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://via.placeholder.com/300',
    shop: product.sellerName || product.seller?.fullName || product.seller?.email || 'Shop',
    categoryIds: product.categoryIds 
      ? (Array.isArray(product.categoryIds) 
          ? product.categoryIds 
          : Array.from(product.categoryIds))
      : (product.categories && product.categories.length > 0 
          ? product.categories.map(cat => cat.id || (typeof cat === 'object' ? cat.id : cat))
          : []),
    category: product.categories && product.categories.length > 0 
      ? product.categories[0].slug || product.categories[0].name?.toLowerCase() 
      : '',
    location: '', // Not available in current Product entity
    freeShipping: false, // Not available in current Product entity
    sold: product.soldCount || 0
  });

  // Fetch products from API when search term changes
  useEffect(() => {
    const fetchProducts = async () => {
      const keyword = searchTerm.trim();
      
      try {
        setLoading(true);
        setError(null);
        
        let response;
        // If no search term, fetch all products
        if (!keyword) {
          response = await productApi.getProducts(0, 100);
        } else {
          // If there's a search term, search for products
          response = await productApi.searchProducts(keyword, 0, 100);
        }
        
        if (response.data.success) {
          const mappedProducts = (response.data.data || []).map(mapProductData);
          
          setProducts(mappedProducts);
          setTotalElements(response.data.totalElements || mappedProducts.length);
        } else {
          setError(response.data.message || 'Failed to fetch products');
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  // Apply filters on fetched products
  const filteredProducts = products.filter(product => {
    // Category filter - check if product belongs to selected category
    if (filters.category) {
      const selectedCategory = categories.find(cat => 
        (cat.slug || cat.name?.toLowerCase()) === filters.category
      );
      
      if (selectedCategory) {
        // Check by category ID (most reliable) - handle both Set and Array
        let hasCategoryId = false;
        if (product.categoryIds) {
          if (Array.isArray(product.categoryIds)) {
            hasCategoryId = product.categoryIds.includes(selectedCategory.id);
          } else if (product.categoryIds instanceof Set) {
            hasCategoryId = product.categoryIds.has(selectedCategory.id);
          } else if (typeof product.categoryIds === 'object' && product.categoryIds.size !== undefined) {
            // Handle Set-like objects
            hasCategoryId = Array.from(product.categoryIds).includes(selectedCategory.id);
          }
        }
        
        // Also check by categories array (if populated)
        let hasCategoryInList = false;
        if (product.categories && Array.isArray(product.categories)) {
          hasCategoryInList = product.categories.some(cat => 
            cat.id === selectedCategory.id || 
            (cat.slug && cat.slug === selectedCategory.slug) ||
            (cat.name && cat.name.toLowerCase() === selectedCategory.name?.toLowerCase())
          );
        }
        
        // Also check by slug/name for backward compatibility
        const hasCategorySlug = product.category === filters.category || 
          product.category?.toLowerCase() === filters.category.toLowerCase();
        
        if (!hasCategoryId && !hasCategoryInList && !hasCategorySlug) {
          return false;
        }
      } else {
        // Fallback: if category not found in list, use slug/name matching
      const categoryMatch = product.category === filters.category || 
                           product.category?.toLowerCase() === filters.category.toLowerCase();
      if (!categoryMatch) {
        return false;
        }
      }
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (max && max < 999999999) {
        if (product.price < min || product.price > max) return false;
      } else {
        if (product.price < min) return false;
      }
    }

    // Rating filter
    if (filters.rating && product.rating < Number(filters.rating)) {
      return false;
    }

    // Free shipping filter (not available in current data model, so skip for now)
    // if (filters.shipping && !product.freeShipping) {
    //   return false;
    // }

    // Location filter (not available in current data model, so skip for now)
    // if (filters.location && product.location !== filters.location) {
    //   return false;
    // }

    return true;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'sold':
        return b.sold - a.sold;
      default: // relevance
        return 0;
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      rating: '',
      shipping: false,
      location: ''
    });
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated()) {
      const currentPath = `/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      navigate('/login', { state: { from: currentPath } });
      return;
    }

    if (!isVerified()) {
      alert('Vui lòng xác thực email để thêm sản phẩm vào giỏ hàng. Kiểm tra email của bạn để xác thực tài khoản.');
      return;
    }

    try {
      await cartApi.addToCart(product.id, 1);
      setToastMessage('Đã thêm sản phẩm vào giỏ hàng!');
      setShowToast(true);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setToastMessage(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      setShowToast(true);
    }
  };

  const handleToggleWishlist = (product) => {
    setWishlistItems(prev =>
      prev.includes(product.id)
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Banner */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          duration={2000}
        />
      )}

      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 w-full"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSearchParams({});
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="bg-shopee-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Bộ lọc tìm kiếm</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shopee-orange"
                  >
                    <option value="">Tất cả</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug || cat.name.toLowerCase()}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoảng giá
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shopee-orange"
                  >
                    <option value="">Tất cả</option>
                    <option value="0-100000">Dưới 100k</option>
                    <option value="100000-500000">100k - 500k</option>
                    <option value="500000-1000000">500k - 1tr</option>
                    <option value="1000000-5000000">1tr - 5tr</option>
                    <option value="5000000-10000000">5tr - 10tr</option>
                    <option value="10000000-999999999">Trên 10tr</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá
                  </label>
                  <div className="space-y-2">
                    {[5, 4, 3].map(rating => (
                      <label key={rating} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={filters.rating === String(rating)}
                          onChange={(e) => handleFilterChange('rating', e.target.value)}
                          className="mr-2"
                        />
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">trở lên</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vị trí
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shopee-orange"
                  >
                    <option value="">Tất cả</option>
                    <option value="HCM">TP. Hồ Chí Minh</option>
                    <option value="HN">Hà Nội</option>
                  </select>
                </div>

                {/* Shipping Filter */}
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.shipping}
                      onChange={(e) => handleFilterChange('shipping', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Miễn phí vận chuyển</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Area */}
          <div className="flex-1">
            {/* Sort and Results */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {loading ? (
                  <span>Đang tìm kiếm...</span>
                ) : error ? (
                  <span className="text-red-600">{error}</span>
                ) : (
                  <>
                    {searchTerm ? (
                      <>
                        Tìm thấy <span className="font-semibold text-gray-900">{totalElements}</span> sản phẩm
                        <span> cho "<span className="font-semibold text-gray-900">{searchTerm}</span>"</span>
                        {filteredProducts.length !== totalElements && (
                          <span> (hiển thị {filteredProducts.length} sau khi lọc)</span>
                        )}
                      </>
                    ) : (
                      <>
                        Hiển thị <span className="font-semibold text-gray-900">{totalElements}</span> sản phẩm
                        {filteredProducts.length !== totalElements && (
                          <span> (hiển thị {filteredProducts.length} sau khi lọc)</span>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-shopee-orange"
                >
                  <option value="relevance">Liên quan</option>
                  <option value="sold">Bán chạy</option>
                  <option value="price-asc">Giá thấp - cao</option>
                  <option value="price-desc">Giá cao - thấp</option>
                  <option value="rating">Đánh giá</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shopee-orange mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                <div className="text-red-400 text-6xl mb-4">⚠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
                <p className="text-gray-600 mb-4">{error}</p>
              </div>
            ) : sortedProducts.length > 0 ? (
              <ProductGrid
                products={sortedProducts}
                columns={4}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlistItems={wishlistItems}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                <SearchX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    : 'Nhập từ khóa để tìm kiếm sản phẩm'}
                </p>
                {activeFilterCount > 0 && (
                  <Button onClick={clearFilters} variant="outline">
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

