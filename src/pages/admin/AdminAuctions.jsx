import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auctionService } from '../../services/auctionService';
import { categoryService } from '../../services/categoryService';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';

/* ─── Status helpers ─── */
const STATUS_CONFIG = {
  0: { label: 'Nháp',           dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  1: { label: 'Đang diễn ra',  dot: 'bg-blue-500 animate-pulse', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
  2: { label: 'Chờ xử lý',     dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  3: { label: 'Hoàn thành',    dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100', icon: 'check_circle' },
  4: { label: 'Đã hủy',        dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', icon: 'cancel' },
  6: { label: 'Chờ duyệt',     dot: 'bg-orange-500 animate-pulse', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: 'hourglass_top' },
  7: { label: 'Bị từ chối',    dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: 'block' },
};

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: '6', label: '🔸 Chờ duyệt' },
  { value: '1', label: 'Đang diễn ra' },
  { value: '0', label: 'Nháp' },
  { value: '2', label: 'Chờ xử lý' },
  { value: '3', label: 'Hoàn thành' },
  { value: '4', label: 'Đã hủy' },
  { value: '7', label: 'Bị từ chối' },
];

const PAGE_SIZE = 10;

const formatPrice = (v) =>
  (v ?? 0).toLocaleString('vi-VN') + ' VND';

/* ─── StatusBadge ─── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[0];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      {cfg.icon
        ? <span className="material-symbols-outlined text-xs mr-1">{cfg.icon}</span>
        : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />}
      {cfg.label}
    </span>
  );
};

/* ─── Main Component ─── */
const AdminAuctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', categoryId: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Approval workflow state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingAuctionId, setRejectingAuctionId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(null); // auction id being processed

  useEffect(() => {
    setPage(1);
  }, [filters, search]);

  useEffect(() => {
    loadData();
  }, [filters, search, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
        pageSize: PAGE_SIZE,
      };
      if (search.trim()) params.keyword = search.trim();

      const [auctionsData, categoriesData] = await Promise.all([
        auctionService.getAuctions(params),
        categoryService.getCategories(),
      ]);

      const items = Array.isArray(auctionsData) ? auctionsData : (auctionsData?.items ?? []);
      setAuctions(items);
      setTotalCount(auctionsData?.totalCount ?? items.length);
      setTotalPages(auctionsData?.totalPages ?? Math.ceil((auctionsData?.totalCount ?? items.length) / PAGE_SIZE));

      const cats = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.items ?? categoriesData?.data ?? []);
      setCategories(cats);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Không thể tải danh sách đấu giá');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await auctionService.updateAuctionStatus(id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đấu giá này?')) return;
    try {
      await auctionService.deleteAuction(id);
      toast.success('Đã xóa đấu giá');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Approval workflow handlers ──
  const handleApprove = async (id) => {
    if (!window.confirm('Bạn xác nhận DUYỆT phiên đấu giá này?')) return;
    try {
      setProcessing(id);
      await auctionService.approveAuction(id);
      toast.success('✅ Đã duyệt phiên đấu giá!');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi duyệt');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectingAuctionId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setProcessing(rejectingAuctionId);
      await auctionService.rejectAuction(rejectingAuctionId, rejectReason.trim());
      toast.success('❌ Đã từ chối phiên đấu giá!');
      setShowRejectModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi từ chối');
    } finally {
      setProcessing(null);
    }
  };

  /* Pagination range */
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxShow = 5;
    let start = Math.max(1, page - Math.floor(maxShow / 2));
    let end = Math.min(totalPages, start + maxShow - 1);
    start = Math.max(1, end - maxShow + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Google Material Symbols */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ──── Title & Actions ──── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Quản lý Đấu giá
            </h2>
            <p className="text-slate-500 mt-1">
              Theo dõi, kiểm duyệt và điều hành các phiên đấu giá toàn hệ thống.
            </p>
          </div>
          <Link to="/create-auction">
            <button className="bg-primary hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">add</span>
              Tạo phiên mới
            </button>
          </Link>
        </div>

        {/* ──── Filters ──── */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[220px]">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-slate-400"
                placeholder="Tìm kiếm phiên đấu giá..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {/* Status */}
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Trạng thái</span>
            <select
              className="border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-primary/20 py-2.5 px-3 bg-white"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Category */}
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Danh mục</span>
            <select
              className="border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-primary/20 py-2.5 px-3 bg-white"
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {/* Refresh button */}
          <button
            onClick={loadData}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            title="Làm mới"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
          </button>
        </div>

        {/* ──── Table ──── */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 flex items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 text-red-600 justify-center">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-medium">{error}</p>
              <button onClick={loadData} className="ml-4 text-primary text-sm underline">Thử lại</button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Người bán</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá hiện tại</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auctions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-5xl text-slate-300">inventory_2</span>
                          <p className="text-slate-500 font-medium">Không tìm thấy phiên đấu giá nào</p>
                          <p className="text-slate-400 text-sm">Thử thay đổi bộ lọc hoặc tạo phiên đấu giá mới.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    auctions.map((auction) => (
                      <tr
                        key={auction.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/auctions/${auction.id}`)}
                      >
                        {/* Sản phẩm */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                              {auction.images?.[0] ? (
                                <img
                                  src={auction.images[0]}
                                  alt={auction.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-slate-400 text-xl">image</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors truncate max-w-[260px]">
                                {auction.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                ID: #{auction.id?.slice(-6)?.toUpperCase() ?? '------'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Người bán */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-700 font-medium">
                              {auction.sellerName || 'Không xác định'}
                            </span>
                            <span className="text-xs text-slate-400 mt-0.5">
                              {auction.categoryName || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Giá hiện tại */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">
                              {formatPrice(auction.currentPrice)}
                            </span>
                            <span className={`text-xs mt-0.5 font-medium ${auction.bidCount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                              {auction.bidCount > 0 ? `${auction.bidCount} lượt đấu giá` : 'Chưa có lượt đấu'}
                            </span>
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="px-6 py-4">
                          <StatusBadge status={auction.status} />
                        </td>

                        {/* Thao tác */}
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* View */}
                            <Link to={`/auctions/${auction.id}`}>
                              <button
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                              </button>
                            </Link>

                            {/* Status change dropdown */}
                            <div className="relative group/status">
                              <button
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Đổi trạng thái"
                              >
                                <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-20">
                                {statusOptions.slice(1).map(opt => (
                                  <button
                                    key={opt.value}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition-colors flex items-center gap-2"
                                    onClick={() => handleStatusChange(auction.id, parseInt(opt.value))}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[parseInt(opt.value)]?.dot?.replace(' animate-pulse', '') ?? 'bg-slate-400'}`} />
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(auction.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>

                            {/* ── Approve / Reject buttons (only for PendingApproval) ── */}
                            {auction.status === 6 && (
                              <>
                                <button
                                  onClick={() => handleApprove(auction.id)}
                                  disabled={processing === auction.id}
                                  className="ml-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Duyệt phiên đấu giá"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => openRejectModal(auction.id)}
                                  disabled={processing === auction.id}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Từ chối phiên đấu giá"
                                >
                                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                                  Từ chối
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ──── Pagination ──── */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-sm text-slate-500">
                  Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} trên {totalCount} phiên đấu giá
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <div className="flex items-center gap-1">
                    {pageNumbers[0] > 1 && (
                      <>
                        <button onClick={() => setPage(1)} className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors">1</button>
                        {pageNumbers[0] > 2 && <span className="px-1 text-slate-400">...</span>}
                      </>
                    )}
                    {pageNumbers.map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                          p === page
                            ? 'bg-primary text-white shadow-sm'
                            : 'hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    {pageNumbers[pageNumbers.length - 1] < totalPages && (
                      <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
                        <button onClick={() => setPage(totalPages)} className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors">{totalPages}</button>
                      </>
                    )}
                  </div>
                  <button
                    className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════ Rejection Modal ══════ */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-600">block</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Từ chối phiên đấu giá</h3>
                <p className="text-sm text-slate-500">Vui lòng nhập lý do từ chối</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <textarea
                className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400 resize-none outline-none transition-all"
                rows={4}
                placeholder="Nhập lý do từ chối... (VD: Hình ảnh không rõ ràng, thiếu mô tả sản phẩm)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || processing}
                className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuctions;
