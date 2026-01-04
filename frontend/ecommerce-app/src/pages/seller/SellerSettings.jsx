import React, { useState, useEffect } from 'react';
import { 
  Bell,
  CreditCard,
  Store,
  Save,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';
import { sellerApi } from '../../services/sellerApi';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../../components/settings/ProfileSettings';

const SettingSection = ({ title, icon: Icon, children }) => {
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

const SellerSettings = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('shop');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [shopInfo, setShopInfo] = useState({
    storeName: user?.storeName || '',
    storeDescription: user?.storeDescription || '',
    storeAddress: user?.storeAddress || ''
  });

  const [settings, setSettings] = useState({
    payment: {
      bankAccount: '1234567890',
      bankName: 'Vietcombank',
      paypalEmail: '',
      stripeEnabled: false
    },
    notifications: {
      email: true,
      sms: false,
      orderUpdates: true,
      customerMessages: true,
      lowStock: true,
      newReviews: true
    }
  });

  useEffect(() => {
    if (user) {
      setShopInfo({
        storeName: user.storeName || '',
        storeDescription: user.storeDescription || '',
        storeAddress: user.storeAddress || ''
      });
    }
  }, [user]);

  const tabs = [
    { id: 'shop', label: 'Cửa hàng', icon: Store },
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'payment', label: 'Thanh toán', icon: CreditCard }
  ];

  const handleShopSave = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      await sellerApi.updateProfile({
        storeName: shopInfo.storeName,
        storeDescription: shopInfo.storeDescription,
        storeAddress: shopInfo.storeAddress
      });
      setMessage({ type: 'success', text: 'Cập nhật thông tin cửa hàng thành công!' });
      await refreshUser();
    } catch (error) {
      console.error('Error updating shop info:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Cập nhật thông tin cửa hàng thất bại. Vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Here you would typically save to backend
    alert('Cài đặt đã được lưu thành công!');
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };


  const renderShopTab = () => (
    <div className="space-y-6">
      <SettingSection title="Thông tin cửa hàng" icon={Store}>
        <form onSubmit={(e) => { e.preventDefault(); handleShopSave(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên cửa hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={shopInfo.storeName}
              onChange={(e) => setShopInfo(prev => ({ ...prev, storeName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập tên cửa hàng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả cửa hàng
            </label>
            <textarea
              rows={4}
              value={shopInfo.storeDescription}
              onChange={(e) => setShopInfo(prev => ({ ...prev, storeDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Mô tả về cửa hàng của bạn..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ cửa hàng
            </label>
            <textarea
              rows={2}
              value={shopInfo.storeAddress}
              onChange={(e) => setShopInfo(prev => ({ ...prev, storeAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập địa chỉ cửa hàng"
            />
            <p className="mt-1 text-xs text-gray-500">Địa chỉ cửa hàng (khác với địa chỉ nhận hàng của bạn)</p>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : 'Lưu thông tin'}</span>
            </button>
          </div>
        </form>
      </SettingSection>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <SettingSection title="Thông báo" icon={Bell}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email thông báo</p>
              <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">SMS thông báo</p>
              <p className="text-sm text-gray-500">Nhận thông báo qua SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => handleInputChange('notifications', 'sms', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Cập nhật đơn hàng</p>
              <p className="text-sm text-gray-500">Thông báo khi có cập nhật đơn hàng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.orderUpdates}
                onChange={(e) => handleInputChange('notifications', 'orderUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Tin nhắn khách hàng</p>
              <p className="text-sm text-gray-500">Thông báo khi có tin nhắn mới</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.customerMessages}
                onChange={(e) => handleInputChange('notifications', 'customerMessages', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Sắp hết hàng</p>
              <p className="text-sm text-gray-500">Thông báo khi sản phẩm sắp hết hàng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.lowStock}
                onChange={(e) => handleInputChange('notifications', 'lowStock', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Đánh giá mới</p>
              <p className="text-sm text-gray-500">Thông báo khi có đánh giá mới</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.newReviews}
                onChange={(e) => handleInputChange('notifications', 'newReviews', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </SettingSection>
    </div>
  );

  const renderProfileTab = () => (
    <ProfileSettings showAddress={true} />
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      <SettingSection title="Thanh toán" icon={CreditCard}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản ngân hàng</label>
              <input
                type="text"
                value={settings.payment.bankAccount}
                onChange={(e) => handleInputChange('payment', 'bankAccount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên ngân hàng</label>
              <input
                type="text"
                value={settings.payment.bankName}
                onChange={(e) => handleInputChange('payment', 'bankName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Email</label>
            <input
              type="email"
              value={settings.payment.paypalEmail}
              onChange={(e) => handleInputChange('payment', 'paypalEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Kích hoạt Stripe</p>
              <p className="text-sm text-gray-500">Thanh toán trực tuyến qua Stripe</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payment.stripeEnabled}
                onChange={(e) => handleInputChange('payment', 'stripeEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </SettingSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý cài đặt tài khoản và cửa hàng
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 lg:p-8">
              {activeTab === 'shop' && renderShopTab()}
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'payment' && renderPaymentTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;
