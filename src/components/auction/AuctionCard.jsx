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
    ? `${String(d).padStart(2, '0')}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
    : `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;

  return { display, endingSoon };
}

const AuctionCard = memo(({ auction }) => {
  const now = useNow();
  const navigate = useNavigate();

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
      className="group flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-1 hover:border-slate-600/50"
    >
      {/* Image area — aspect 4/5 */}
      <div className="relative overflow-hidden bg-slate-900" style={{ aspectRatio: '4/5' }}>
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <span className="material-symbols-outlined text-5xl text-slate-700" style={{ fontVariationSettings: "'wght' 200" }}>image</span>
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
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-slate-800 transition-colors duration-200 shadow-sm cursor-pointer border border-slate-700/50"
          aria-label="Yêu thích"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'wght' 300" }}>favorite</span>
        </button>

        {/* TIME LEFT — bottom overlay */}
        {timeDisplay && (isActive || isEnded) && (
          <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 ${isEndingSoon ? 'bg-amber-600/95' : 'bg-black/60'
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
            <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
              {categoryName}
            </span>
          )}
          {categoryName && bidCount > 0 && (
            <span className="w-1 h-1 rounded-full bg-slate-600" />
          )}
          {bidCount > 0 && (
            <span className="text-[11px] text-slate-400 font-medium">
              {bidCount} lượt đấu giá
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-semibold text-slate-100 line-clamp-2 leading-snug mb-auto text-pretty">
          {title}
        </h3>

        {/* Price + Button */}
        <div className="mt-4 flex items-end justify-between pt-4 border-t border-slate-700/50">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
              {isActive ? 'Giá hiện tại' : isEnded ? 'Giá cuối' : 'Giá khởi điểm'}
            </p>
            <p className="text-xl font-bold text-white tabular-nums">
              {currentPrice.toLocaleString('vi-VN')}
              <span className="text-sm font-medium text-slate-400 ml-0.5">₫</span>
            </p>
          </div>

          <button
            onClick={handleBid}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer ${isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02]'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
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
