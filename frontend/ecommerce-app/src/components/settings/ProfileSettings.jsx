import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/userApi';

const ProfileSettings = ({ showAddress = true }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form state - only address is editable
  const [profileData, setProfileData] = useState({
    address: user?.address || ''
  });

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await userApi.updateProfile({
        address: profileData.address
      });
      setMessage({ type: 'success', text: 'Cập nhật địa chỉ thành công!' });
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu phải khớp nhau' });
      return;
    }

    setLoading(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!', source: 'password' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      
      let translatedMessage = errorMessage;
      if (errorMessage.toLowerCase().includes('current password is incorrect') || 
          (errorMessage.toLowerCase().includes('current password') && 
           errorMessage.toLowerCase().includes('incorrect'))) {
        translatedMessage = 'Mật khẩu hiện tại không đúng';
      } else if (errorMessage.toLowerCase().includes('new password must be different') || 
                 (errorMessage.toLowerCase().includes('must be different') && 
                  errorMessage.toLowerCase().includes('current password'))) {
        translatedMessage = 'Mật khẩu mới phải khác mật khẩu hiện tại';
      }
      
      setMessage({ 
        type: 'error', 
        text: translatedMessage,
        source: 'password'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <User className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
        </div>
        
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
              <input
                type="text"
                value={user?.firstName || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Họ không thể thay đổi</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
              <input
                type="text"
                value={user?.lastName || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Tên không thể thay đổi</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={user?.phoneNumber || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Số điện thoại không thể thay đổi tại đây</p>
            </div>
            {showAddress && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            )}
          </div>

          {message.text && message.source !== 'password' && (
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
              type="submit"
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
                  <span>Lưu thông tin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Lock className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Đổi mật khẩu</h3>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                placeholder="Nhập lại mật khẩu mới"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {message.text && message.source === 'password' && (
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
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Đổi mật khẩu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;

