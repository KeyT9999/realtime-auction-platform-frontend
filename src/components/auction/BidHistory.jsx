import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';

const BidHistory = ({ bids, highlightNewBid = false }) => {
  const [animatingBidId, setAnimatingBidId] = useState(null);
  const previousBidsRef = useRef([]);
  const listRef = useRef(null);

  useEffect(() => {
    // Detect new bid by comparing with previous bids
    if (bids.length > previousBidsRef.current.length && highlightNewBid) {
      const newBid = bids[0];
      if (newBid && newBid.id !== previousBidsRef.current[0]?.id) {
        setAnimatingBidId(newBid.id);
        
        // Scroll to top to show new bid
        if (listRef.current) {
          listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Remove animation after 2 seconds
        setTimeout(() => {
          setAnimatingBidId(null);
        }, 2000);
      }
    }
    
    previousBidsRef.current = bids;
  }, [bids, highlightNewBid]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const bidTime = new Date(timestamp);
    const diffMs = now - bidTime;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'Vừa xong';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return bidTime.toLocaleDateString('vi-VN');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!bids || bids.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Lịch sử đấu giá</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔨</div>
          <p className="text-text-secondary">Chưa có lượt đấu giá nào</p>
          <p className="text-sm text-text-secondary mt-2">Hãy là người đầu tiên đặt giá!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center justify-between">
        <span>Lịch sử đấu giá</span>
        <span className="text-sm font-normal text-text-secondary">
          {bids.length} lượt đặt giá
        </span>
      </h2>

      <div ref={listRef} className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {bids.map((bid, index) => {
          const isWinning = bid.isWinningBid || index === 0;
          const isNew = animatingBidId === bid.id;
          
          return (
            <div
              key={bid.id}
              className={`
                relative p-4 rounded-lg border transition-all duration-500
                ${isNew ? 'animate-slide-in-down bg-blue-50 border-blue-400 shadow-lg' : ''}
                ${isWinning && !isNew ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : ''}
                ${!isWinning && !isNew ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm' : ''}
              `}
            >
              {/* Winning Badge */}
              {isWinning && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                    <span>👑</span>
                    <span>Đang thắng</span>
                  </div>
                </div>
              )}

              {/* New Bid Badge */}
              {isNew && (
                <div className="absolute -top-2 -left-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
                    ✨ Mới
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${isWinning ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}
                `}>
                  {getInitials(bid.userName)}
                </div>

                {/* Bid Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold truncate ${isWinning ? 'text-green-700' : 'text-text-primary'}`}>
                      {bid.userName || 'Ẩn danh'}
                    </p>
                    <p className="text-xs text-text-secondary whitespace-nowrap ml-2">
                      {formatTime(bid.timestamp)}
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <p className={`text-lg font-bold ${isWinning ? 'text-green-600' : 'text-primary'}`}>
                      {formatCurrency(bid.amount)}
                    </p>
                    
                    {bid.autoBid?.isActive && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                        🤖 Auto-bid
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Position indicator */}
              {index > 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-transparent"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More (for future implementation) */}
      {bids.length >= 20 && (
        <div className="mt-4 text-center">
          <button className="text-primary hover:text-primary-dark font-medium text-sm">
            Xem thêm →
          </button>
        </div>
      )}
    </Card>
  );
};

BidHistory.propTypes = {
  bids: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      userName: PropTypes.string,
      amount: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      isWinningBid: PropTypes.bool,
      autoBid: PropTypes.shape({
        isActive: PropTypes.bool,
        maxBid: PropTypes.number,
      }),
    })
  ).isRequired,
  highlightNewBid: PropTypes.bool,
};

export default BidHistory;
