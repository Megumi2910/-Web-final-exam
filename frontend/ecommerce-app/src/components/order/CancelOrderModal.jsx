import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../ui';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderNumber }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reason is optional, but if provided, validate length
    if (reason.trim().length > 500) {
      setError('Lý do hủy đơn không được vượt quá 500 ký tự');
      return;
    }

    onConfirm(reason.trim() || null);
    setReason('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Hủy đơn hàng</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Bạn có chắc chắn muốn hủy đơn hàng này?</p>
            {orderNumber && (
              <p className="text-xs">Đơn hàng: #{orderNumber}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do hủy đơn <span className="text-gray-500">(Tùy chọn)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows={4}
              maxLength={500}
              placeholder="Nhập lý do hủy đơn hàng (ví dụ: Thay đổi ý định, Đặt nhầm sản phẩm, ...)"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                error 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-orange-500'
              } resize-none`}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/500 ký tự
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="danger"
            >
              Xác nhận hủy đơn
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;

