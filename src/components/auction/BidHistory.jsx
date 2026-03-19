import { useState, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';

const BidHistory = memo(({ bids, highlightNewBid = false, embedded = false, onLoadMore, hasMore = false, loadingMore = false }) => {
  const [animatingBidId, setAnimatingBidId] = useState(null);
  const previousBidsRef = useRef([]);
  const listRef = useRef(null);

  useEffect(() => {
    // Detect new bid by comparing with previous bids
    if (bids.length > previousBidsRef.current.length && highlightNewBid) {
      const newBid = bids[0];
      if (newBid && newBid.id !== previousBidsRef.current[0]?.id) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const content = !bids || bids.length === 0 ? (
    <>
      {!embedded && <h2 className="text-xl font-semibold text-text-primary mb-4">Lịch sử đấu giá</h2>}
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🔨</div>
        <p className="text-text-secondary">Chưa có lượt đấu giá nào</p>
        <p className="text-sm text-text-secondary mt-2">Hãy là người đầu tiên đặt giá!</p>
      </div>
    </>
  ) : (
    <>
      {!embedded && (
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center justify-between">
          <span>Lịch sử đấu giá</span>
          <span className="text-sm font-normal text-text-secondary">
            {bids.length} lượt đặt giá
          </span>
        </h2>
      )}

      <div ref={listRef} className="space-y-4 overflow-x-hidden py-1">
        {bids.map((bid, index) => {
          const isWinning = bid.isWinningBid || index === 0;
          const isNew = animatingBidId === bid.id;

          return (
            <div
              key={bid.id}
              className={`
                relative p-5 rounded-3xl border transition-all duration-300
                ${isNew ? 'animate-slide-in-down bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10' : ''}
                ${isWinning && !isNew ? 'bg-slate-900 border-emerald-500/30' : ''}
                ${!isWinning && !isNew ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : ''}
              `}
            >
              {/* Winning Badge */}
              {isWinning && (
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                  <div className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                    <span className="text-sm">👑</span>
                    <span>Đang thắng</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-tight">
                    {formatTime(bid.timestamp)}
                  </p>
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
                <div className="flex-1 min-w-0 pr-24"> {/* Extra padding-right to avoid badge overlap */}
                  <div className="flex flex-col mb-1.5">
                    <p className={`font-black text-base tracking-tight truncate ${isWinning ? 'text-white' : 'text-slate-200'}`}>
                      {bid.userName || 'Ẩn danh'}
                    </p>
                    {!isWinning && (
                      <p className="text-[10px] font-bold text-slate-500 tracking-tight">
                        {formatTime(bid.timestamp)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <p className={`text-xl font-black tracking-tighter ${isWinning ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {formatCurrency(bid.amount)}
                    </p>

                    {bid.autoBid?.isActive && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-slate-700">
                        🤖 Auto
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

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-primary hover:text-primary-dark font-medium text-sm disabled:opacity-50"
          >
            {loadingMore ? 'Đang tải...' : 'Xem thêm →'}
          </button>
        </div>
      )}
    </>
  );

  return embedded ? <div>{content}</div> : <Card>{content}</Card>;
});

BidHistory.displayName = 'BidHistory';

BidHistory.propTypes = {
  embedded: PropTypes.bool,
  onLoadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  loadingMore: PropTypes.bool,
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
