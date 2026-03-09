import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { auctionService } from '../services/auctionService';
import { bidService } from '../services/bidService';
import { watchlistService } from '../services/watchlistService';
import { signalRService } from '../services/signalRService';
import ImageGallery from '../components/auction/ImageGallery';
import BidHistory from '../components/auction/BidHistory';
import LiveAuctionChat from '../components/Chat/LiveAuctionChat';
import BidForm from '../components/auction/BidForm';
import OnlineViewers from '../components/auction/OnlineViewers';
import BuyoutButton from '../components/auction/BuyoutButton';
import SellerActions from '../components/auction/SellerActions';
import WinnerCelebration from '../components/auction/WinnerCelebration';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import { userService } from '../services/userService';
import { reviewService } from '../services/reviewService';

/* ─── Material icon helper ─── */
const MI = ({ name, size = 20, weight = 400, fill, className = '' }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontSize: `${size}px`,
      fontVariationSettings: `'wght' ${weight}${fill ? ", 'FILL' 1" : ''}`,
    }}
  >
    {name}
  </span>
);

/* ─────────────────────────────────────────────── */
const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversation } = useChat();

  /* --- Data states --- */
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsPage, setBidsPage] = useState(1);
  const [bidsTotalCount, setBidsTotalCount] = useState(0);
  const [bidsLoadingMore, setBidsLoadingMore] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* --- Seller data --- */
  const [sellerStats, setSellerStats] = useState(null);
  const [sellerRating, setSellerRating] = useState({ averageRating: 0, totalReviews: 0 });

  /* --- Bidding / Buyout / Actions --- */
  const [bidding, setBidding] = useState(false);
  const [buyouting, setBuyouting] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [winningAmount, setWinningAmount] = useState(0);

  /* --- SignalR --- */
  const [viewerCount, setViewerCount] = useState(0);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [detailTab, setDetailTab] = useState('bids');

  /* --- Inline countdown --- */
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  /* Sound */
  const lastBidSoundRef = useRef(0);
  const playBidSound = () => {
    const now = Date.now();
    if (now - lastBidSoundRef.current < 2000) return;
    lastBidSoundRef.current = now;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  };

  /* ─── Effects ─── */
  useEffect(() => { loadData(); }, [id]);

  /* Inline countdown */
  useEffect(() => {
    if (!auction) return;
    const tick = () => {
      const now = Date.now();
      const end = new Date(auction.endTime).getTime();
      const rem = end - now;
      if (rem <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 }); return; }
      setTimeLeft({
        days: Math.floor(rem / 86400000),
        hours: Math.floor((rem % 86400000) / 3600000),
        minutes: Math.floor((rem % 3600000) / 60000),
        seconds: Math.floor((rem % 60000) / 1000),
        totalMs: rem,
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [auction?.endTime]);

  /* SignalR */
  useEffect(() => {
    if (!id) return;
    const unsubs = [];
    const init = async () => {
      try {
        await signalRService.startConnection();
        setConnectionState(signalRService.getConnectionState());
        await signalRService.joinAuction(id);
        unsubs.push(signalRService.on('UpdateBid', handleBidUpdate));
        unsubs.push(signalRService.on('ViewerCountUpdated', d => setViewerCount(Number(d?.ViewerCount ?? d?.viewerCount ?? 0))));
        unsubs.push(signalRService.on('UserOutbid', handleUserOutbid));
        unsubs.push(signalRService.on('EndingSoon', handleEndingSoon));
        unsubs.push(signalRService.on('AuctionEnded', () => { toast.info('🏁 Đấu giá đã kết thúc!'); setAuction(p => ({ ...p, status: 3 })); }));
        unsubs.push(signalRService.on('TimeExtended', d => { const m = d?.ExtendedMinutes ?? d?.extendedMinutes ?? 0; const ne = d?.NewEndTime ?? d?.newEndTime; toast.info(`⏰ Gia hạn thêm ${m} phút`); if (ne) setAuction(p => ({ ...p, endTime: ne })); }));
        unsubs.push(signalRService.on('AuctionAccepted', handleAuctionAccepted));
        unsubs.push(signalRService.on('AuctionBuyout', handleAuctionBuyout));
        unsubs.push(signalRService.on('AuctionCancelled', d => { setAuction(p => ({ ...p, status: 4, endReason: 'cancelled' })); toast.warning(`❌ Đấu giá đã bị hủy: ${d?.Reason ?? d?.reason ?? ''}`); }));
        unsubs.push(signalRService.on('Reconnecting', () => setConnectionState('Reconnecting')));
        unsubs.push(signalRService.on('Reconnected', async () => { setConnectionState('Connected'); toast.info('Đã kết nối lại'); await signalRService.joinAuction(id); }));
        unsubs.push(signalRService.on('Disconnected', () => { setConnectionState('Disconnected'); toast.warning('Mất kết nối'); }));
      } catch (err) { console.error('SignalR init error', err); }
    };
    init();
    return () => { signalRService.leaveAuction(id); unsubs.forEach(fn => fn()); };
  }, [id]);

  /* ─── Data loading ─── */
  const loadData = async () => {
    try {
      setLoading(true);
      const [auctionData, bidsData, watchlistData] = await Promise.all([
        auctionService.getAuctionById(id),
        bidService.getBidsByAuction(id, 1, 20).catch(() => ({ bids: [], totalCount: 0 })),
        user ? watchlistService.getMyWatchlist().catch(() => []) : Promise.resolve([]),
      ]);
      setAuction(auctionData);
      const bidList = bidsData?.bids ?? [];
      setBids(bidList);
      setBidsTotalCount(bidsData?.totalCount ?? bidList.length);
      setBidsPage(1);
      if (user) {
        const w = watchlistData.find(item => item.auctionId === id);
        setIsWatching(!!w);
        setWatchlistId(w?.id);
      }
      // Load seller info
      if (auctionData?.sellerId) {
        Promise.all([
          userService.getSellerStats(auctionData.sellerId).catch(() => null),
          reviewService.getUserRating(auctionData.sellerId).catch(() => ({ averageRating: 0, totalReviews: 0 })),
        ]).then(([s, r]) => { if (s) setSellerStats(s); if (r) setSellerRating(r); });
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu đấu giá');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreBids = async () => {
    if (bidsLoadingMore || bids.length >= bidsTotalCount) return;
    try {
      setBidsLoadingMore(true);
      const data = await bidService.getBidsByAuction(id, bidsPage + 1, 20);
      setBids(prev => [...prev, ...(data?.bids ?? [])]);
      setBidsPage(p => p + 1);
    } catch { toast.error('Không thể tải thêm'); }
    finally { setBidsLoadingMore(false); }
  };

  /* ─── SignalR Handlers ─── */
  const handleBidUpdate = (data) => {
    const rawBid = data.Bid ?? data.bid;
    const cp = data.CurrentPrice ?? data.currentPrice ?? (rawBid && (rawBid.amount ?? rawBid.Amount));
    const bc = data.BidCount ?? data.bidCount;
    if (auction && (cp != null || bc != null)) setAuction(p => ({ ...p, ...(cp != null && { currentPrice: Number(cp) }), ...(bc != null && { bidCount: bc }) }));
    if (rawBid) {
      const bid = { id: rawBid.id ?? rawBid.Id, auctionId: rawBid.auctionId ?? rawBid.AuctionId, userId: rawBid.userId ?? rawBid.UserId, userName: rawBid.userName ?? rawBid.UserName, amount: rawBid.amount ?? rawBid.Amount, timestamp: rawBid.timestamp ?? rawBid.Timestamp, isWinningBid: rawBid.isWinningBid ?? rawBid.IsWinningBid, createdAt: rawBid.createdAt ?? rawBid.CreatedAt, autoBid: rawBid.autoBid ?? rawBid.AutoBid };
      setBids(prev => [bid, ...prev]);
      if (bid.userId !== user?.id && bid.amount != null) { playBidSound(); toast.info(`${bid.userName ?? 'Người dùng'} đã đặt giá ${Number(bid.amount).toLocaleString('vi-VN')} VND`, { autoClose: 3000 }); }
    }
  };
  const handleUserOutbid = (data) => { playBidSound(); const n = data?.NewBid ?? data?.newBid; toast.warning(`⚠️ Bạn đã bị vượt giá! ${data?.BidderName ?? data?.bidderName ?? 'Người khác'} đã đặt ${n != null ? Number(n).toLocaleString('vi-VN') : '—'} VND`, { position: 'top-center', autoClose: 5000 }); };
  const handleEndingSoon = (data) => { const t = data?.AuctionTitle ?? data?.auctionTitle ?? 'Đấu giá'; toast.info(`⏰ ${t} sắp kết thúc`, { autoClose: 8000 }); };
  const handleAuctionAccepted = (data) => { const wId = data?.WinnerId ?? data?.winnerId; const wb = data?.WinningBid ?? data?.winningBid; setAuction(p => ({ ...p, status: 3, winnerId: wId, endReason: 'accepted' })); if (user?.id === wId) { setWinningAmount(wb ?? 0); setShowCelebration(true); toast.success('🎉 Chúc mừng! Bạn đã thắng!'); } };
  const handleAuctionBuyout = (data) => { const bId = data?.BuyerId ?? data?.buyerId; const bp = data?.BuyoutPrice ?? data?.buyoutPrice; setAuction(p => ({ ...p, status: 3, winnerId: bId, endReason: 'buyout' })); if (user?.id === bId) { setWinningAmount(bp ?? 0); setShowCelebration(true); toast.success('🎉 Mua ngay thành công!'); } };

  /* ─── Action handlers ─── */
  const handleBidSubmit = async (amount, options = {}) => {
    try {
      setBidding(true);
      await bidService.createBid({ auctionId: id, amount, ...(options.autoBid && { autoBid: options.autoBid }) });
      toast.success('✅ Đặt giá thành công!');
    } catch (err) {
      const s = err.status ?? err.response?.status; const m = err.message || 'Đặt giá thất bại';
      if (s === 429) toast.warning(m); else if (s === 409 || (s === 400 && m.includes('giá'))) { toast.warning(m); loadData(); } else toast.error(m);
      throw err;
    } finally { setBidding(false); }
  };

  const handleWatchlist = async () => {
    try {
      if (isWatching) { await watchlistService.removeFromWatchlist(watchlistId); setIsWatching(false); setWatchlistId(null); toast.success('Đã xóa khỏi theo dõi'); }
      else { const r = await watchlistService.addToWatchlist(id); setIsWatching(true); setWatchlistId(r.id); toast.success('Đã thêm vào theo dõi'); }
    } catch (err) { toast.error(err.message || 'Thao tác thất bại'); }
  };

  const handleBuyout = async () => { try { setBuyouting(true); await auctionService.buyout(id); toast.success('⚡ Mua ngay thành công!'); } catch (err) { toast.error(err.message || 'Mua ngay thất bại'); } finally { setBuyouting(false); } };
  const handleAcceptBid = async (msg) => { try { setProcessingAction(true); await auctionService.acceptBid(id, msg); toast.success('✅ Đã chấp nhận!'); } catch (err) { toast.error(err.message || 'Thất bại'); throw err; } finally { setProcessingAction(false); } };
  const handleCancelAuction = async () => { try { setProcessingAction(true); await auctionService.cancelAuction(id); toast.success('Đã hủy đấu giá'); } catch (err) { toast.error(err.message || 'Thất bại'); throw err; } finally { setProcessingAction(false); } };

  /* ─── Loading/Error ─── */
  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;
  if (!auction) return <Alert type="error" message="Không tìm thấy đấu giá" />;

  /* ─── Computed ─── */
  const effectiveCurrentPrice = (bids.length > 0 && (bids[0].amount ?? bids[0].Amount) != null)
    ? Number(bids[0].amount ?? bids[0].Amount)
    : (auction.currentPrice ?? auction.startingPrice);
  const canBid = user && auction.status === 1 && auction.sellerId !== user.id;
  const isOwner = user && auction.sellerId === user.id;
  const userIsWinning = user && bids.length > 0 && bids[0]?.userId === user.id;
  const hasBuyoutPrice = auction.buyoutPrice && auction.buyoutPrice > 0;
  const canBuyout = canBid && hasBuyoutPrice;
  const isActive = auction.status === 1;
  const isEnded = auction.status >= 3;
  const statusNames = ['Nháp', 'Đang diễn ra', 'Chờ xử lý', 'Hoàn thành', 'Đã hủy'];
  const conditionNames = ['Mới', 'Như mới', 'Đã sử dụng', 'Tạm được', 'Kém'];

  const fmtPrice = (v) => v != null ? Number(v).toLocaleString('vi-VN') : '—';
  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const fmtJoinDate = (d) => { if (!d) return '—'; const diff = Math.ceil(Math.abs(Date.now() - new Date(d)) / 86400000); if (diff < 30) return `${diff} ngày`; if (diff < 365) return `${Math.floor(diff / 30)} tháng`; return `${Math.floor(diff / 365)} năm`; };

  /* Countdown display string */
  const hasEnded = timeLeft.totalMs <= 0 || isEnded;
  const countdownStr = hasEnded
    ? 'Hết hạn'
    : `${timeLeft.days > 0 ? timeLeft.days + 'n ' : ''}${String(timeLeft.hours).padStart(2,'0')}:${String(timeLeft.minutes).padStart(2,'0')}:${String(timeLeft.seconds).padStart(2,'0')}`;

  /* Status colors */
  const statusDot = isActive ? 'bg-emerald-500' : isEnded ? 'bg-slate-400' : 'bg-amber-500';
  const statusText = isActive ? 'Đang diễn ra' : statusNames[auction.status];

  return (
    <div className="min-h-screen bg-[#f6f6f8] font-[Inter,sans-serif]">
      <Helmet>
        <title>{auction.title ? `${auction.title} - Chi tiết đấu giá` : 'Chi tiết đấu giá'}</title>
        <meta name="description" content={auction.description?.slice(0, 160) || `Đấu giá: ${auction.title}`} />
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Reconnecting banner */}
        {connectionState === 'Reconnecting' && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-medium">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Đang kết nối lại...
          </div>
        )}

        {/* ─── Breadcrumbs ─── */}
        <nav className="flex mb-6 text-sm text-slate-500">
          <ol className="inline-flex items-center gap-1.5 flex-wrap font-medium">
            <li><Link to="/" className="hover:text-blue-600 flex items-center gap-1"><MI name="home" size={15} /> Trang chủ</Link></li>
            <li><MI name="chevron_right" size={14} className="text-slate-300" /></li>
            <li><Link to="/auctions" className="hover:text-blue-600">Đấu giá</Link></li>
            {auction.categoryName && (<><li><MI name="chevron_right" size={14} className="text-slate-300" /></li><li><span className="hover:text-blue-600">{auction.categoryName}</span></li></>)}
            <li><MI name="chevron_right" size={14} className="text-slate-300" /></li>
            <li className="text-slate-900 truncate max-w-[220px] font-semibold">{auction.title}</li>
          </ol>
        </nav>

        {/* ═══════ 3-COLUMN GRID ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─── COL 1 : Gallery (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <ImageGallery images={auction.images} title={auction.title} />
            </div>
          </div>

          {/* ─── COL 2 : Product Info (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-5">
            {/* Status + category */}
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">{statusText}</span>
              {auction.categoryName && <span className="text-xs font-medium text-slate-400">• {auction.categoryName}</span>}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-[1.75rem] font-extrabold text-slate-900 leading-tight tracking-tight">
              {auction.title}
            </h2>

            {/* Description */}
            {auction.description && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Mô tả chi tiết</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{auction.description}</p>
              </div>
            )}

            {/* Product specs */}
            {auction.product && (
              <ul className="space-y-3 pt-1">
                {[
                  auction.product.name && `Chất liệu: ${auction.product.name}`,
                  auction.product.condition != null && `Tình trạng: ${conditionNames[auction.product.condition]}`,
                  auction.product.brand && `Thương hiệu: ${auction.product.brand}`,
                  auction.product.model && `Model: ${auction.product.model}`,
                  auction.product.year && `Năm sản xuất: ${auction.product.year}`,
                ].filter(Boolean).map((txt, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <MI name="check_circle" size={16} className="text-blue-600" />
                    <span className="text-slate-600">{txt}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Trust badge */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <div className="flex items-center gap-2 text-slate-500 mb-1.5">
                <MI name="verified_user" size={18} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Cam kết từ Vela Auction</span>
              </div>
              <p className="text-[13px] text-slate-500 leading-snug">Tất cả sản phẩm đều được kiểm duyệt nghiêm ngặt về chất lượng và độ xác thực trước khi đăng bán.</p>
            </div>
          </div>

          {/* ─── COL 3 : Action Panel (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-5">

            {/* ── Auction Stats Card ── */}
            <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xl shadow-slate-200/50">
              {/* Status row */}
              <div className="flex justify-between items-center mb-5">
                <div className="px-3 py-1 bg-slate-100 rounded-full flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{statusText}</span>
                </div>
                <span className="text-[11px] text-slate-400">Mã: {id?.slice(-8)?.toUpperCase()}</span>
              </div>

              {/* Price */}
              <div className="mb-7">
                <p className="text-sm font-medium text-slate-400 mb-1">{isActive ? 'Giá hiện tại' : isEnded ? 'Giá cuối cùng' : 'Giá khởi điểm'}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-blue-600 tracking-tight">{fmtPrice(effectiveCurrentPrice)}</span>
                  <span className="text-xl font-bold text-blue-600">₫</span>
                </div>
              </div>

              {/* Stats 2×2 grid */}
              <div className="grid grid-cols-2 gap-5 mb-7 py-5 border-y border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Giá khởi điểm</p>
                  <p className="text-sm font-bold text-slate-900">{fmtPrice(auction.startingPrice)} ₫</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Bước giá</p>
                  <p className="text-sm font-bold text-slate-900">{fmtPrice(auction.bidIncrement)} ₫</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Lượt đấu giá</p>
                  <p className="text-sm font-bold text-slate-900">{auction.bidCount || bids.length} Lượt</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Thời gian còn lại</p>
                  <p className={`text-sm font-bold ${hasEnded ? 'text-slate-400 italic' : 'text-emerald-600'}`}>{countdownStr}</p>
                </div>
              </div>

              {/* Online viewers */}
              {viewerCount > 0 && (
                <div className="mb-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {viewerCount} người đang xem
                </div>
              )}

              {/* Winning status */}
              {userIsWinning && (
                <div className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <p className="text-xl mb-0.5">👑</p>
                  <p className="font-bold text-emerald-800 text-sm">Bạn đang thắng!</p>
                </div>
              )}

              {/* Buyout */}
              {canBuyout && (
                <div className="mb-3">
                  <BuyoutButton buyoutPrice={auction.buyoutPrice} currentPrice={effectiveCurrentPrice} onBuyout={handleBuyout} isSubmitting={buyouting} />
                </div>
              )}

              {/* Bid Form or Login */}
              {canBid ? (
                <div className="mb-3">
                  <BidForm currentPrice={effectiveCurrentPrice} bidIncrement={auction.bidIncrement} onSubmit={handleBidSubmit} isSubmitting={bidding} isOwner={isOwner} isActive={isActive} userIsWinning={userIsWinning} />
                </div>
              ) : !user ? (
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-slate-500 text-center">Đăng nhập để tham gia đấu giá</p>
                  <button onClick={() => navigate('/login')} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors cursor-pointer text-sm">
                    Đăng nhập
                  </button>
                </div>
              ) : null}

              {/* Action buttons */}
              <div className="space-y-3">
                {user && auction.sellerId !== user.id && (
                  <button
                    className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all cursor-pointer"
                    onClick={() => {
                      const s = { id: auction.sellerId, firstName: auction.seller?.firstName || (auction.sellerName ? auction.sellerName.split(' ').slice(0, -1).join(' ') : 'Người'), lastName: auction.seller?.lastName || (auction.sellerName ? auction.sellerName.split(' ').slice(-1).join(' ') : 'Bán') };
                      startConversation(s, auction.id);
                    }}
                  >
                    <MI name="chat_bubble" size={18} /> Chat với người bán
                  </button>
                )}
                {user && (
                  <button
                    onClick={handleWatchlist}
                    className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                      isWatching
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    <MI name={isWatching ? 'heart_broken' : 'favorite'} size={18} />
                    {isWatching ? 'Xóa khỏi theo dõi' : 'Thêm vào theo dõi'}
                  </button>
                )}
              </div>
            </div>

            {/* Seller Actions (if owner) */}
            {isOwner && (
              <SellerActions auction={auction} bids={bids} onAcceptBid={handleAcceptBid} onCancel={handleCancelAuction} isProcessing={processingAction} />
            )}

            {/* ── Seller Profile Card ── */}
            {!isOwner && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-base">
                    {getInitials(auction.sellerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{auction.sellerName || 'Người bán'}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MI name="calendar_today" size={12} /> Thành viên {sellerStats ? fmtJoinDate(sellerStats.joinedDate) : '...'}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                {sellerRating.totalReviews > 0 ? (
                  <div className="flex items-center gap-1.5 mb-4 text-sm">
                    {[1,2,3,4,5].map(s => <span key={s} className={s <= Math.round(sellerRating.averageRating) ? 'text-amber-400' : 'text-slate-200'}>★</span>)}
                    <span className="font-semibold ml-1">{sellerRating.averageRating}</span>
                    <span className="text-slate-400">({sellerRating.totalReviews})</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mb-4">⭐ Chưa có đánh giá</p>
                )}

                {/* 2×2 Stats grid */}
                {sellerStats && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Tổng phiên', value: sellerStats.totalAuctions },
                      { label: 'Thành công', value: sellerStats.completedAuctions },
                      { label: 'Hoạt động', value: sellerStats.activeAuctions },
                      { label: 'Tỉ lệ', value: `${sellerStats.completionRate}%` },
                    ].map((s, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{s.label}</p>
                        <p className="text-lg font-black text-slate-900">{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tabs: Bid History | Live Chat ── */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button onClick={() => setDetailTab('bids')} className={`flex-1 py-4 text-sm font-bold transition-colors cursor-pointer ${detailTab === 'bids' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  Lịch sử đặt giá
                </button>
                <button onClick={() => setDetailTab('chat')} className={`flex-1 py-4 text-sm font-bold transition-colors cursor-pointer ${detailTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  Live Chat
                </button>
              </div>
              <div className="p-5">
                {detailTab === 'bids' ? (
                  bids.length > 0 ? (
                    <BidHistory bids={bids} highlightNewBid embedded onLoadMore={loadMoreBids} hasMore={bids.length < bidsTotalCount} loadingMore={bidsLoadingMore} />
                  ) : (
                    <div className="py-10 flex flex-col items-center text-center opacity-50">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <MI name="gavel" size={28} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">Chưa có ai tham gia đấu giá sản phẩm này.</p>
                    </div>
                  )
                ) : (
                  <LiveAuctionChat auctionId={id} auctionTitle={auction?.title} isSeller={isOwner} bids={bids} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <WinnerCelebration show={showCelebration} onClose={() => setShowCelebration(false)} amount={winningAmount} />
    </div>
  );
};

export default AuctionDetail;
