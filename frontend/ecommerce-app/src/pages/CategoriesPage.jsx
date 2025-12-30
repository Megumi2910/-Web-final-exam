import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '../components/ui';

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  // Mock data for all categories
  const allCategories = [
    { id: 1, name: 'Thời trang', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop', productCount: 1250, description: 'Thời trang nam nữ, phụ kiện' },
    { id: 2, name: 'Điện tử', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop', productCount: 890, description: 'Điện thoại, laptop, phụ kiện' },
    { id: 3, name: 'Gia dụng', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop', productCount: 650, description: 'Đồ dùng nhà bếp, nội thất' },
    { id: 4, name: 'Thể thao', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop', productCount: 420, description: 'Dụng cụ thể thao, trang phục' },
    { id: 5, name: 'Làm đẹp', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop', productCount: 780, description: 'Mỹ phẩm, chăm sóc da' },
    { id: 6, name: 'Sách', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop', productCount: 320, description: 'Sách văn học, giáo khoa, manga' },
    { id: 7, name: 'Đồ chơi', image: 'https://images.unsplash.com/photo-1558060370-5397c4d1c0e1?w=200&h=200&fit=crop', productCount: 150, description: 'Đồ chơi trẻ em, mô hình' },
    { id: 8, name: 'Xe cộ', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop', productCount: 95, description: 'Phụ kiện xe, đồ chơi xe' },
    { id: 9, name: 'Thực phẩm', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop', productCount: 580, description: 'Thực phẩm khô, đồ uống' },
    { id: 10, name: 'Mẹ & Bé', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=200&fit=crop', productCount: 450, description: 'Đồ dùng cho mẹ và bé' },
    { id: 11, name: 'Giày dép', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=200&h=200&fit=crop', productCount: 680, description: 'Giày thể thao, sandal, boot' },
    { id: 12, name: 'Túi xách', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop', productCount: 390, description: 'Balo, túi xách, ví' },
    { id: 13, name: 'Đồng hồ', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&h=200&fit=crop', productCount: 280, description: 'Đồng hồ nam nữ, smartwatch' },
    { id: 14, name: 'Trang sức', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop', productCount: 210, description: 'Vòng, nhẫn, dây chuyền' },
    { id: 15, name: 'Văn phòng phẩm', image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=200&h=200&fit=crop', productCount: 340, description: 'Dụng cụ học tập, văn phòng' },
    { id: 16, name: 'Thú cưng', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200&h=200&fit=crop', productCount: 260, description: 'Đồ dùng cho thú cưng' }
  ];

  // Filter categories
  const filteredCategories = allCategories
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
          <p className="text-lg opacity-90">Khám phá hàng ngàn sản phẩm trong {allCategories.length} danh mục</p>
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
        {filteredCategories.length > 0 ? (
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
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{category.description}</p>
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
            <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;

