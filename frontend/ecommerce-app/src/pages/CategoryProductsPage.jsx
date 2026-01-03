import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ProductGrid } from '../components/product';
import { productApi } from '../services/productApi';
import { categoryApi } from '../services/categoryApi';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

const CategoryProductsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [id, page]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category details
      const categoryId = parseInt(id);
      if (!isNaN(categoryId)) {
        const categoryResponse = await categoryApi.getCategoryById(categoryId);
        if (categoryResponse.data.success) {
          setCategory(categoryResponse.data.data);
        }
      }

      // Fetch products by category
      const productsResponse = await productApi.getProductsByCategory(id, page, 12);
      if (productsResponse.data.success) {
        const productsData = productsResponse.data.data || [];
        const mappedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price ? parseFloat(product.price) : 0,
          originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
          discount: product.originalPrice && product.price 
            ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
            : 0,
          rating: product.averageRating || 0,
          reviewCount: product.reviewCount || 0,
          image: product.imageUrls && product.imageUrls.length > 0 
            ? product.imageUrls[0] 
            : product.imageUrl || 'https://via.placeholder.com/300',
          shop: product.sellerName || product.seller?.fullName || 'Shop',
          isNew: product.isNew || false,
          isHot: product.isHot || false,
          slug: product.slug
        }));
        
        setProducts(mappedProducts);
        setTotalPages(productsResponse.data.totalPages || 0);
        setTotalElements(productsResponse.data.totalElements || 0);
      } else {
        setError(productsResponse.data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching category products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
    // TODO: Implement add to cart logic
  };

  const handleToggleWishlist = (product) => {
    console.log('Toggled wishlist:', product);
    // TODO: Implement wishlist logic
  };

  const categoryName = category?.name || location.state?.categoryName || 'Danh mục';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-shopee-orange to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-4xl font-bold mb-2">{categoryName}</h1>
          <p className="text-lg opacity-90">
            {totalElements > 0 
              ? `Tìm thấy ${totalElements} sản phẩm` 
              : 'Không có sản phẩm nào trong danh mục này'}
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">{error}</div>
            <Button onClick={() => fetchCategoryAndProducts()}>
              Thử lại
            </Button>
          </div>
        ) : (
          <>
            <ProductGrid
              products={products}
              columns={5}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <span className="text-gray-600">
                  Trang {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;

