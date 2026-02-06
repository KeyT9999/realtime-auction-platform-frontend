import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Modal from '../common/Modal';

const BuyoutButton = ({ buyoutPrice, currentPrice, onBuyout, isSubmitting = false }) => {
  const [showModal, setShowModal] = useState(false);

  const savings = buyoutPrice - currentPrice;
  const savingsPercent = ((buyoutPrice - currentPrice) / currentPrice * 100).toFixed(1);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleBuyoutClick = () => {
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    await onBuyout();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Buyout Price Display */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-medium text-yellow-800">Giá mua ngay</span>
          </div>
          {savings > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
              Tiết kiệm {savingsPercent}%
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-orange-600">
          {formatCurrency(buyoutPrice)}
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          Mua ngay và kết thúc đấu giá lập tức
        </p>
      </div>

      {/* Buyout Button */}
      <Button
        variant="primary"
        onClick={handleBuyoutClick}
        disabled={isSubmitting}
        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg"
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
            <span>⚡</span>
            <span>MUA NGAY</span>
          </span>
        )}
      </Button>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title="Xác nhận mua ngay"
      >
        <div className="space-y-4">
          {/* Warning */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-900 mb-1">Mua ngay - Không thể hoàn tác!</p>
                <p className="text-sm text-yellow-800">
                  Bạn sẽ mua sản phẩm này với giá mua ngay. Đấu giá sẽ kết thúc ngay lập tức và bạn cam kết thanh toán.
                </p>
              </div>
            </div>
          </div>

          {/* Price Comparison */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Giá đấu giá hiện tại:</span>
              <span className="text-lg font-semibold line-through text-gray-400">
                {formatCurrency(currentPrice)}
              </span>
            </div>
            
            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">Giá mua ngay:</span>
                <span className="text-3xl font-bold text-orange-600">
                  {formatCurrency(buyoutPrice)}
                </span>
              </div>
            </div>

            {savings > 0 && (
              <div className="bg-green-100 border border-green-300 rounded-md p-2 text-center">
                <p className="text-sm text-green-800">
                  💰 Bạn đang trả thêm <strong>{formatCurrency(savings)}</strong> để sở hữu ngay
                </p>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900 font-semibold mb-2">✅ Lợi ích của mua ngay:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Sở hữu sản phẩm ngay lập tức</li>
              <li>• Không phải chờ đợi hoặc cạnh tranh</li>
              <li>• Tránh bị vượt giá vào phút cuối</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
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
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              ⚡ Xác nhận mua ngay
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

BuyoutButton.propTypes = {
  buyoutPrice: PropTypes.number.isRequired,
  currentPrice: PropTypes.number.isRequired,
  onBuyout: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default BuyoutButton;
