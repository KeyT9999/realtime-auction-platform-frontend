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
      <span className="inline-flex items-center gap-1.5 bg-amber-400 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow">
        <span className="material-symbols-outlined text-xs">schedule</span>
        Ending Soon
      </span>
    );
    if (isActive) return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping inline-block"></span>
        Live
      </span>
    );
    if (isNew) return (
      <span className="inline-flex items-center gap-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow">
        <span className="material-symbols-outlined text-xs">calendar_today</span>
        Starts Soon
      </span>
    );
    if (isEnded) return (
      <span className="inline-flex items-center gap-1.5 bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow">
        Ended
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
    <Link to={`/auctions/${id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100">

      {/* Image area */}
      <div className="relative overflow-hidden bg-slate-100" style={{ height: '200px' }}>
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="material-symbols-outlined text-5xl text-slate-300">image</span>
          </div>
        )}

        {/* Status badge - top left */}
        <div className="absolute top-3 left-3">
          {statusBadge()}
        </div>

        {/* Favorite - top right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 transition-colors shadow"
        >
          <span className="material-symbols-outlined text-lg">favorite</span>
        </button>

        {/* TIME LEFT overlay - bottom */}
        {timeDisplay && (isActive || isEnded) && (
          <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 ${
            isEndingSoon ? 'bg-red-600' : 'bg-slate-900/85'
          } backdrop-blur-sm`}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Time Left</span>
            <span className="text-sm font-bold text-white font-mono">{timeDisplay}</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col p-5 flex-1">
        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-1.5">
          {title}
        </h3>

        {/* Lot / Bid count */}
        <p className="text-xs text-slate-400 mb-4">
          {categoryName && <span>{categoryName} • </span>}
          <span>{bidCount} Bids</span>
        </p>

        {/* Price + Button */}
        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
              {isActive ? 'Current Bid' : isEnded ? 'Final Price' : 'Starting Price'}
            </p>
            <p className="text-xl font-extrabold text-slate-900">
              {currentPrice.toLocaleString('vi-VN')}
              <span className="text-sm font-semibold text-slate-400 ml-0.5">₫</span>
            </p>
          </div>

          <button
            onClick={handleBid}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all shadow-sm shrink-0 ${
              isActive
                ? 'bg-primary hover:bg-primary-700 text-white shadow-primary/30 hover:shadow-glow'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {isActive ? 'Place Bid' : 'View'}
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
