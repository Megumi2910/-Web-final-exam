import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui';
import { ProductGrid, CategoryCard } from '../components/product';
import { categoryApi } from '../services/categoryApi';
import { productApi } from '../services/productApi';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesResponse = await categoryApi.getActiveCategories();
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data.map(cat => ({
          id: cat.id,
          name: cat.name,
          image: cat.image || 'https://via.placeholder.com/200',
          productCount: cat.productCount || 0,
          slug: cat.slug
        })));
      }

      // Helper function to map product data
      const mapProductData = (product) => {
        // Calculate isNew based on creation date (within 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const createdAt = product.createdAt ? new Date(product.createdAt) : null;
        const isNew = createdAt && createdAt > thirtyDaysAgo;
        
        return {
          id: product.id,
          name: product.name,
          price: product.price ? parseFloat(product.price) : 0,
          originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
          discount: product.originalPrice && product.price 
            ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
            : 0,
          rating: product.averageRating || 0,
          reviewCount: product.reviewCount || 0,
          image: product.images && product.images.length > 0 
            ? product.images[0] 
            : product.imageUrls && product.imageUrls.length > 0 
              ? product.imageUrls[0] 
              : product.imageUrl || 'https://via.placeholder.com/300',
          shop: product.sellerName || product.seller?.fullName || 'Shop',
          isNew: isNew,
          slug: product.slug
        };
      };

      // Fetch featured products
      const featuredResponse = await productApi.getFeaturedProducts(8);
      if (featuredResponse.data.success) {
        const products = featuredResponse.data.data || [];
        setFeaturedProducts(products.map(mapProductData));
      }

      // Fetch hot products (based on soldCount)
      const hotResponse = await productApi.getHotProducts(8);
      if (hotResponse.data.success) {
        const products = hotResponse.data.data || [];
        setHotProducts(products.map(mapProductData));
      }

      // Fetch new products
      const newResponse = await productApi.getNewProducts(8);
      if (newResponse.data.success) {
        const products = newResponse.data.data || [];
        setNewProducts(products.map(mapProductData));
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Static banners (can be moved to API later)
  const banners = [
    {
      id: 1,
      title: 'Siêu Sale 11.11',
      subtitle: 'Giảm giá lên đến 70%',
      image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&h=400&fit=crop',
      buttonText: 'Mua ngay',
      buttonLink: '#'
    },
    {
      id: 2,
      title: 'Thời trang mới',
      subtitle: 'Bộ sưu tập 2024',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=400&fit=crop',
      buttonText: 'Khám phá',
      buttonLink: '#'
    },
    {
      id: 3,
      title: 'Điện tử công nghệ',
      subtitle: 'Sản phẩm mới nhất',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop',
      buttonText: 'Xem thêm',
      buttonLink: '#'
    }
  ];


  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
    // TODO: Implement add to cart logic
  };

  const handleToggleWishlist = (product) => {
    setWishlistItems(prev => 
      prev.includes(product.id) 
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
    );
  };

  const handleCategoryClick = (category) => {
    if (category && category.id) {
      navigate(`/category/${category.id}`, { 
        state: { categoryName: category.name } 
      });
    } else if (category && category.slug) {
      navigate(`/category/${category.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative">
        <div className="relative h-96 overflow-hidden">
          <img
            src={banners[currentBanner].image}
            alt={banners[currentBanner].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Banner content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {banners[currentBanner].title}
                </h1>
                <p className="text-xl text-white mb-8">
                  {banners[currentBanner].subtitle}
                </p>
                <Button size="lg" className="shopee-gradient">
                  {banners[currentBanner].buttonText}
                </Button>
              </div>
            </div>
          </div>

          {/* Banner navigation */}
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Banner indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentBanner ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-shopee-orange/10 p-3 rounded-full">
                <Truck className="w-6 h-6 text-shopee-orange" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Miễn phí vận chuyển</div>
                <div className="text-sm text-gray-500">Đơn hàng từ 99k</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-shopee-orange/10 p-3 rounded-full">
                <RotateCcw className="w-6 h-6 text-shopee-orange" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Đổi trả dễ dàng</div>
                <div className="text-sm text-gray-500">Trong 7 ngày</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-shopee-orange/10 p-3 rounded-full">
                <Shield className="w-6 h-6 text-shopee-orange" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Bảo hành chính hãng</div>
                <div className="text-sm text-gray-500">100% uy tín</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-shopee-orange/10 p-3 rounded-full">
                <Star className="w-6 h-6 text-shopee-orange" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Đánh giá cao</div>
                <div className="text-sm text-gray-500">4.8/5 sao</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Danh mục sản phẩm</h2>
            <p className="text-gray-600">Khám phá hàng ngàn sản phẩm chất lượng</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sản phẩm nổi bật</h2>
            <p className="text-gray-600">Những sản phẩm được yêu thích nhất</p>
          </div>
          
          <ProductGrid
            products={featuredProducts}
            columns={4}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistItems={wishlistItems}
          />
        </div>
      </section>

      {/* Hot Products */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sản phẩm hot</h2>
            <p className="text-gray-600">Sản phẩm bán chạy nhất</p>
          </div>
          
          <ProductGrid
            products={hotProducts}
            columns={4}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistItems={wishlistItems}
            isHot={true}
          />
        </div>
      </section>

      {/* New Products */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sản phẩm mới</h2>
            <p className="text-gray-600">Những sản phẩm mới nhất</p>
          </div>
          
          <ProductGrid
            products={newProducts}
            columns={4}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistItems={wishlistItems}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
