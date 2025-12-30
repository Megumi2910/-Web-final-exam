import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Edit, 
  Save, 
  Upload, 
  Phone, 
  Clock, 
  Star, 
  Users, 
  Award,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { sellerApi } from '../../services/sellerApi';
import { useAuth } from '../../context/AuthContext';

const InfoCard = ({ title, icon: Icon, children }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-gray-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const SellerStore = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [storeInfo, setStoreInfo] = useState({
    name: user?.storeName || '',
    description: user?.storeDescription || '',
    address: user?.address || '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    website: '',
    businessHours: {
      monday: '8:00 - 22:00',
      tuesday: '8:00 - 22:00',
      wednesday: '8:00 - 22:00',
      thursday: '8:00 - 22:00',
      friday: '8:00 - 22:00',
      saturday: '9:00 - 21:00',
      sunday: '10:00 - 20:00'
    },
    policies: {
      returnPolicy: 'Đổi trả trong 7 ngày nếu sản phẩm còn nguyên vẹn',
      shippingPolicy: 'Miễn phí ship đơn từ 500k, giao hàng trong 24h',
      warrantyPolicy: 'Bảo hành chính hãng theo tiêu chuẩn nhà sản xuất'
    }
  });
  const [loading, setLoading] = useState(true);
  const [storeStats, setStoreStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageRating: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (user) {
      setStoreInfo(prev => ({
        ...prev,
        name: user.storeName || '',
        description: user.storeDescription || '',
        address: user.address || '',
        phone: user.phoneNumber || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await sellerApi.getStatistics();
      if (response.data.success) {
        const data = response.data.data;
        setStoreStats({
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalCustomers: data.totalCustomers || 0,
          averageRating: data.averageRating || 0,
          completionRate: data.completionRate || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch seller statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    console.log('Saving store info:', storeInfo);
    setIsEditing(false);
    // Here you would typically save to backend
    alert('Thông tin cửa hàng đã được cập nhật!');
  };

  const handleInputChange = (field, value) => {
    setStoreInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBusinessHoursChange = (day, value) => {
    setStoreInfo(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: value
      }
    }));
  };

  const handlePolicyChange = (policy, value) => {
    setStoreInfo(prev => ({
      ...prev,
      policies: {
        ...prev.policies,
        [policy]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý cửa hàng</h1>
          <p className="text-gray-600">Quản lý thông tin và cài đặt cửa hàng</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Store className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">{storeStats.totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{storeStats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Khách hàng</p>
              <p className="text-2xl font-bold text-gray-900">{storeStats.totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">{storeStats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{storeStats.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Information */}
      <InfoCard title="Thông tin cửa hàng" icon={Store}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên cửa hàng</label>
            {isEditing ? (
              <input
                type="text"
                value={storeInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{storeInfo.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả cửa hàng</label>
            {isEditing ? (
              <textarea
                rows={3}
                value={storeInfo.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{storeInfo.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo cửa hàng</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              {isEditing && (
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Tải lên logo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Contact Information */}
      <InfoCard title="Thông tin liên hệ" icon={Phone}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
            {isEditing ? (
              <input
                type="text"
                value={storeInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{storeInfo.address}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            {isEditing ? (
              <input
                type="tel"
                value={storeInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{storeInfo.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={storeInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{storeInfo.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            {isEditing ? (
              <input
                type="url"
                value={storeInfo.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{storeInfo.website}</p>
            )}
          </div>
        </div>
      </InfoCard>

      {/* Business Hours */}
      <InfoCard title="Giờ hoạt động" icon={Clock}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(storeInfo.businessHours).map(([day, hours]) => (
            <div key={day} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {day === 'monday' ? 'Thứ 2' :
                 day === 'tuesday' ? 'Thứ 3' :
                 day === 'wednesday' ? 'Thứ 4' :
                 day === 'thursday' ? 'Thứ 5' :
                 day === 'friday' ? 'Thứ 6' :
                 day === 'saturday' ? 'Thứ 7' : 'Chủ nhật'}
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => handleBusinessHoursChange(day, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="text-gray-900">{hours}</span>
              )}
            </div>
          ))}
        </div>
      </InfoCard>

      {/* Store Policies */}
      <InfoCard title="Chính sách cửa hàng" icon={AlertCircle}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chính sách đổi trả</label>
            {isEditing ? (
              <textarea
                rows={2}
                value={storeInfo.policies.returnPolicy}
                onChange={(e) => handlePolicyChange('returnPolicy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{storeInfo.policies.returnPolicy}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chính sách vận chuyển</label>
            {isEditing ? (
              <textarea
                rows={2}
                value={storeInfo.policies.shippingPolicy}
                onChange={(e) => handlePolicyChange('shippingPolicy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{storeInfo.policies.shippingPolicy}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chính sách bảo hành</label>
            {isEditing ? (
              <textarea
                rows={2}
                value={storeInfo.policies.warrantyPolicy}
                onChange={(e) => handlePolicyChange('warrantyPolicy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{storeInfo.policies.warrantyPolicy}</p>
            )}
          </div>
        </div>
      </InfoCard>
    </div>
  );
};

export default SellerStore;
