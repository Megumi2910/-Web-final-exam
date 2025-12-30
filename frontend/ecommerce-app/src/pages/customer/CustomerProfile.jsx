import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera,
  Edit2,
  Save,
  X,
  Shield,
  Bell,
  Globe,
  Lock
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/userApi';
import { orderApi } from '../../services/orderApi';

const CustomerProfile = () => {
  const { user: authUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [orderStats, setOrderStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    shippingCount: 0,
    completedCount: 0,
    cancelledCount: 0
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchOrderStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userApi.getProfile();
      if (response.data.success) {
        const userData = response.data.data;
        setProfileData(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Fallback to auth context user data
      if (authUser) {
        setFormData({
          firstName: authUser.firstName || '',
          lastName: authUser.lastName || '',
          email: authUser.email || '',
          phoneNumber: authUser.phoneNumber || '',
          address: authUser.address || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatistics = async () => {
    try {
      const response = await orderApi.getOrderStatistics();
      if (response.data.success) {
        const stats = response.data.data;
        setOrderStats({
          totalCount: stats.totalCount || 0,
          pendingCount: stats.pendingCount || 0,
          shippingCount: stats.shippingCount || 0,
          completedCount: stats.completedCount || 0,
          cancelledCount: stats.cancelledCount || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch order statistics:', error);
    }
  };

  const sections = [
    { key: 'personal', label: 'Thông tin cá nhân', icon: User },
    { key: 'security', label: 'Bảo mật', icon: Shield },
    { key: 'notifications', label: 'Thông báo', icon: Bell },
    { key: 'preferences', label: 'Tùy chỉnh', icon: Globe }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await userApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      // Refresh user data in auth context
      await refreshUser();
      setIsEditing(false);
      // Refetch profile to get updated data
      await fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật hồ sơ');
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || ''
      });
    } else if (authUser) {
      setFormData({
        firstName: authUser.firstName || '',
        lastName: authUser.lastName || '',
        email: authUser.email || '',
        phoneNumber: authUser.phoneNumber || '',
        address: authUser.address || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Người dùng';
  const displayInitial = formData.firstName?.charAt(0)?.toUpperCase() || formData.lastName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hồ sơ của tôi</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Menu */}
        <Card padding="none" className="lg:col-span-1 h-fit">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Cài đặt tài khoản</h3>
          </div>
          <nav className="py-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={clsx(
                    'flex items-center space-x-3 w-full px-4 py-3 text-sm transition-colors',
                    activeSection === section.key
                      ? 'bg-orange-50 text-shopee-orange border-r-4 border-shopee-orange font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Personal Information */}
          {activeSection === 'personal' && (
            <>
              {/* Profile Card */}
              <Card>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Thông tin cá nhân
                    </h2>
                    <p className="text-gray-600">
                      Quản lý thông tin cá nhân để bảo mật tài khoản
                    </p>
                  </div>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancel}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Hủy
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={handleSave}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Lưu
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-shopee-orange to-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {displayInitial}
                      </div>
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shopee-shadow flex items-center justify-center text-shopee-orange hover:bg-gray-50 transition-colors">
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{fullName}</div>
                      {profileData?.role === 'ADMIN' && (
                        <Badge variant="primary" size="sm" className="mt-1">
                          Quản trị viên
                        </Badge>
                      )}
                      {profileData?.role === 'SELLER' && (
                        <Badge variant="primary" size="sm" className="mt-1">
                          Người bán
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={clsx(
                              'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange',
                              isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                            )}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={clsx(
                              'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange',
                              isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={clsx(
                              'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange',
                              isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            disabled={true}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg"
                            placeholder="Chưa cập nhật"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Số điện thoại không thể thay đổi tại đây</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={true}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg"
                        placeholder="Chưa cập nhật"
                      />
                      <p className="text-xs text-gray-500 mt-1">Địa chỉ không thể thay đổi tại đây</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats Card */}
              <Card>
                <Card.Header>
                  <Card.Title>Thống kê tài khoản</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{orderStats.totalCount}</div>
                      <div className="text-sm text-gray-600">Đơn hàng</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-1">{orderStats.completedCount}</div>
                      <div className="text-sm text-gray-600">Đã hoàn thành</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-shopee-orange mb-1">{orderStats.pendingCount + orderStats.shippingCount}</div>
                      <div className="text-sm text-gray-600">Đang xử lý</div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-shopee-orange" />
                  <div>
                    <Card.Title>Bảo mật tài khoản</Card.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      Quản lý mật khẩu và cài đặt bảo mật
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-shopee-orange transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Mật khẩu</div>
                        <div className="text-sm text-gray-500">Đổi mật khẩu định kỳ để bảo mật</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Thay đổi</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-shopee-orange transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Xác thực 2 bước</div>
                        <div className="text-sm text-gray-500">Bảo vệ tài khoản với mã OTP</div>
                      </div>
                    </div>
                    <Badge variant="success">Đã bật</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-shopee-orange transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Email xác thực</div>
                        <div className="text-sm text-gray-500">Đã xác thực: {formData.email}</div>
                      </div>
                    </div>
                    <Badge variant="success">Đã xác thực</Badge>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-shopee-orange" />
                  <div>
                    <Card.Title>Cài đặt thông báo</Card.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      Quản lý cách bạn nhận thông báo
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {[
                    { label: 'Đơn hàng và giao hàng', description: 'Thông báo về trạng thái đơn hàng', checked: true },
                    { label: 'Khuyến mãi', description: 'Thông báo về chương trình khuyến mãi', checked: true },
                    { label: 'Cập nhật sản phẩm', description: 'Thông báo sản phẩm mới và giảm giá', checked: false },
                    { label: 'Tin nhắn', description: 'Thông báo tin nhắn từ người bán', checked: true },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-shopee-orange"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-shopee-orange" />
                  <div>
                    <Card.Title>Tùy chỉnh giao diện</Card.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      Cài đặt ngôn ngữ và hiển thị
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngôn ngữ
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange">
                      <option>Tiếng Việt</option>
                      <option>English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Múi giờ
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange">
                      <option>GMT+7 (Hanoi, Bangkok)</option>
                      <option>GMT+8 (Singapore)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đơn vị tiền tệ
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shopee-orange">
                      <option>VNĐ (₫)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>

                  <Button variant="primary">Lưu thay đổi</Button>
                </div>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;

