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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleQuickBid = (multiplier) => {
    if (isSubmitting) return;
    setBidAmount((currentPrice + bidIncrement * multiplier).toString());
    setError('');
  };

  const validateBid = (amount) => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return 'Vui lòng nhập giá hợp lệ';
    if (n < minimumBid) return `Giá phải ít nhất ${formatCurrency(minimumBid)}`;
    if (n > currentPrice * 10) return 'Giá quá cao, vui lòng kiểm tra lại';
    if (userIsWinning) return 'Bạn đã là người đặt giá cao nhất';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(bidAmount);
    const err = validateBid(numAmount);
    if (err) {
      setError(err);
      return;
    }
    setPendingBid(numAmount);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    try {
      await onSubmit(pendingBid);
      setShowConfirmModal(false);
      setPendingBid(0);
      setBidAmount('');
      setError('');
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi đặt giá');
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setShowConfirmModal(false);
    setPendingBid(0);
  };

  const handleInputChange = (e) => {
    setBidAmount(e.target.value.replace(/[^0-9]/g, ''));
    if (error) setError('');
  };

  if (isOwner) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
        <div className="text-3xl mb-2">🏷️</div>
        <p className="font-bold text-amber-800">Đây là đấu giá của bạn</p>
        <p className="text-sm text-amber-600 mt-1">Bạn không thể đặt giá cho chính mình</p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
        <div className="text-3xl mb-2">🔒</div>
        <p className="font-bold text-gray-700">Đấu giá đã kết thúc</p>
        <p className="text-sm text-gray-500 mt-1">Không thể đặt giá cho phiên này</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">

        {/* Quick Bid */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Đặt giá nhanh
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '+1 bước', multiplier: 1, color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
              { label: '+2 bước', multiplier: 2, color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
              { label: '+5 bước', multiplier: 5, color: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200' },
            ].map(({ label, multiplier, color }) => (
              <button
                key={multiplier}
                type="button"
                onClick={() => handleQuickBid(multiplier)}
                disabled={isSubmitting}
                className={`py-2 px-2 border rounded-xl text-center transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
              >
                <div className="text-[10px] font-semibold opacity-60">{label}</div>
                <div className="text-xs font-bold">
                  {formatCurrency(currentPrice + bidIncrement * multiplier)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Nhập giá tùy chỉnh
            </p>

            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={bidAmount}
                onChange={handleInputChange}
                placeholder={`Tối thiểu ${formatCurrency(minimumBid)}`}
                disabled={isSubmitting}
                className={`w-full pl-4 pr-14 py-3 border-2 rounded-xl text-base font-semibold transition-all ${
                  error
                    ? 'border-red-300 bg-red-50 focus:border-red-500'
                    : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                VND
              </span>
            </div>

            {error ? (
              <p className="mt-1.5 text-xs text-red-600">{error}</p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400">
                Bước giá:{' '}
                <span className="font-semibold text-gray-600">
                  {formatCurrency(bidIncrement)}
                </span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-base font-bold"
            disabled={isSubmitting || !bidAmount}
          >
            {isSubmitting ? 'Đang gửi...' : '🔨 Đặt giá ngay'}
          </Button>
        </form>

        <p className="text-[11px] text-gray-400 text-center">
          💡 Khi đặt giá, bạn cam kết sẽ mua nếu thắng. Giá không thể hoàn tác.
        </p>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCancel}
        title="Xác nhận đặt giá"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-amber-800">
              ⚠️ Bạn có chắc chắn muốn đặt giá?
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Giá hiện tại</span>
              <span className="font-semibold">
                {formatCurrency(currentPrice)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-gray-500 text-sm">Giá bạn đặt</span>
              <span className="text-xl font-extrabold text-blue-600">
                {formatCurrency(pendingBid)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Hủy
            </Button>

            <Button
              variant="primary"
              onClick={handleConfirm}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang gửi...' : 'Xác nhận đặt giá'}
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