import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon,
  Save,
  Bell,
  Mail,
  Shield,
  Palette,
  Database,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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

const AdminSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Redirect to customer profile if trying to access profile tab
  useEffect(() => {
    if (location.hash === '#profile') {
      navigate('/customer/profile');
    }
  }, [location.hash, navigate]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSystemSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    }
  }, []);

  const [settings, setSettings] = useState({
    siteName: 'CNVLTW',
    siteDescription: 'Cửa hàng thương mại điện tử hàng đầu',
    contactEmail: 'admin@cnvltw.com',
    phone: '1900 1234',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    supportEmail: 'support@cnvltw.com',
    salesEmail: 'sales@cnvltw.com',
    marketingEmail: 'marketing@cnvltw.com',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordPolicy: 'strong'
    },
    appearance: {
      theme: 'light',
      primaryColor: 'orange',
      logo: null
    }
  });

  const handleSave = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      // Save to localStorage for demonstration
      localStorage.setItem('adminSystemSettings', JSON.stringify(settings));
      setMessage({ type: 'success', text: 'Cài đặt hệ thống đã được lưu thành công!' });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Lưu cài đặt thất bại. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const tabs = [
    { id: 'system', label: 'Hệ thống', icon: SettingsIcon }
  ];

  const renderSystemTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cài đặt hệ thống</h2>
          <p className="text-gray-600">Quản lý cài đặt và cấu hình hệ thống</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
        </button>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* General Settings */}
      <SettingSection title="Cài đặt chung" icon={SettingsIcon}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên trang web</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleInputChange(null, 'siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả trang web</label>
            <input
              type="text"
              value={settings.siteDescription}
              onChange={(e) => handleInputChange(null, 'siteDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleInputChange(null, 'contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange(null, 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiền tệ</label>
            <select
              value={settings.currency}
              onChange={(e) => handleInputChange(null, 'currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="VND">VND (₫)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Múi giờ</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleInputChange(null, 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
        </div>
      </SettingSection>

      {/* Contact Information */}
      <SettingSection title="Thông tin liên hệ" icon={Mail}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email hỗ trợ</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleInputChange(null, 'supportEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email bán hàng</label>
            <input
              type="email"
              value={settings.salesEmail}
              onChange={(e) => handleInputChange(null, 'salesEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email marketing</label>
            <input
              type="email"
              value={settings.marketingEmail}
              onChange={(e) => handleInputChange(null, 'marketingEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Thông báo hệ thống" icon={Bell}>
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
                onChange={(e) => {
                  handleInputChange('notifications', 'email', e.target.checked);
                  // Auto-save notifications to localStorage
                  const updatedSettings = { ...settings, notifications: { ...settings.notifications, email: e.target.checked } };
                  localStorage.setItem('adminSystemSettings', JSON.stringify(updatedSettings));
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
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
                onChange={(e) => {
                  handleInputChange('notifications', 'sms', e.target.checked);
                  // Auto-save notifications to localStorage
                  const updatedSettings = { ...settings, notifications: { ...settings.notifications, sms: e.target.checked } };
                  localStorage.setItem('adminSystemSettings', JSON.stringify(updatedSettings));
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Push notification</p>
              <p className="text-sm text-gray-500">Nhận thông báo đẩy trên trình duyệt</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => {
                  handleInputChange('notifications', 'push', e.target.checked);
                  // Auto-save notifications to localStorage
                  const updatedSettings = { ...settings, notifications: { ...settings.notifications, push: e.target.checked } };
                  localStorage.setItem('adminSystemSettings', JSON.stringify(updatedSettings));
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>
      </SettingSection>

      {/* Security Settings */}
      <SettingSection title="Bảo mật hệ thống" icon={Shield}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Xác thực 2 yếu tố</p>
              <p className="text-sm text-gray-500">Bảo mật tài khoản với 2FA</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactor}
                onChange={(e) => handleInputChange('security', 'twoFactor', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian hết phiên (phút)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={15}>15 phút</option>
              <option value={30}>30 phút</option>
              <option value={60}>1 giờ</option>
              <option value={120}>2 giờ</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chính sách mật khẩu</label>
            <select
              value={settings.security.passwordPolicy}
              onChange={(e) => handleInputChange('security', 'passwordPolicy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="weak">Yếu (6 ký tự)</option>
              <option value="medium">Trung bình (8 ký tự, số)</option>
              <option value="strong">Mạnh (8+ ký tự, số, ký tự đặc biệt)</option>
            </select>
          </div>
        </div>
      </SettingSection>

      {/* Appearance */}
      <SettingSection title="Giao diện" icon={Palette}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
            <select
              value={settings.appearance.theme}
              onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="light">Sáng</option>
              <option value="dark">Tối</option>
              <option value="auto">Tự động</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Màu chủ đạo</label>
            <select
              value={settings.appearance.primaryColor}
              onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="orange">Cam</option>
              <option value="blue">Xanh dương</option>
              <option value="green">Xanh lá</option>
              <option value="purple">Tím</option>
              <option value="red">Đỏ</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Globe className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Tải lên logo
                </button>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG tối đa 2MB</p>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* System Information */}
      <SettingSection title="Thông tin hệ thống" icon={Database}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phiên bản</label>
            <input
              type="text"
              value="v1.0.0"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cập nhật cuối</label>
            <input
              type="text"
              value="2024-01-15"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dung lượng sử dụng</label>
            <input
              type="text"
              value="2.3 GB / 10 GB"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái server</label>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-600 font-medium">Hoạt động bình thường</span>
            </div>
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
            Quản lý cài đặt hệ thống và cửa hàng
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
              {activeTab === 'system' && renderSystemTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
