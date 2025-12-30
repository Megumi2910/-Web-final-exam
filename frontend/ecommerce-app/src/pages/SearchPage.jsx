import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Star } from 'lucide-react';
import { Input, Button } from '../components/ui';
import { ProductGrid } from '../components/product';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Get search query from URL on mount
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Mock all products
  const allProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB - Chính hãng VN/A',
      price: 29990000,
      originalPrice: 32990000,
      discount: 9,
      rating: 4.8,
      reviewCount: 256,
      image: 'https://images.unsplash.com/photo-1592899677975-4028a4aaf2dd?w=300&h=300&fit=crop',
      shop: 'Tech World',
      category: 'electronics',
      location: 'HCM',
      freeShipping: true,
      sold: 523
    },
    {
      id: 2,
      name: 'Áo thun nam cotton cao cấp',
      price: 199000,
      originalPrice: 299000,
      discount: 33,
      rating: 4.5,
      reviewCount: 128,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      shop: 'Fashion Store',
      category: 'fashion',
      location: 'HN',
      freeShipping: false,
      sold: 1234
    },
    {
      id: 3,
      name: 'Nike Air Max 270 - Giày thể thao',
      price: 2490000,
      originalPrice: 2990000,
      discount: 17,
      rating: 4.6,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      shop: 'Shoe Store',
      category: 'fashion',
      location: 'HCM',
      freeShipping: true,
      sold: 456
    },
    {
      id: 4,
      name: 'Laptop Dell XPS 13 - i7 16GB RAM',
      price: 25990000,
      originalPrice: 29990000,
      discount: 13,
      rating: 4.7,
      reviewCount: 45,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop',
      shop: 'Computer Hub',
      category: 'electronics',
      location: 'HCM',
      freeShipping: true,
      sold: 89
    },
    {
      id: 5,
      name: 'Túi xách nữ da thật cao cấp',
      price: 890000,
      originalPrice: 1290000,
      discount: 31,
      rating: 4.4,
      reviewCount: 67,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      shop: 'Bag Store',
      category: 'fashion',
      location: 'HN',
      freeShipping: false,
      sold: 234
    },
    {
      id: 6,
      name: 'Nồi chiên không dầu 5L',
      price: 1290000,
      originalPrice: 2590000,
      discount: 50,
      rating: 4.7,
      reviewCount: 189,
      image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&h=300&fit=crop',
      shop: 'Kitchen Store',
      category: 'home',
      location: 'HCM',
      freeShipping: true,
      sold: 890
    },
    {
      id: 7,
      name: 'Đồng hồ thông minh Xiaomi Band 8',
      price: 790000,
      originalPrice: 1190000,
      discount: 34,
      rating: 4.4,
      reviewCount: 234,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      shop: 'Xiaomi Store',
      category: 'electronics',
      location: 'HN',
      freeShipping: false,
      sold: 2890
    },
    {
      id: 8,
      name: 'Sách "Đắc Nhân Tâm" - Bìa cứng',
      price: 89000,
      originalPrice: 129000,
      discount: 31,
      rating: 4.9,
      reviewCount: 567,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
      shop: 'Book Store',
      category: 'books',
      location: 'HCM',
      freeShipping: true,
      sold: 3456
    }
  ];

  // Apply filters
  const filteredProducts = allProducts.filter(product => {
    // Search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (max) {
        if (product.price < min || product.price > max) return false;
      } else {
        if (product.price < min) return false;
      }
    }

    // Rating filter
    if (filters.rating && product.rating < Number(filters.rating)) {
      return false;
    }

    // Free shipping filter
    if (filters.shipping && !product.freeShipping) {
      return false;
    }

    // Location filter
    if (filters.location && product.location !== filters.location) {
      return false;
    }

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

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
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
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                    <option value="electronics">Điện tử</option>
                    <option value="fashion">Thời trang</option>
                    <option value="home">Gia dụng</option>
                    <option value="books">Sách</option>
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
                Tìm thấy <span className="font-semibold text-gray-900">{sortedProducts.length}</span> sản phẩm
                {searchTerm && (
                  <span> cho "<span className="font-semibold text-gray-900">{searchTerm}</span>"</span>
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
            {sortedProducts.length > 0 ? (
              <ProductGrid
                products={sortedProducts}
                columns={4}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlistItems={wishlistItems}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
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

