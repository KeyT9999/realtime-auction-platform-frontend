// Mục đích tệp: Trien khai logic/chuc nang chinh cua file AdminWithdrawals.
import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import './AdminWithdrawals.css';
import { getErrorMessage } from '../../utils/errorUtils';

const AdminWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [transactionCode, setTransactionCode] = useState('');
    const [transactionProof, setTransactionProof] = useState('');
    const [actualAmount, setActualAmount] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => { loadWithdrawals(); }, [statusFilter]);

    const loadWithdrawals = async () => {
        try {
            setLoading(true);
            const status = statusFilter !== '' ? parseInt(statusFilter) : null;
            const data = await adminService.getWithdrawals(status);
            setWithdrawals(data.withdrawals || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadDetail = async (id) => {
        try {
            const data = await adminService.getWithdrawalDetail(id);
            setSelectedWithdrawal(data);
            setShowDetailModal(true);
        } catch { toast.error('Không thể tải chi tiết'); }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Duyệt yêu cầu rút tiền này?')) return;
        try {
            setActionLoading(true);
            await adminService.approveWithdrawal(id);
            toast.success('Đã duyệt yêu cầu rút tiền');
            await loadWithdrawals();
            setShowDetailModal(false);
        } catch (err) { toast.error(getErrorMessage(err, 'Lỗi khi duyệt')); }
        finally { setActionLoading(false); }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
        try {
            setActionLoading(true);
            await adminService.rejectWithdrawal(id, rejectReason);
            toast.success('Đã từ chối yêu cầu rút tiền');
            setRejectReason('');
            await loadWithdrawals();
            setShowDetailModal(false);
        } catch (err) { toast.error(getErrorMessage(err, 'Lỗi khi từ chối')); }
        finally { setActionLoading(false); }
    };

    const handleComplete = async (id) => {
        if (!transactionCode.trim()) { toast.error('Vui lòng nhập mã giao dịch ngân hàng'); return; }
        try {
            setActionLoading(true);
            const actualAmountValue = actualAmount ? parseFloat(actualAmount) : null;
            await adminService.completeWithdrawal(id, transactionCode, transactionProof || null, actualAmountValue);
            toast.success('Đã hoàn tất rút tiền');
            setTransactionCode('');
            setTransactionProof('');
            setActualAmount('');
            await loadWithdrawals();
            setShowDetailModal(false);
        } catch (err) { toast.error(getErrorMessage(err, 'Lỗi khi hoàn tất')); }
        finally { setActionLoading(false); }
    };

    const handleRevert = async (id) => {
        if (!window.confirm('Chuyển yêu cầu về trạng thái chờ duyệt?')) return;
        try {
            setActionLoading(true);
            await adminService.revertWithdrawal(id);
            toast.success('Đã chuyển về chờ duyệt');
            await loadWithdrawals();
            setShowDetailModal(false);
        } catch (err) { toast.error(getErrorMessage(err, 'Lỗi khi chuyển trạng thái')); }
        finally { setActionLoading(false); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const getStatusInfo = (status) => {
        const statuses = {
            0: { text: 'Chờ OTP', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)' },
            1: { text: 'Chờ duyệt', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.1)' },
            2: { text: 'Đang xử lý', color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.1)' },
            3: { text: 'Hoàn tất', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            4: { text: 'Từ chối', color: '#f43f5e', bg: 'rgba(239, 68, 68, 0.1)' },
            5: { text: 'Đã hủy', color: '#94a3b8', bg: 'rgba(107, 114, 128, 0.1)' }
        };
        return statuses[status] || { text: 'N/A', color: '#94a3b8', bg: 'rgba(107, 114, 128, 0.1)' };
    };

    const statusOptions = [
        { value: '', label: 'Tất cả' },
        { value: '0', label: 'Chờ xác nhận OTP' },
        { value: '1', label: 'Chờ duyệt' },
        { value: '2', label: 'Đang xử lý' },
        { value: '3', label: 'Hoàn tất' },
        { value: '4', label: 'Từ chối' },
        { value: '5', label: 'Đã hủy' },
    ];

    if (loading) return <Loading />;
    if (error) return <Alert type="error" message={error} />;

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">Quản lý rút tiền</h1>

                {/* Stats */}
                <div className="admin-wd-stats">
                    <div className="stat-card pending">
                        <span className="stat-value">{withdrawals.filter(w => w.status === 1).length}</span>
                        <span className="stat-label">Chờ duyệt</span>
                    </div>
                    <div className="stat-card processing">
                        <span className="stat-value">{withdrawals.filter(w => w.status === 2).length}</span>
                        <span className="stat-label">Đang xử lý</span>
                    </div>
                    <div className="stat-card completed">
                        <span className="stat-value">{withdrawals.filter(w => w.status === 3).length}</span>
                        <span className="stat-label">Hoàn tất</span>
                    </div>
                    <div className="stat-card total-amount">
                        <span className="stat-value">{formatCurrency(withdrawals.filter(w => w.status === 3).reduce((s, w) => s + (w.amount || 0), 0))}</span>
                        <span className="stat-label">Tổng đã rút</span>
                    </div>
                </div>

                {/* Filter */}
                <Card className="mb-6">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-slate-400">Trạng thái:</label>
                        <select className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 focus:bg-slate-800 transition-all duration-200" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            {statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </select>
                        <button className="px-4 py-2 bg-amber-500 text-slate-900 font-semibold rounded-xl text-sm hover:bg-amber-600 transition-colors" onClick={loadWithdrawals}>Làm mới</button>
                    </div>
                </Card>

                {/* List */}
                <div className="space-y-3">
                    {withdrawals.length === 0 ? (
                        <Card><p className="text-center text-slate-400 py-8">Không có yêu cầu rút tiền nào.</p></Card>
                    ) : withdrawals.map(w => {
                        const statusInfo = getStatusInfo(w.status);
                        return (
                            <div key={w.id} className="admin-wd-item" onClick={() => loadDetail(w.id)}>
                                <div className="wd-item-left">
                                    <div className="wd-user-info">
                                        <span className="wd-amount">{formatCurrency(w.amount)}</span>
                                        <span className="wd-arrow">→</span>
                                        <span className="wd-final">{formatCurrency(w.finalAmount)}</span>
                                    </div>
                                    {w.bankSnapshot && (
                                        <div className="wd-bank">{w.bankSnapshot.bankName} - ***{w.bankSnapshot.accountNumber?.slice(-4)} ({w.bankSnapshot.accountHolder})</div>
                                    )}
                                    <div className="wd-date">{new Date(w.createdAt).toLocaleString('vi-VN')}</div>
                                </div>
                                <div className="wd-item-right">
                                    <span className="wd-status" style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}>{statusInfo.text}</span>
                                    {w.status === 1 && <span className="wd-action-hint">Nhấn để duyệt</span>}
                                    {w.status === 2 && <span className="wd-action-hint">Nhấn để hoàn tất</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedWithdrawal && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="admin-wd-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết yêu cầu rút tiền</h2>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Người yêu cầu</label>
                                    <span>{selectedWithdrawal.userName || 'N/A'} ({selectedWithdrawal.userEmail || ''})</span>
                                </div>
                                <div className="detail-item">
                                    <label>Số tiền</label>
                                    <span className="amount-highlight">{formatCurrency(selectedWithdrawal.amount)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Phí</label>
                                    <span>{formatCurrency(selectedWithdrawal.processingFee)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Số tiền chuyển</label>
                                    <span className="amount-highlight">{formatCurrency(selectedWithdrawal.finalAmount)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Trạng thái</label>
                                    <span className="wd-status" style={{ color: getStatusInfo(selectedWithdrawal.status).color, backgroundColor: getStatusInfo(selectedWithdrawal.status).bg }}>
                                        {selectedWithdrawal.statusText}
                                    </span>
                                </div>
                                {selectedWithdrawal.bankSnapshot && (
                                    <div className="detail-item full-width">
                                        <label>Tài khoản ngân hàng</label>
                                        <div className="bank-detail-card">
                                            <div><strong>{selectedWithdrawal.bankSnapshot.bankName}</strong></div>
                                            <div>STK: {selectedWithdrawal.bankSnapshot.accountNumber}</div>
                                            <div>Chu TK: {selectedWithdrawal.bankSnapshot.accountHolder}</div>
                                        </div>
                                    </div>
                                )}
                                {selectedWithdrawal.rejectionReason && (
                                    <div className="detail-item full-width">
                                        <label>Lý do từ chối</label>
                                        <span className="rejection-text">{selectedWithdrawal.rejectionReason}</span>
                                    </div>
                                )}
                                {selectedWithdrawal.transactionCode && (
                                    <div className="detail-item">
                                        <label>Mã giao dịch NH</label>
                                        <span>{selectedWithdrawal.transactionCode}</span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <label>Ngày tạo</label>
                                    <span>{new Date(selectedWithdrawal.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>

                            {/* Actions based on status */}
                            {selectedWithdrawal.status === 1 && (
                                <div className="admin-actions">
                                    <h3>Hành động</h3>
                                    <div className="action-buttons">
                                        <button className="btn-approve" onClick={() => handleApprove(selectedWithdrawal.id)} disabled={actionLoading}>
                                            {actionLoading ? 'Đang xử lý...' : 'Duyệt yêu cầu'}
                                        </button>
                                    </div>
                                    <div className="reject-section">
                                        <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Nhập lý do từ chối..." className="reject-input" />
                                        <button className="btn-reject" onClick={() => handleReject(selectedWithdrawal.id)} disabled={actionLoading || !rejectReason.trim()}>
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedWithdrawal.status === 2 && (
                                <div className="admin-actions">
                                    <h3>Hoàn tất chuyển khoản</h3>
                                    <p className="action-note">Chuyển <strong>{formatCurrency(selectedWithdrawal.finalAmount)}</strong> đến tài khoản trên, sau đó nhập mã giao dịch.</p>
                                    <div className="complete-section">
                                        <input type="text" value={transactionCode} onChange={(e) => setTransactionCode(e.target.value)} placeholder="Nhập mã giao dịch ngân hàng (bắt buộc)..." className="reject-input" required />
                                        <input type="text" value={transactionProof} onChange={(e) => setTransactionProof(e.target.value)} placeholder="URL chứng từ (tùy chọn)..." className="reject-input" />
                                        <input type="number" value={actualAmount} onChange={(e) => setActualAmount(e.target.value)} placeholder={`Số tiền thực chuyển (tùy chọn, mặc định: ${formatCurrency(selectedWithdrawal.finalAmount)})`} className="reject-input" step="1000" />
                                        <small className="text-slate-400">Lưu ý: Số tiền thực chuyển phải đúng với số tiền yêu cầu ({formatCurrency(selectedWithdrawal.finalAmount)}). Nếu sai, vui lòng từ chối và yêu cầu user tạo lại.</small>
                                        <button className="btn-complete" onClick={() => handleComplete(selectedWithdrawal.id)} disabled={actionLoading || !transactionCode.trim()}>
                                            {actionLoading ? 'Đang xử lý...' : 'Xác nhận đã chuyển'}
                                        </button>
                                    </div>
                                    <button className="btn-revert" onClick={() => handleRevert(selectedWithdrawal.id)} disabled={actionLoading}>
                                        Chuyển về chờ duyệt
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWithdrawals;
