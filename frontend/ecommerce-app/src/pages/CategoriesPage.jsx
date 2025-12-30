import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '../components/ui';
import { categoryApi } from '../services/categoryApi';

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await categoryApi.getAllCategories();
        
        if (response.data.success) {
          const mappedCategories = (response.data.data || []).map(cat => ({
            id: cat.id,
            name: cat.name,
            image: cat.image || cat.imageUrl || 'https://via.placeholder.com/200',
            productCount: cat.productCount || (cat.products ? cat.products.length : 0),
            description: cat.description || '',
            slug: cat.slug
          }));
          setCategories(mappedCategories);
        } else {
          setError(response.data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories
  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'productCount':
          return b.productCount - a.productCount;
        default: // popularity
          return b.productCount - a.productCount;
      }
    });

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    // TODO: Navigate to category products page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-shopee-orange to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Danh mục sản phẩm</h1>
          <p className="text-lg opacity-90">
            {loading 
              ? 'Đang tải danh mục...' 
              : `Khám phá hàng ngàn sản phẩm trong ${categories.length} danh mục`}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-shopee-orange"
              >
                <option value="popularity">Phổ biến nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="productCount">Số lượng sản phẩm</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Tìm thấy <span className="font-semibold text-gray-900">{filteredCategories.length}</span> danh mục
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shopee-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh mục...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-400 text-6xl mb-4">⚠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div 
                  className="cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{category.description}</p>
                    )}
                    <p className="text-sm text-shopee-orange font-medium">
                      {category.productCount.toLocaleString()} sản phẩm
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy danh mục</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Thử tìm kiếm với từ khóa khác' 
                : 'Chưa có danh mục nào trong hệ thống'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;

