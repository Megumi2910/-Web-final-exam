import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { userApi } from '../../services/userApi';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setApiError('Token không hợp lệ hoặc đã hết hạn');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setApiError('Token không hợp lệ hoặc đã hết hạn');
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await userApi.resetPassword(token, formData.password);
      if (response.data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setApiError(response.data.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu thành công!</h2>
            <p className="text-gray-600 mb-6">
              Mật khẩu của bạn đã được đặt lại thành công. 
              Bạn sẽ được chuyển đến trang đăng nhập trong giây lát.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-500 hover:from-orange-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/login" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Quay lại đăng nhập</span>
          </Link>
          
          <button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-orange-600 to-pink-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 hover:from-orange-700 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 cursor-pointer block"
          >
            <span className="text-2xl font-bold">CNVLTW</span>
          </button>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h2>
          <p className="text-gray-600">Nhập mật khẩu mới của bạn</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!token && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* API Error Message */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {apiError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-500 hover:from-orange-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nhớ mật khẩu?{' '}
              <Link to="/login" className="font-medium text-orange-600 hover:text-orange-700">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

