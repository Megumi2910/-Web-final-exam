import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { userApi } from '../../services/userApi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await userApi.forgotPassword(email);
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } catch (error) {
      // For security, always show success message even if email doesn't exist
      // This prevents email enumeration attacks
      setSuccess(true);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email đã được gửi!</h2>
            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. 
              Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-500 hover:from-orange-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              >
                Quay lại đăng nhập
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="w-full text-sm text-orange-600 hover:text-orange-700"
              >
                Gửi lại email
              </button>
            </div>
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
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h2>
          <p className="text-gray-600">Nhập email của bạn để nhận link đặt lại mật khẩu</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nhập email của bạn"
                />
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-500 hover:from-orange-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang gửi...
                </div>
              ) : (
                'Gửi link đặt lại mật khẩu'
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

export default ForgotPasswordPage;

