import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { auctionService } from '../services/auctionService';
import { bidService } from '../services/bidService';
import { productService } from '../services/productService';
import Loading from '../components/common/Loading';
import './MyAuctions.css';

/* ── Inline icon set ────────────────────────────────── */
const I = {
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Hammer: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" /><path d="M17.64 15 22 10.64" /><path d="m2 2 4.5 4.5" /><path d="M13 9 9 13" /><path d="M9.5 5.5 14 10" /><path d="m15 5 4 4" />
    </svg>
  ),
  Active: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Bids: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  TotalBids: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="m13 13 6 6" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  XCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Tag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

/* ── Status config ──────────────────────────────────── */
const STATUS = {
  0: { label: 'Nháp', cls: 'draft' },
  1: { label: 'Đang diễn ra', cls: 'active' },
  2: { label: 'Chờ xử lý', cls: 'pending' },
  3: { label: 'Hoàn thành', cls: 'completed' },
  4: { label: 'Đã hủy', cls: 'cancelled' },
};

/* ── Date format helper ─────────────────────────────── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtVnd = (n) => (n ?? 0).toLocaleString('vi-VN') + ' ₫';

/* =========================================================
   MAIN COMPONENT
   ========================================================= */
const MyAuctions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState([]);
  const [auctionBids, setAuctionBids] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadAuctions();
    }
  }, [user?.id]);

  const loadAuctions = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await auctionService.getAuctions({ sellerId: user.id });
      const list = data.items || data;
      setAuctions(list);
      const bidsRes = await Promise.all(
        list.map(async (a) => {
          try { return { [a.id]: await bidService.getBidsByAuction(a.id) }; }
          catch { return { [a.id]: [] }; }
        })
      );
      setAuctionBids(Object.assign({}, ...bidsRes));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đấu giá này?')) return;
    try {
      await auctionService.deleteAuction(id);
      toast.success('Đã xóa đấu giá');
      loadAuctions();
    } catch (err) { toast.error(err.message || 'Xóa thất bại'); }
  };

  const handleAcceptBid = async (auctionId, price) => {
    if (!window.confirm(`Chấp nhận giá ${fmtVnd(price)} và kết thúc đấu giá?`)) return;
    try {
      setProcessingId(auctionId);
      await auctionService.acceptBid(auctionId);
      toast.success('✅ Đã chấp nhận giá!');
      loadAuctions();
    } catch (err) { toast.error(err.message || 'Thao tác thất bại'); }
    finally { setProcessingId(null); }
  };

  const handleCancelAuction = async (auctionId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đấu giá này?')) return;
    try {
      setProcessingId(auctionId);
      await auctionService.cancelAuction(auctionId);
      toast.success('Đã hủy đấu giá');
      loadAuctions();
    } catch (err) { toast.error(err.message || 'Hủy thất bại'); }
    finally { setProcessingId(null); }
  };

  const handleDuplicate = async (auctionId) => {
    try {
      setDuplicatingId(auctionId);
      const newAuction = await auctionService.duplicateAuction(auctionId, productService);
      toast.success('Đã tạo bản sao (trạng thái Nháp)');
      if (newAuction?.id) navigate(`/auctions/${newAuction.id}/edit`);
      else loadAuctions();
    } catch (err) { toast.error(err.message || 'Nhân bản thất bại'); }
    finally { setDuplicatingId(null); }
  };

  const canAcceptBid = (a) => {
    const bids = auctionBids[a.id] || [];
    return a.status === 1 && bids.length > 0 && (!a.reservePrice || a.currentPrice >= a.reservePrice);
  };

  const canCancel = (a) => {
    const bids = auctionBids[a.id] || [];
    return a.status === 0 || (a.status === 1 && bids.length === 0);
  };

  /* Stats */
  const stats = useMemo(() => ({
    total: auctions.length,
    active: auctions.filter((a) => a.status === 1).length,
    completed: auctions.filter((a) => a.status === 3).length,
    totalBids: Object.values(auctionBids).reduce((s, arr) => s + (arr?.length || 0), 0),
  }), [auctions, auctionBids]);

  /* Filtered list */
  const displayed = useMemo(() => {
    let list = [...auctions];
    if (statusFilter !== '') list = list.filter((a) => a.status === parseInt(statusFilter, 10));
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter((a) => (a.title || '').toLowerCase().includes(k) || (a.description || '').toLowerCase().includes(k));
    }
    const bidCount = (a) => auctionBids[a.id]?.length ?? a.bidCount ?? 0;
    switch (sortBy) {
      case 'oldest': list.sort((a, b) => new Date(a.startTime || a.createdAt) - new Date(b.startTime || b.createdAt)); break;
      case 'priceDesc': list.sort((a, b) => (b.currentPrice ?? 0) - (a.currentPrice ?? 0)); break;
      case 'priceAsc': list.sort((a, b) => (a.currentPrice ?? 0) - (b.currentPrice ?? 0)); break;
      case 'bidsDesc': list.sort((a, b) => bidCount(b) - bidCount(a)); break;
      case 'endSoon': list.sort((a, b) => new Date(a.endTime || 0) - new Date(b.endTime || 0)); break;
      default: list.sort((a, b) => new Date(b.startTime || b.createdAt || 0) - new Date(a.startTime || a.createdAt || 0));
    }
    return list;
  }, [auctions, statusFilter, sortBy, keyword, auctionBids]);

  /* ── Loading ─────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loading size="lg" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div style={{ color: '#DC2626', textAlign: 'center', padding: 32 }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>Lỗi tải dữ liệu</p>
        <p style={{ fontSize: '0.875rem' }}>{error}</p>
      </div>
    </div>
  );

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Header ──────────────────────────── */}
        <div className="mya-header">
          <h1 className="mya-title">Đấu giá của tôi</h1>
          <Link to="/create-auction" className="mya-create-btn" id="mya-create-btn">
            <I.Plus /> Tạo đấu giá mới
          </Link>
        </div>

        {/* ── Stats ───────────────────────────── */}
        {auctions.length > 0 && (
          <div className="mya-stats">
            {[
              { icon: <I.Hammer />, cls: 'blue', label: 'Tổng đấu giá', value: stats.total },
              { icon: <I.Active />, cls: 'green', label: 'Đang diễn ra', value: stats.active },
              { icon: <I.Check />, cls: 'amber', label: 'Hoàn thành', value: stats.completed },
              { icon: <I.TotalBids />, cls: 'purple', label: 'Tổng lượt bid', value: stats.totalBids },
            ].map(({ icon, cls, label, value }) => (
              <div className="mya-stat-card" key={label}>
                <div className={`mya-stat-icon ${cls}`}>{icon}</div>
                <div className="mya-stat-info">
                  <span className="mya-stat-label">{label}</span>
                  <span className="mya-stat-value">{value}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ─────────────────────────── */}
        <div className="mya-filters">
          <div className="mya-search-wrapper">
            <I.Search />
            <input
              className="mya-search-input"
              placeholder="Tìm kiếm đấu giá..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              id="mya-search"
            />
          </div>

          <select
            className="mya-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="mya-status-filter"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="0">Nháp</option>
            <option value="1">Đang diễn ra</option>
            <option value="2">Chờ xử lý</option>
            <option value="3">Hoàn thành</option>
            <option value="4">Đã hủy</option>
          </select>

          <select
            className="mya-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            id="mya-sort"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="priceDesc">Giá cao → thấp</option>
            <option value="priceAsc">Giá thấp → cao</option>
            <option value="bidsDesc">Nhiều bid nhất</option>
            <option value="endSoon">Kết thúc sớm nhất</option>
          </select>

          <span className="mya-filter-count">{displayed.length} đấu giá</span>
        </div>

        {/* ── Grid / Empty ────────────────────── */}
        {displayed.length === 0 ? (
          <div className="mya-empty">
            <div className="mya-empty-icon"><I.Hammer /></div>
            <h3>
              {auctions.length === 0 ? 'Bạn chưa tạo đấu giá nào' : 'Không tìm thấy kết quả'}
            </h3>
            <p>
              {auctions.length === 0
                ? 'Bắt đầu bằng cách tạo đấu giá đầu tiên của bạn!'
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'}
            </p>
            {auctions.length === 0 ? (
              <Link to="/create-auction" className="mya-create-btn" style={{ display: 'inline-flex' }}>
                <I.Plus /> Tạo đấu giá đầu tiên
              </Link>
            ) : (
              <button
                className="mya-empty-reset-btn"
                onClick={() => { setStatusFilter(''); setKeyword(''); setSortBy('newest'); }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="mya-grid">
            {displayed.map((auction) => {
              const bids = auctionBids[auction.id] || [];
              const status = STATUS[auction.status] || STATUS[0];
              const isProcessing = processingId === auction.id;
              const isDuplicating = duplicatingId === auction.id;

              return (
                <div className="mya-card" key={auction.id}>
                  {/* Image */}
                  <div className="mya-card-image">
                    {auction.images && auction.images.length > 0 ? (
                      <img src={auction.images[0]} alt={auction.title} loading="lazy" />
                    ) : (
                      <div className="mya-card-image-placeholder"><I.Image /></div>
                    )}
                    <span className={`mya-status-badge ${status.cls}`}>{status.label}</span>
                    {bids.length > 0 && (
                      <span className="mya-bid-badge"><I.Bids /> {bids.length} bid</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="mya-card-body">
                    <h3 className="mya-card-title">{auction.title}</h3>
                    {auction.description && (
                      <p className="mya-card-desc">{auction.description}</p>
                    )}

                    {/* Price */}
                    <div className="mya-card-price-row">
                      <div className="mya-price-block">
                        <label>Giá hiện tại</label>
                        <div className="mya-price-value">{fmtVnd(auction.currentPrice)}</div>
                      </div>
                      {auction.buyoutPrice && (
                        <div className="mya-price-block" style={{ textAlign: 'right' }}>
                          <label>Mua ngay</label>
                          <div className="mya-buyout-value">{fmtVnd(auction.buyoutPrice)}</div>
                        </div>
                      )}
                    </div>

                    {/* Quick stats for active */}
                    {auction.status === 1 && (
                      <div className="mya-card-quick-stats">
                        <div className="mya-qs-item">
                          <span className="mya-qs-label">Lượt đấu</span>
                          <span className="mya-qs-value">{bids.length}</span>
                        </div>
                        <div className="mya-qs-item">
                          <span className="mya-qs-label">Kết thúc</span>
                          <span className="mya-qs-value" style={{ fontSize: '0.75rem' }}>
                            {auction.endTime ? new Date(auction.endTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Time meta */}
                    <div className="mya-card-meta">
                      {auction.startTime && (
                        <div className="mya-card-meta-row">
                          <I.Clock />
                          <span>Bắt đầu: {fmtDate(auction.startTime)}</span>
                        </div>
                      )}
                      {auction.endTime && (
                        <div className="mya-card-meta-row">
                          <I.Clock />
                          <span>Kết thúc: {fmtDate(auction.endTime)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mya-card-actions">
                      {/* Accept bid */}
                      {canAcceptBid(auction) && (
                        <button
                          className="mya-accept-btn"
                          onClick={() => handleAcceptBid(auction.id, auction.currentPrice)}
                          disabled={isProcessing}
                          id={`mya-accept-${auction.id}`}
                        >
                          {isProcessing ? <div className="mya-spinner" /> : <I.Check />}
                          {isProcessing ? 'Đang xử lý...' : `Chấp nhận · ${fmtVnd(auction.currentPrice)}`}
                        </button>
                      )}

                      {/* Row 1: View + Edit + Duplicate */}
                      <div className="mya-btn-row">
                        <Link to={`/auctions/${auction.id}`} className="mya-btn outline">
                          <I.Eye /> Xem
                        </Link>
                        <Link to={`/auctions/${auction.id}/edit`} className="mya-btn outline">
                          <I.Edit /> Sửa
                        </Link>
                        <button
                          className="mya-btn outline"
                          onClick={() => handleDuplicate(auction.id)}
                          disabled={isDuplicating}
                          id={`mya-dup-${auction.id}`}
                        >
                          {isDuplicating ? <div className="mya-spinner" style={{ borderTopColor: '#475569', borderColor: '#CBD5E1' }} /> : <I.Copy />}
                          {isDuplicating ? '...' : 'Sao'}
                        </button>
                        {/* Cancel */}
                        {canCancel(auction) && (
                          <button
                            className="mya-btn cancel"
                            onClick={() => handleCancelAuction(auction.id)}
                            disabled={isProcessing}
                            id={`mya-cancel-${auction.id}`}
                          >
                            <I.XCircle /> Hủy
                          </button>
                        )}
                      </div>

                      {/* Delete (draft only) */}
                      {auction.status === 0 && (
                        <button
                          className="mya-btn danger"
                          style={{ width: '100%' }}
                          onClick={() => handleDelete(auction.id)}
                          id={`mya-delete-${auction.id}`}
                        >
                          <I.Trash /> Xóa đấu giá này
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyAuctions;
