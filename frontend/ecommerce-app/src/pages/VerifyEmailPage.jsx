import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token xác thực không hợp lệ');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage('Email của bạn đã được xác thực thành công!');
        
        // Refresh user data to update verification status
        await refreshUser();
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Xác thực email thất bại');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            {status === 'verifying' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full">
                <Loader className="w-10 h-10 text-orange-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'verifying' && 'Đang xác thực email...'}
            {status === 'success' && 'Xác thực thành công!'}
            {status === 'error' && 'Xác thực thất bại'}
          </h2>

          {/* Message */}
          <p className={`text-sm mb-6 ${
            status === 'success' ? 'text-green-700' : 
            status === 'error' ? 'text-red-700' : 
            'text-gray-600'
          }`}>
            {message || 'Vui lòng đợi trong giây lát...'}
          </p>

          {/* Actions */}
          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Bạn sẽ được chuyển hướng về trang chủ trong giây lát...
              </p>
              <Link
                to="/"
                className="inline-block w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                Về trang chủ ngay
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Link
                to="/"
                className="inline-block w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                Về trang chủ
              </Link>
              <Link
                to="/login"
                className="inline-block w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

