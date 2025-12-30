import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  User,
  Phone,
  MapPin,
  Store
} from 'lucide-react';

// Helper functions moved outside component to be accessible everywhere
const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
    case 'SHIPPING': return 'bg-purple-100 text-purple-800';
    case 'DELIVERED': return 'bg-green-100 text-green-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status) => {
  if (!status) return 'N/A';
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'PENDING': return 'Chờ xác nhận';
    case 'CONFIRMED': return 'Đã xác nhận';
    case 'SHIPPING': return 'Đang giao';
    case 'DELIVERED': return 'Đã giao';
    case 'CANCELLED': return 'Đã hủy';
    default: return status;
  }
};

const getStatusIcon = (status) => {
  if (!status) return Clock;
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'PENDING': return Clock;
    case 'CONFIRMED': return CheckCircle;
    case 'SHIPPING': return Truck;
    case 'DELIVERED': return Package;
    case 'CANCELLED': return XCircle;
    default: return Clock;
  }
};

const OrderCard = ({ order, onView, onEdit }) => {

  const StatusIcon = getStatusIcon(order.orderStatus);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Đơn hàng #{order.id}</h3>
            <p className="text-sm text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.orderStatus)}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{getStatusText(order.orderStatus)}</span>
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onView(order)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(order)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Khách hàng:</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{order.customerName || 'N/A'}</span>
        </div>

        {order.customerPhone && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">SĐT:</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{order.customerPhone}</span>
          </div>
        )}

        {order.sellerName && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Seller:</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{order.sellerName}</span>
          </div>
        )}

        {order.shippingAddress && (
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-600">Địa chỉ:</span>
            </div>
            <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{order.shippingAddress}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sản phẩm:</span>
            <span className="text-sm font-medium text-gray-900">{order.orderItems?.length || 0} sản phẩm</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-600">Tổng tiền:</span>
            <span className="text-lg font-bold text-orange-600">{order.totalAmount?.toLocaleString() || 0}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllOrders(page, 10);
      const data = response.data.data;
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchQuery) ||
                         order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerPhone?.includes(searchQuery) ||
                         order.sellerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         order.orderStatus?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleView = (order) => {
    setSelectedOrder(order);
  };

  const handleEdit = (order) => {
    console.log('Edit order:', order);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus?.toUpperCase() === 'PENDING').length,
    confirmed: orders.filter(o => o.orderStatus?.toUpperCase() === 'CONFIRMED').length,
    shipping: orders.filter(o => o.orderStatus?.toUpperCase() === 'SHIPPING').length,
    delivered: orders.filter(o => o.orderStatus?.toUpperCase() === 'DELIVERED').length,
    cancelled: orders.filter(o => o.orderStatus?.toUpperCase() === 'CANCELLED').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đã xác nhận</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Truck className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đang giao</p>
              <p className="text-2xl font-bold text-gray-900">{stats.shipping}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đã giao</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
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
                placeholder="Tìm kiếm đơn hàng, khách hàng, seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="SHIPPING">Đang giao</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
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
          <p className="text-gray-500">Đang tải đơn hàng...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      )}

      {/* Orders Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onView={handleView}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Khách hàng</label>
                  <p className="text-gray-900">{selectedOrder.customerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900">{selectedOrder.customerPhone || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Seller</label>
                  <p className="text-gray-900">{selectedOrder.sellerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <p className="text-gray-900">{getStatusText(selectedOrder.orderStatus)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Địa chỉ giao hàng</label>
                <p className="text-gray-900">{selectedOrder.shippingAddress || 'N/A'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Số sản phẩm</label>
                  <p className="text-gray-900">{selectedOrder.orderItems?.length || 0} sản phẩm</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
                  <p className="text-lg font-bold text-orange-600">{selectedOrder.totalAmount?.toLocaleString() || 0}đ</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="text-gray-900">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Cập nhật trạng thái
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
