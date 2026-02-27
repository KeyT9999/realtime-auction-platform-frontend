import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const AuctionCard = ({ auction }) => {
  if (!auction) return null;

  const [timeRemaining, setTimeRemaining] = useState('');
  const [isEndingSoon, setIsEndingSoon] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const endTime = new Date(auction.endTime);
      const createdAt = new Date(auction.createdAt);
      const diffMs = endTime - now;

      const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
      setIsNew(hoursSinceCreated < 24);

      if (diffMs <= 0) {
        setTimeRemaining('Đã kết thúc');
        setIsEndingSoon(false);
        return;
      }

      const hoursRemaining = diffMs / (1000 * 60 * 60);
      setIsEndingSoon(hoursRemaining < 1);

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days} ngày ${hours} giờ`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} giờ ${minutes} phút`);
      } else {
        setTimeRemaining(`${minutes} phút ${seconds} giây`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime, auction.createdAt]);

  const statusConfig = {
    0: { label: 'Nháp', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    1: { label: 'Đang diễn ra', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    2: { label: 'Chờ xử lý', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    3: { label: 'Hoàn thành', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    4: { label: 'Đã hủy', cls: 'bg-red-50 text-red-700 border-red-200' },
  };
  const status = statusConfig[auction.status] ?? { label: 'Không xác định', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  const isActive = auction.status === 1;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">

      {/* Image — fixed height */}
      <div className="relative h-48 bg-gray-100 flex-shrink-0 overflow-hidden">
        {auction.images && auction.images.length > 0 ? (
          <img
            src={auction.images[0]}
            alt={auction.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Không có ảnh</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.cls}`}>
            {status.label}
          </span>
          {isEndingSoon && isActive && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500 text-white animate-pulse">
              Sắp kết thúc!
            </span>
          )}
          {isNew && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500 text-white">
              Mới
            </span>
          )}
        </div>
      </div>

      {/* Body — flex-grow so button stays at bottom */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Title — 2-line clamp, min-height for alignment */}
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">
          {auction.title}
        </h3>

        {/* Category */}
        <p className="text-[11px] text-gray-400 truncate">
          {auction.categoryName ? `📂 ${auction.categoryName}` : '\u00A0'}
        </p>

        {/* Price row */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Giá hiện tại</p>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-extrabold text-blue-600 leading-none">
              {auction.currentPrice.toLocaleString('vi-VN')}
              <span className="text-sm ml-0.5">₫</span>
            </p>
            <p className="text-[11px] text-gray-400">
              🔨 {auction.bidCount ?? 0} lượt
            </p>
          </div>
        </div>

        {/* Countdown — fixed height so all cards align */}
        <div className={`rounded-xl px-3 py-2 text-center h-[52px] flex flex-col items-center justify-center ${isEndingSoon && isActive
            ? 'bg-red-50 text-red-600'
            : isActive
              ? 'bg-gray-50 text-gray-500'
              : 'bg-gray-50 text-gray-400'
          }`}>
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-60">
            {isActive ? '⏱ Còn lại' : '📅 Thời gian'}
          </span>
          <span className={`text-sm font-bold leading-none mt-0.5 ${isEndingSoon && isActive ? 'text-red-600' : ''}`}>
            {timeRemaining || '—'}
          </span>
        </div>

        {/* CTA */}
        <Link to={`/auctions/${auction.id}`} className="mt-auto block">
          <button
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-150 active:scale-[0.98] ${isActive
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
          >
            {isActive ? '🔨 Đặt giá ngay' : 'Xem chi tiết'}
          </button>
        </Link>
      </div>
    </div>
  );
};

AuctionCard.propTypes = {
  auction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    images: PropTypes.array,
    currentPrice: PropTypes.number.isRequired,
    bidCount: PropTypes.number,
    endTime: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,
    categoryName: PropTypes.string,
  }).isRequired,
};

export default AuctionCard;
