import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Crown
} from 'lucide-react';

// Helper functions moved outside component to be accessible everywhere
const getRoleColor = (role) => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800';
    case 'seller': return 'bg-blue-100 text-blue-800';
    case 'customer': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRoleText = (roles) => {
  if (!roles || roles.length === 0) return 'N/A';
  if (roles.includes('ADMIN')) return 'Quản trị viên';
  if (roles.includes('SELLER')) return 'Người bán';
  if (roles.includes('CUSTOMER')) return 'Khách hàng';
  return roles.join(', ');
};

const getRoleIcon = (roles) => {
  if (!roles || roles.length === 0) return Users;
  if (roles.includes('ADMIN')) return Crown;
  if (roles.includes('SELLER')) return Shield;
  return Users;
};

const UserCard = ({ user, onView, onEdit, onDelete }) => {

  const RoleIcon = getRoleIcon(user.roles);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(user)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Vai trò:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRoleColor(user.roles?.[0]?.toLowerCase() || 'customer')}`}>
            <RoleIcon className="w-3 h-3" />
            <span>{getRoleText(user.roles)}</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.enabled !== false
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {user.enabled !== false ? 'Hoạt động' : 'Bị khóa'}
          </span>
        </div>

        {user.phoneNumber && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Số điện thoại:</span>
            <span className="text-sm font-medium text-gray-900">{user.phoneNumber}</span>
          </div>
        )}

        {user.createdAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Ngày tham gia:</span>
            <span className="text-sm font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllUsers(page, 20);
      const data = response.data.data;
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      // If endpoint doesn't exist, show empty state
      if (err.response?.status === 404) {
        setError('Tính năng này chưa được triển khai. Vui lòng thêm endpoint GET /api/users vào backend.');
      } else {
        setError('Không thể tải danh sách người dùng');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phoneNumber?.includes(searchQuery);
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'admin' && user.roles?.includes('ADMIN')) ||
                       (filterRole === 'seller' && user.roles?.includes('SELLER')) ||
                       (filterRole === 'customer' && user.roles?.includes('CUSTOMER'));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.enabled !== false) ||
                         (filterStatus === 'inactive' && user.enabled === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleView = (user) => {
    setSelectedUser(user);
  };

  const handleEdit = (user) => {
    console.log('Edit user:', user);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}"?`)) {
      console.log('Delete user:', user);
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.enabled !== false).length,
    inactive: users.filter(u => u.enabled === false).length,
    customers: users.filter(u => u.roles?.includes('CUSTOMER')).length,
    sellers: users.filter(u => u.roles?.includes('SELLER')).length,
    admins: users.filter(u => u.roles?.includes('ADMIN')).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
          <UserPlus className="w-4 h-4" />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Bị khóa</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Khách hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Người bán</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sellers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Quản trị</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
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
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="seller">Người bán</option>
              <option value="customer">Khách hàng</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Bị khóa</option>
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
          <p className="text-gray-500">Đang tải người dùng...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng</h3>
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chi tiết người dùng</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedUser.firstName?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.email}</h4>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900">{selectedUser.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vai trò</label>
                  <p className="text-gray-900">{getRoleText(selectedUser.roles)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <p className="text-gray-900">
                    {selectedUser.enabled !== false ? 'Hoạt động' : 'Bị khóa'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tham gia</label>
                  <p className="text-gray-900">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
