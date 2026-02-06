import { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';

const SellerActions = ({ 
  auction, 
  bids, 
  onAcceptBid, 
  onCancel, 
  isProcessing = false 
}) => {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [message, setMessage] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Check conditions
  const hasBids = bids && bids.length > 0;
  const currentPrice = auction.currentPrice;
  const reservePrice = auction.reservePrice;
  const meetsReservePrice = !reservePrice || currentPrice >= reservePrice;
  const canAcceptBid = hasBids && meetsReservePrice && auction.status === 1;
  const canCancel = auction.status === 0 || (auction.status === 1 && !hasBids);

  const highestBid = hasBids ? bids[0] : null;

  const handleAcceptBid = async () => {
    await onAcceptBid(message);
    setShowAcceptModal(false);
    setMessage('');
  };

  const handleCancel = async () => {
    await onCancel();
    setShowCancelModal(false);
  };

  if (auction.status === 3 || auction.status === 4) {
    // Auction already ended
    return null;
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-purple-200">
            <span className="text-2xl">👤</span>
            <h3 className="font-bold text-lg text-purple-900">Quản lý đấu giá</h3>
          </div>

          {/* Current Status */}
          <div className="bg-white rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`font-semibold ${
                auction.status === 1 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {['Nháp', 'Đang diễn ra', 'Chờ xử lý', 'Hoàn thành', 'Đã hủy'][auction.status]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Lượt đấu giá:</span>
              <span className="font-semibold text-purple-600">{bids?.length || 0}</span>
            </div>
            {hasBids && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giá cao nhất:</span>
                <span className="font-semibold text-green-600">{formatCurrency(currentPrice)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Accept Bid Button */}
            {auction.status === 1 && (
              <div>
                <Button
                  variant="primary"
                  onClick={() => setShowAcceptModal(true)}
                  disabled={!canAcceptBid || isProcessing}
                  className={`w-full ${canAcceptBid ? 'bg-green-600 hover:bg-green-700' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>✅</span>
                    <span>Chấp nhận giá hiện tại</span>
                  </span>
                </Button>
                
                {!meetsReservePrice && reservePrice && (
                  <p className="text-xs text-red-600 mt-1 text-center">
                    Giá chưa đạt reserve price ({formatCurrency(reservePrice)})
                  </p>
                )}
                {!hasBids && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Chưa có lượt đấu giá nào
                  </p>
                )}
              </div>
            )}

            {/* Cancel Button */}
            <Button
              variant="danger"
              onClick={() => setShowCancelModal(true)}
              disabled={!canCancel || isProcessing}
              className="w-full"
            >
              <span className="flex items-center justify-center gap-2">
                <span>❌</span>
                <span>Hủy đấu giá</span>
              </span>
            </Button>
            
            {!canCancel && auction.status === 1 && hasBids && (
              <p className="text-xs text-red-600 text-center">
                Không thể hủy khi đã có người đặt giá
              </p>
            )}
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Gợi ý:</strong> {hasBids 
                ? 'Bạn có thể chấp nhận giá hiện tại để kết thúc sớm.' 
                : 'Đợi người mua đặt giá hoặc hủy đấu giá nếu không còn muốn bán.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Accept Bid Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Chấp nhận giá và kết thúc đấu giá"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <p className="text-sm text-green-900 font-semibold mb-2">
              ✅ Bạn đang chấp nhận giá hiện tại
            </p>
            <p className="text-xs text-green-700">
              Đấu giá sẽ kết thúc ngay lập tức và người đặt giá cao nhất sẽ thắng.
            </p>
          </div>

          {highestBid && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Người thắng:</p>
              <p className="font-semibold text-lg text-text-primary mb-1">
                {highestBid.userName || 'Ẩn danh'}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(highestBid.amount)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Lời nhắn đến người mua (tùy chọn):
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cảm ơn bạn đã tham gia đấu giá..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAcceptModal(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleAcceptBid}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              ✅ Chấp nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Hủy đấu giá"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <p className="text-sm text-red-900 font-semibold mb-2">
              ⚠️ Bạn có chắc chắn muốn hủy đấu giá?
            </p>
            <p className="text-xs text-red-700">
              Hành động này không thể hoàn tác. Đấu giá sẽ bị hủy vĩnh viễn.
            </p>
          </div>

          {hasBids && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Lưu ý: Đã có {bids.length} người đặt giá. Họ sẽ nhận được thông báo về việc hủy này.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              Không hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              className="flex-1"
            >
              ❌ Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

SellerActions.propTypes = {
  auction: PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.number,
    currentPrice: PropTypes.number,
    reservePrice: PropTypes.number,
  }).isRequired,
  bids: PropTypes.array,
  onAcceptBid: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
};

export default SellerActions;
