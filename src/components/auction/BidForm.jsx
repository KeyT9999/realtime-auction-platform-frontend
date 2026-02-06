import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Modal from '../common/Modal';

const BidForm = ({ 
  currentPrice, 
  bidIncrement, 
  onSubmit, 
  isSubmitting = false,
  isOwner = false,
  isActive = true,
  userIsWinning = false 
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBid, setPendingBid] = useState(0);
  const [error, setError] = useState('');

  const minimumBid = currentPrice + bidIncrement;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleQuickBid = (multiplier) => {
    const quickAmount = currentPrice + (bidIncrement * multiplier);
    setBidAmount(quickAmount.toString());
    setError('');
  };

  const validateBid = (amount) => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Vui lòng nhập giá hợp lệ';
    }

    if (numAmount < minimumBid) {
      return `Giá phải ít nhất ${formatCurrency(minimumBid)}`;
    }

    if (numAmount > currentPrice * 10) {
      return 'Giá quá cao, vui lòng kiểm tra lại';
    }

    if (userIsWinning) {
      return 'Bạn đã là người đặt giá cao nhất';
    }

    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const numAmount = parseFloat(bidAmount);
    const validationError = validateBid(numAmount);

    if (validationError) {
      setError(validationError);
      return;
    }

    setPendingBid(numAmount);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    try {
      await onSubmit(pendingBid);
      setBidAmount('');
      setError('');
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi đặt giá');
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setPendingBid(0);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setBidAmount(value);
    if (error) setError('');
  };

  if (isOwner) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
        <p className="text-yellow-800 font-semibold">Đây là đấu giá của bạn</p>
        <p className="text-sm text-yellow-600 mt-1">Bạn không thể đặt giá cho đấu giá của chính mình</p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
        <p className="text-gray-700 font-semibold">Đấu giá không còn hoạt động</p>
        <p className="text-sm text-gray-500 mt-1">Bạn không thể đặt giá cho đấu giá này</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg p-6 border-2 border-primary/20 shadow-sm">
        <h3 className="text-lg font-bold text-text-primary mb-4">Đặt giá của bạn</h3>

        {/* Current Price Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">Giá hiện tại:</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(currentPrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Bước giá tối thiểu:</span>
            <span className="text-lg font-semibold text-green-600">{formatCurrency(bidIncrement)}</span>
          </div>
        </div>

        {/* Quick Bid Buttons */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Đặt giá nhanh:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickBid(1)}
              className="py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md font-semibold text-sm transition-colors"
            >
              +{formatCurrency(bidIncrement)}
            </button>
            <button
              type="button"
              onClick={() => handleQuickBid(2)}
              className="py-2 px-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-md font-semibold text-sm transition-colors"
            >
              +{formatCurrency(bidIncrement * 2)}
            </button>
            <button
              type="button"
              onClick={() => handleQuickBid(5)}
              className="py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md font-semibold text-sm transition-colors"
            >
              +{formatCurrency(bidIncrement * 5)}
            </button>
          </div>
        </div>

        {/* Bid Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bidAmount" className="block text-sm font-medium text-text-primary mb-2">
              Hoặc nhập giá tùy chỉnh:
            </label>
            <div className="relative">
              <input
                id="bidAmount"
                type="text"
                value={bidAmount}
                onChange={handleInputChange}
                placeholder={formatCurrency(minimumBid)}
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                }`}
                disabled={isSubmitting}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                VND
              </span>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            <p className="mt-2 text-xs text-text-secondary">
              Giá tối thiểu: <span className="font-semibold">{formatCurrency(minimumBid)}</span>
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-4 text-lg font-bold"
            disabled={isSubmitting || !bidAmount || !!error}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🔨</span>
                <span>Đặt giá ngay</span>
              </span>
            )}
          </Button>
        </form>

        {/* Info Note */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Lưu ý:</strong> Khi đặt giá, bạn cam kết sẽ mua sản phẩm nếu thắng đấu giá. 
            Giá đặt không thể hoàn tác.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCancel}
        title="Xác nhận đặt giá"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 mb-2">
              ⚠️ Bạn có chắc chắn muốn đặt giá?
            </p>
            <p className="text-xs text-yellow-700">
              Giá đặt không thể hoàn tác và bạn cam kết sẽ mua nếu thắng đấu giá.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-text-secondary">Giá hiện tại:</span>
              <span className="font-semibold">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Giá bạn đặt:</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(pendingBid)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              className="flex-1"
            >
              Xác nhận đặt giá
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

BidForm.propTypes = {
  currentPrice: PropTypes.number.isRequired,
  bidIncrement: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  isOwner: PropTypes.bool,
  isActive: PropTypes.bool,
  userIsWinning: PropTypes.bool,
};

export default BidForm;
