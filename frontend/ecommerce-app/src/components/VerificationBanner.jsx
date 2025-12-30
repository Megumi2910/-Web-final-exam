import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const VerificationBanner = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // Send verification email
      const response = await api.post('/auth/resend-verification');
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư của bạn.'
        });
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'Không thể gửi email xác thực. Vui lòng thử lại sau.'
        });
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Không thể gửi email xác thực. Vui lòng thử lại sau.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 font-medium">
                Tài khoản của bạn chưa được xác thực
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Vui lòng xác thực email để sử dụng đầy đủ các tính năng của hệ thống
              </p>
              
              {/* Message display */}
              {message && (
                <div className={`mt-2 flex items-center space-x-2 text-xs ${
                  message.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleSendVerification}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4 mr-1.5" />
              {loading ? 'Đang gửi...' : 'Gửi email xác thực'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationBanner;

