import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useCountdown } from '../../contexts/CountdownContext';

const AuctionCard = ({ auction }) => {
  if (!auction) return null;

  const id = auction.id ?? auction.Id;
  const title = auction.title ?? auction.Title ?? '';
  const images = auction.images ?? auction.Images ?? [];
  const currentPrice = Number(auction.currentPrice ?? auction.CurrentPrice ?? 0);
  const bidCount = auction.bidCount ?? auction.BidCount ?? 0;
  const endTime = auction.endTime ?? auction.EndTime;
  const createdAt = auction.createdAt ?? auction.CreatedAt;
  const statusValue = auction.status ?? auction.Status ?? 0;
  const categoryName = auction.categoryName ?? auction.CategoryName;

  const { now } = useCountdown();
  const { timeRemaining, isEndingSoon, isNew } = useMemo(() => {
    if (!endTime || !createdAt) return { timeRemaining: '', isEndingSoon: false, isNew: false };
    const nowMs = typeof now === 'number' ? now : Date.now();
    const endDate = new Date(endTime).getTime();
    const createdDate = new Date(createdAt).getTime();
    const diffMs = endDate - nowMs;
    const hoursSinceCreated = (nowMs - createdDate) / (1000 * 60 * 60);

    if (diffMs <= 0) return { timeRemaining: 'Đã kết thúc', isEndingSoon: false, isNew: hoursSinceCreated < 24 };

    const hoursRemaining = diffMs / (1000 * 60 * 60);
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    let tr = '';
    if (days > 0) tr = `${days} ngày ${hours} giờ`;
    else if (hours > 0) tr = `${hours} giờ ${minutes} phút`;
    else tr = `${minutes} phút ${seconds} giây`;

    return {
      timeRemaining: tr,
      isEndingSoon: hoursRemaining < 1,
      isNew: hoursSinceCreated < 24,
    };
  }, [now, endTime, createdAt]);

  const statusConfig = {
    0: { label: 'Nháp', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    1: { label: 'Đang diễn ra', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    2: { label: 'Chờ xử lý', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    3: { label: 'Hoàn thành', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    4: { label: 'Đã hủy', cls: 'bg-red-50 text-red-700 border-red-200' },
  };

  const status = statusConfig[statusValue] ?? {
    label: 'Không xác định',
    cls: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const isActive = statusValue === 1;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">

      {/* Image */}
      <div className="relative h-48 bg-gray-100 flex-shrink-0 overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
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

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem]">
          {title}
        </h3>

        <p className="text-[11px] text-gray-400 truncate">
          {categoryName ? `📂 ${categoryName}` : '\u00A0'}
        </p>

        {/* Price */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">
            Giá hiện tại
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-extrabold text-blue-600 leading-none">
              {currentPrice.toLocaleString('vi-VN')}
              <span className="text-sm ml-0.5">₫</span>
            </p>
            <p className="text-[11px] text-gray-400">
              🔨 {bidCount} lượt
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div
          className={`rounded-xl px-3 py-2 text-center h-[52px] flex flex-col items-center justify-center ${
            isEndingSoon && isActive
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-50 text-gray-500'
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-60">
            {isActive ? '⏱ Còn lại' : '📅 Thời gian'}
          </span>
          <span className="text-sm font-bold leading-none mt-0.5">
            {timeRemaining || '—'}
          </span>
        </div>

        {/* Button */}
        <Link to={`/auctions/${id}`} className="mt-auto block">
          <button
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-150 active:scale-[0.98] ${
              isActive
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
  auction: PropTypes.object.isRequired,
};

export default AuctionCard;
