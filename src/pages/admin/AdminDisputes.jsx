import { useState, useEffect, useMemo } from 'react';
import { disputeService } from '../../services/disputeService';

const STATUS_CONFIG = {
  0: { label: 'Đang mở', color: 'bg-amber-100 text-amber-700', icon: '🔔' },
  1: { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700', icon: '🔍' },
  2: { label: 'Buyer thắng', color: 'bg-green-100 text-green-700', icon: '✅' },
  3: { label: 'Seller thắng', color: 'bg-green-100 text-green-700', icon: '✅' },
  4: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-600', icon: '🔒' },
};

const REASON_TEXT = {
  0: 'Không nhận được hàng', 1: 'Không đúng mô tả', 2: 'Hàng bị hỏng',
  3: 'Giao nhầm hàng', 4: 'Seller không giao', 5: 'Buyer không thanh toán',
  6: 'Nghi lừa đảo', 7: 'Lý do khác',
};

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: '0', label: '🔔 Đang mở' },
  { value: '1', label: '🔍 Đang xem xét' },
  { value: '2', label: '✅ Buyer thắng' },
  { value: '3', label: '✅ Seller thắng' },
  { value: '4', label: '🔒 Đã đóng' },
];

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Resolve modal
  const [resolveModal, setResolveModal] = useState(null); // disputeId
  const [resolveForm, setResolveForm] = useState({ resolution: 2, adminNote: '', resolutionDetail: '' });
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, [statusFilter, page]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await disputeService.getAllDisputes({
        status: statusFilter,
        page,
        pageSize: 20,
      });
      setDisputes(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id) => {
    if (!window.confirm('Tiếp nhận xem xét tranh chấp này?')) return;
    try {
      await disputeService.reviewDispute(id);
      await loadDisputes();
    } catch (err) {
      alert(err.message || 'Lỗi tiếp nhận');
    }
  };

  const handleResolve = async () => {
    if (!resolveForm.adminNote.trim()) {
      alert('Vui lòng nhập ghi chú phán quyết');
      return;
    }
    try {
      setResolving(true);
      await disputeService.resolveDispute(resolveModal, resolveForm);
      setResolveModal(null);
      await loadDisputes();
    } catch (err) {
      alert(err.message || 'Lỗi phán quyết');
    } finally {
      setResolving(false);
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Đóng tranh chấp này?')) return;
    try {
      await disputeService.closeDispute(id);
      await loadDisputes();
    } catch (err) {
      alert(err.message || 'Lỗi đóng');
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return disputes;
    const s = search.toLowerCase();
    return disputes.filter(d =>
      d.productTitle?.toLowerCase().includes(s) ||
      d.buyerName?.toLowerCase().includes(s) ||
      d.sellerName?.toLowerCase().includes(s) ||
      d.id?.includes(s)
    );
  }, [disputes, search]);

  const stats = useMemo(() => ({
    open: disputes.filter(d => d.status === 0).length,
    reviewing: disputes.filter(d => d.status === 1).length,
    resolved: disputes.filter(d => [2, 3].includes(d.status)).length,
    closed: disputes.filter(d => d.status === 4).length,
  }), [disputes]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">⚖️ Quản lý Tranh chấp</h1>
        <p className="text-gray-500 mt-1">Xem xét và giải quyết tranh chấp giữa người mua và người bán</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Đang mở', count: stats.open, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '🔔' },
          { label: 'Đang xem xét', count: stats.reviewing, color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔍' },
          { label: 'Đã giải quyết', count: stats.resolved, color: 'bg-green-50 text-green-700 border-green-200', icon: '✅' },
          { label: 'Đã đóng', count: stats.closed, color: 'bg-gray-50 text-gray-600 border-gray-200', icon: '🔒' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.color}`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-sm">{s.icon} {s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm theo sản phẩm, người dùng..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-400 outline-none"
        >
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={loadDisputes} className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
          🔄
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🕊️</div>
          <h3 className="text-lg font-semibold text-gray-600">Không có tranh chấp nào</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Người mua/bán</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Lý do</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d) => {
                const st = STATUS_CONFIG[d.status] || STATUS_CONFIG[0];
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {d.productImage
                            ? <img src={d.productImage} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center">📦</div>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm truncate max-w-[200px]">{d.productTitle}</p>
                          <p className="text-xs text-gray-400">ID: #{d.id?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">🛒 {d.buyerName || 'N/A'}</p>
                      <p className="text-sm">🏪 {d.sellerName || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{REASON_TEXT[d.reason]}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${st.color}`}>
                        {st.icon} {st.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{new Date(d.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {d.status === 0 && (
                          <button onClick={() => handleReview(d.id)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                            🔍 Tiếp nhận
                          </button>
                        )}
                        {(d.status === 0 || d.status === 1) && (
                          <button onClick={() => { setResolveModal(d.id); setResolveForm({ resolution: 2, adminNote: '', resolutionDetail: '' }); }}
                            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                            ⚖️ Phán quyết
                          </button>
                        )}
                        {(d.status === 0 || d.status === 1) && (
                          <button onClick={() => handleClose(d.id)}
                            className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                            🔒 Đóng
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50">← Trước</button>
              <span className="text-sm text-gray-500">Trang {page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50">Sau →</button>
            </div>
          )}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setResolveModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚖️ Phán quyết tranh chấp</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kết quả</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setResolveForm(f => ({ ...f, resolution: 2 }))}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                      resolveForm.resolution === 2
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    🛒 Buyer thắng
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolveForm(f => ({ ...f, resolution: 3 }))}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                      resolveForm.resolution === 3
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    🏪 Seller thắng
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú phán quyết *</label>
                <textarea
                  value={resolveForm.adminNote}
                  onChange={(e) => setResolveForm(f => ({ ...f, adminNote: e.target.value }))}
                  placeholder="Giải thích lý do phán quyết..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chi tiết giải quyết</label>
                <input
                  type="text"
                  value={resolveForm.resolutionDetail}
                  onChange={(e) => setResolveForm(f => ({ ...f, resolutionDetail: e.target.value }))}
                  placeholder="VD: Hoàn tiền 100%, gửi lại hàng..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setResolveModal(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
                <button onClick={handleResolve} disabled={resolving || !resolveForm.adminNote.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {resolving ? '⏳ Đang xử lý...' : '⚖️ Xác nhận phán quyết'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
