import { memo, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useNow } from '../../contexts/TimerContext';

function computeTimeDisplay(endTime, now) {
  if (!endTime) return { display: '', endingSoon: false };
  const diff = new Date(endTime) - now;
  if (diff <= 0) return { display: 'Đã kết thúc', endingSoon: false };

  const endingSoon = diff / (1000 * 60 * 60) < 1;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const display = d > 0
    ? `${String(d).padStart(2,'0')}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`
    : `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;

  return { display, endingSoon };
}

const AuctionCard = memo(({ auction }) => {
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

  const now = useNow();
  const navigate = useNavigate();

  const { display: timeDisplay, endingSoon: isEndingSoon } = useMemo(
    () => computeTimeDisplay(endTime, now),
    [endTime, now]
  );

  const isActive = statusValue === 1;
  const isEnded = statusValue === 3;

  const isNew = useMemo(() => {
    if (!createdAt) return false;
    return (now - new Date(createdAt)) / 3600000 < 24;
  }, [createdAt, now]);

  const statusBadge = () => {
    if (isActive && isEndingSoon) return (
      <span className="badge-luxury bg-amber-500/90 text-white shadow-sm">
        <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'wght' 400" }}>schedule</span>
        Sắp kết thúc
      </span>
    );
    if (isActive) return (
      <span className="badge-luxury bg-emerald-500/90 text-white shadow-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
        </span>
        Đang diễn ra
      </span>
    );
    if (isNew) return (
      <span className="badge-luxury bg-gold-500/90 text-white shadow-sm">
        <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'wght' 400" }}>auto_awesome</span>
        Mới
      </span>
    );
    if (isEnded) return (
      <span className="badge-luxury bg-stone-700/90 text-white shadow-sm">
        Đã kết thúc
      </span>
    );
    return null;
  };

  const handleBid = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/auctions/${id}`);
  };

  return (
    <Link
      to={`/auctions/${id}`}
      className="group flex flex-col card-luxury rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Image area — aspect 4/5 */}
      <div className="relative overflow-hidden bg-stone-100" style={{ aspectRatio: '4/5' }}>
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
            <span className="material-symbols-outlined text-5xl text-stone-300" style={{ fontVariationSettings: "'wght' 200" }}>image</span>
          </div>
        )}

        {/* Gradient overlay at bottom for readability */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />

        {/* Status badge — top left */}
        <div className="absolute top-3 left-3">
          {statusBadge()}
        </div>

        {/* Favorite — top right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-stone-400 hover:text-red-500 transition-colors duration-200 shadow-sm cursor-pointer"
          aria-label="Yêu thích"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'wght' 300" }}>favorite</span>
        </button>

        {/* TIME LEFT — bottom overlay */}
        {timeDisplay && (isActive || isEnded) && (
          <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 ${
            isEndingSoon ? 'bg-amber-600/95' : 'bg-black/60'
          } backdrop-blur-sm`}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60">
              Còn lại
            </span>
            <span className="text-sm font-semibold text-white font-mono tabular-nums tracking-wide">
              {timeDisplay}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col p-4 sm:p-5 flex-1">
        {/* Category + Bid count */}
        <div className="flex items-center gap-2 mb-2">
          {categoryName && (
            <span className="text-[11px] font-medium text-gold-600 uppercase tracking-wider">
              {categoryName}
            </span>
          )}
          {categoryName && bidCount > 0 && (
            <span className="w-1 h-1 rounded-full bg-stone-300" />
          )}
          {bidCount > 0 && (
            <span className="text-[11px] text-stone-400 font-medium">
              {bidCount} lượt đấu giá
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-semibold text-stone-900 line-clamp-2 leading-snug mb-auto text-pretty">
          {title}
        </h3>

        {/* Price + Button */}
        <div className="mt-4 flex items-end justify-between pt-4 border-t border-stone-100">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 mb-0.5">
              {isActive ? 'Giá hiện tại' : isEnded ? 'Giá cuối' : 'Giá khởi điểm'}
            </p>
            <p className="text-xl font-bold text-stone-900 tabular-nums">
              {currentPrice.toLocaleString('vi-VN')}
              <span className="text-sm font-medium text-stone-400 ml-0.5">₫</span>
            </p>
          </div>

          <button
            onClick={handleBid}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-white shadow-sm hover:shadow-luxury-glow hover:scale-[1.02]'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            {isActive ? 'Đấu giá' : 'Xem'}
          </button>
        </div>
      </div>
    </Link>
  );
});

AuctionCard.displayName = 'AuctionCard';

AuctionCard.propTypes = {
  auction: PropTypes.object.isRequired,
};

export default AuctionCard;
