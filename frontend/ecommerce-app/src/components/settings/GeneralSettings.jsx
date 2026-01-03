import React, { useState } from 'react';
import { 
  Bell, 
  Shield, 
  Globe,
  Save,
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

const GeneralSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    smsNotifications: false
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });

  // Language and region
  const [preferences, setPreferences] = useState({
    language: 'vi',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh'
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePreferencesChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setMessage({ type: '', text: '' });
    setLoading(true);
    
    try {
      // TODO: Implement API call when available
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setMessage({ type: 'success', text: 'Cài đặt đã được lưu thành công!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Lưu cài đặt thất bại. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <SettingSection title="Thông báo" icon={Bell}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Thông báo qua email</p>
                <p className="text-sm text-gray-500">Nhận thông báo quan trọng qua email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={() => handleNotificationChange('emailNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Cập nhật đơn hàng</p>
                <p className="text-sm text-gray-500">Thông báo về trạng thái đơn hàng</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.orderUpdates}
                onChange={() => handleNotificationChange('orderUpdates')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Khuyến mãi và ưu đãi</p>
                <p className="text-sm text-gray-500">Nhận thông tin về khuyến mãi đặc biệt</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.promotions}
                onChange={() => handleNotificationChange('promotions')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Bản tin</p>
                <p className="text-sm text-gray-500">Nhận bản tin định kỳ qua email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.newsletter}
                onChange={() => handleNotificationChange('newsletter')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>
      </SettingSection>

      {/* Privacy Settings */}
      <SettingSection title="Quyền riêng tư" icon={Shield}>
        <div className="space-y-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Hiển thị hồ sơ
            </label>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="public">Công khai</option>
              <option value="friends">Chỉ bạn bè</option>
              <option value="private">Riêng tư</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Ai có thể xem hồ sơ của bạn
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Hiển thị email</p>
              <p className="text-sm text-gray-500">Cho phép người khác xem email của bạn</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.showEmail}
                onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Hiển thị số điện thoại</p>
              <p className="text-sm text-gray-500">Cho phép người khác xem số điện thoại của bạn</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.showPhone}
                onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Cho phép nhận tin nhắn</p>
              <p className="text-sm text-gray-500">Cho phép người khác gửi tin nhắn cho bạn</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.allowMessages}
                onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>
      </SettingSection>

      {/* Preferences */}
      <SettingSection title="Tùy chọn" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferencesChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiền tệ</label>
            <select
              value={preferences.currency}
              onChange={(e) => handlePreferencesChange('currency', e.target.value)}
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
              value={preferences.timezone}
              onChange={(e) => handlePreferencesChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
        </div>
      </SettingSection>

      {/* Save Button */}
      {message.text && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu cài đặt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;

