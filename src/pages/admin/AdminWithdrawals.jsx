import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import './AdminWithdrawals.css';

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
        } catch (err) { toast.error('Khong the tai chi tiet'); }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Duyet yeu cau rut tien nay?')) return;
        try {
            setActionLoading(true);
            await adminService.approveWithdrawal(id);
            toast.success('Da duyet yeu cau rut tien');
            await loadWithdrawals();
            setShowDetailModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Loi khi duyet'); }
        finally { setActionLoading(false); }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) { toast.error('Vui long nhap ly do tu choi'); return; }
        try {
            setActionLoading(true);
            await adminService.rejectWithdrawal(id, rejectReason);
            toast.success('Da tu choi yeu cau rut tien');
            setRejectReason('');
            await loadWithdrawals();
            setShowDetailModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Loi khi tu choi'); }
        finally { setActionLoading(false); }
    };

    const handleComplete = async (id) => {
        if (!transactionCode.trim()) { toast.error('Vui long nhap ma giao dich ngan hang'); return; }
        try {
            setActionLoading(true);
            const actualAmountValue = actualAmount ? parseFloat(actualAmount) : null;
            await adminService.completeWithdrawal(id, transactionCode, transactionProof || null, actualAmountValue);
            toast.success('Da hoan tat rut tien');
            setTransactionCode('');
            setTransactionProof('');
            setActualAmount('');
            await loadWithdrawals();
            setShowDetailModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Loi khi hoan tat'); }
        finally { setActionLoading(false); }
    };

    const handleRevert = async (id) => {
        if (!window.confirm('Revert yeu cau ve trang thai cho duyet?')) return;
        try {
            setActionLoading(true);
            await adminService.revertWithdrawal(id);
            toast.success('Da revert yeu cau');
            await loadWithdrawals();
            setShowDetailModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Loi khi revert'); }
        finally { setActionLoading(false); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const getStatusInfo = (status) => {
        const statuses = {
            0: { text: 'Cho OTP', color: '#F59E0B', bg: '#FEF3C7' },
            1: { text: 'Cho duyet', color: '#3B82F6', bg: '#DBEAFE' },
            2: { text: 'Dang xu ly', color: '#8B5CF6', bg: '#EDE9FE' },
            3: { text: 'Hoan tat', color: '#10B981', bg: '#D1FAE5' },
            4: { text: 'Tu choi', color: '#EF4444', bg: '#FEE2E2' },
            5: { text: 'Da huy', color: '#6B7280', bg: '#F3F4F6' }
        };
        return statuses[status] || { text: 'N/A', color: '#6B7280', bg: '#F3F4F6' };
    };

    const statusOptions = [
        { value: '', label: 'Tat ca' },
        { value: '0', label: 'Cho xac nhan OTP' },
        { value: '1', label: 'Cho duyet' },
        { value: '2', label: 'Dang xu ly' },
        { value: '3', label: 'Hoan tat' },
        { value: '4', label: 'Tu choi' },
        { value: '5', label: 'Da huy' },
    ];

    if (loading) return <Loading />;
    if (error) return <Alert type="error" message={error} />;

    return (
        <div className="min-h-screen bg-background-secondary">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-text-primary mb-8">Quan ly Rut tien</h1>

                {/* Stats */}
                <div className="admin-wd-stats">
                    <div className="stat-card pending">
                        <span className="stat-value">{withdrawals.filter(w => w.status === 1).length}</span>
                        <span className="stat-label">Cho duyet</span>
                    </div>
                    <div className="stat-card processing">
                        <span className="stat-value">{withdrawals.filter(w => w.status === 2).length}</span>
                        <span className="stat-label">Dang xu ly</span>
                    </div>
                    <div className="stat-card completed">
                        <span className="stat-value">{withdrawals.filter(w => w.status === 3).length}</span>
                        <span className="stat-label">Hoan tat</span>
                    </div>
                    <div className="stat-card total-amount">
                        <span className="stat-value">{formatCurrency(withdrawals.filter(w => w.status === 3).reduce((s, w) => s + (w.amount || 0), 0))}</span>
                        <span className="stat-label">Tong da rut</span>
                    </div>
                </div>

                {/* Filter */}
                <Card className="mb-6">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-text-primary">Trang thai:</label>
                        <select className="px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            {statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </select>
                        <button className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-hover" onClick={loadWithdrawals}>Lam moi</button>
                    </div>
                </Card>

                {/* List */}
                <div className="space-y-3">
                    {withdrawals.length === 0 ? (
                        <Card><p className="text-center text-text-secondary py-8">Khong co yeu cau rut tien nao.</p></Card>
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
                                    {w.status === 1 && <span className="wd-action-hint">Click de duyet</span>}
                                    {w.status === 2 && <span className="wd-action-hint">Click de hoan tat</span>}
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
                            <h2>Chi tiet yeu cau rut tien</h2>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Nguoi yeu cau</label>
                                    <span>{selectedWithdrawal.userName || 'N/A'} ({selectedWithdrawal.userEmail || ''})</span>
                                </div>
                                <div className="detail-item">
                                    <label>So tien</label>
                                    <span className="amount-highlight">{formatCurrency(selectedWithdrawal.amount)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Phi</label>
                                    <span>{formatCurrency(selectedWithdrawal.processingFee)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>So tien chuyen</label>
                                    <span className="amount-highlight">{formatCurrency(selectedWithdrawal.finalAmount)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Trang thai</label>
                                    <span className="wd-status" style={{ color: getStatusInfo(selectedWithdrawal.status).color, backgroundColor: getStatusInfo(selectedWithdrawal.status).bg }}>
                                        {selectedWithdrawal.statusText}
                                    </span>
                                </div>
                                {selectedWithdrawal.bankSnapshot && (
                                    <div className="detail-item full-width">
                                        <label>Tai khoan ngan hang</label>
                                        <div className="bank-detail-card">
                                            <div><strong>{selectedWithdrawal.bankSnapshot.bankName}</strong></div>
                                            <div>STK: {selectedWithdrawal.bankSnapshot.accountNumber}</div>
                                            <div>Chu TK: {selectedWithdrawal.bankSnapshot.accountHolder}</div>
                                        </div>
                                    </div>
                                )}
                                {selectedWithdrawal.rejectionReason && (
                                    <div className="detail-item full-width">
                                        <label>Ly do tu choi</label>
                                        <span className="rejection-text">{selectedWithdrawal.rejectionReason}</span>
                                    </div>
                                )}
                                {selectedWithdrawal.transactionCode && (
                                    <div className="detail-item">
                                        <label>Ma giao dich NH</label>
                                        <span>{selectedWithdrawal.transactionCode}</span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <label>Ngay tao</label>
                                    <span>{new Date(selectedWithdrawal.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>

                            {/* Actions based on status */}
                            {selectedWithdrawal.status === 1 && (
                                <div className="admin-actions">
                                    <h3>Hanh dong</h3>
                                    <div className="action-buttons">
                                        <button className="btn-approve" onClick={() => handleApprove(selectedWithdrawal.id)} disabled={actionLoading}>
                                            {actionLoading ? 'Dang xu ly...' : 'Duyet yeu cau'}
                                        </button>
                                    </div>
                                    <div className="reject-section">
                                        <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Nhap ly do tu choi..." className="reject-input" />
                                        <button className="btn-reject" onClick={() => handleReject(selectedWithdrawal.id)} disabled={actionLoading || !rejectReason.trim()}>
                                            Tu choi
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedWithdrawal.status === 2 && (
                                <div className="admin-actions">
                                    <h3>Hoan tat chuyen khoan</h3>
                                    <p className="action-note">Chuyen <strong>{formatCurrency(selectedWithdrawal.finalAmount)}</strong> den tai khoan tren, sau do nhap ma giao dich.</p>
                                    <div className="complete-section">
                                        <input type="text" value={transactionCode} onChange={(e) => setTransactionCode(e.target.value)} placeholder="Nhap ma giao dich ngan hang (bat buoc)..." className="reject-input" required />
                                        <input type="text" value={transactionProof} onChange={(e) => setTransactionProof(e.target.value)} placeholder="URL proof (tuy chon)..." className="reject-input" />
                                        <input type="number" value={actualAmount} onChange={(e) => setActualAmount(e.target.value)} placeholder={`So tien thuc chuyen (tuy chon, mac dinh: ${formatCurrency(selectedWithdrawal.finalAmount)})`} className="reject-input" step="1000" />
                                        <small className="text-text-secondary">Luu y: So tien thuc chuyen phai dung voi so tien yeu cau ({formatCurrency(selectedWithdrawal.finalAmount)}). Neu sai, vui long tu choi va yeu cau user tao lai.</small>
                                        <button className="btn-complete" onClick={() => handleComplete(selectedWithdrawal.id)} disabled={actionLoading || !transactionCode.trim()}>
                                            {actionLoading ? 'Dang xu ly...' : 'Xac nhan da chuyen'}
                                        </button>
                                    </div>
                                    <button className="btn-revert" onClick={() => handleRevert(selectedWithdrawal.id)} disabled={actionLoading}>
                                        Revert ve cho duyet
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
