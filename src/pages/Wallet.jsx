import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { withdrawalService } from '../services/withdrawalService';
import { bankAccountService } from '../services/bankAccountService';
import { toast } from 'react-toastify';
import './Wallet.css';

const Wallet = () => {
    const { user, refreshUser, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('deposit');
    const [depositAmount, setDepositAmount] = useState(100000);
    const [isLoading, setIsLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [txPage, setTxPage] = useState(1);
    const [txTotalPages, setTxTotalPages] = useState(0);
    const [txFilters, setTxFilters] = useState({ type: '', dateFrom: '', dateTo: '' });
    const [loadingMoreTx, setLoadingMoreTx] = useState(false);

    // Withdrawal states
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [selectedBankId, setSelectedBankId] = useState('');
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

    // OTP states
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [currentWithdrawalId, setCurrentWithdrawalId] = useState(null);
    const [otpCountdown, setOtpCountdown] = useState(0);

    // Bank account form states
    const [showBankForm, setShowBankForm] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [bankForm, setBankForm] = useState({
        bankName: '', accountNumber: '', accountHolder: '', branch: ''
    });

    const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

    useEffect(() => {
        const loadData = async () => {
            try { 
                await refreshUser(); 
                await loadWallet(); // Load wallet data (availableBalance, escrowBalance, heldBalance)
            } catch (error) { console.error('Error refreshing user:', error); }
            await loadTransactions();
            await loadBankAccounts();
            await loadWithdrawals();
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Polling for pending deposit transactions
    useEffect(() => {
        const pendingTransactions = transactions.filter(
            tx => tx.type === 0 && (tx.status === 0 || tx.status === undefined) && tx.payOsOrderCode
        );
        if (pendingTransactions.length === 0) return;
        const pollInterval = setInterval(async () => {
            for (const tx of pendingTransactions) {
                try {
                    const status = await paymentService.getDepositStatus(tx.payOsOrderCode);
                    if (status?.status === 'PAID') {
                        await refreshUser();
                        await loadTransactions();
                        clearInterval(pollInterval);
                        break;
                    }
                } catch (error) { console.error('Error checking deposit status:', error); }
            }
        }, 3000);
        return () => clearInterval(pollInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions]);

    // OTP countdown timer
    useEffect(() => {
        if (otpCountdown <= 0) return;
        const timer = setInterval(() => setOtpCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [otpCountdown]);

    const loadWallet = async () => {
        try {
            const walletData = await paymentService.getWallet();
            // Merge wallet data into user object
            if (walletData && user) {
                updateUser({
                    availableBalance: walletData.availableBalance || 0,
                    escrowBalance: walletData.escrowBalance || 0,
                    heldBalance: walletData.heldBalance || 0
                });
            }
        } catch (error) { console.error('Error loading wallet:', error); }
    };

    const loadTransactions = async (page = 1, append = false, filtersOverride = null) => {
        const f = filtersOverride ?? txFilters;
        try {
            if (append) setLoadingMoreTx(true);
            else setLoadingTransactions(true);
            const filters = {};
            if (f.type !== '') filters.type = Number(f.type);
            if (f.dateFrom) filters.dateFrom = new Date(f.dateFrom).toISOString().slice(0, 10);
            if (f.dateTo) filters.dateTo = new Date(f.dateTo).toISOString().slice(0, 10);
            const data = await paymentService.getTransactions(page, 20, Object.keys(filters).length ? filters : {});
            const list = data.transactions || [];
            if (append) setTransactions(prev => [...prev, ...list]);
            else setTransactions(list);
            setTxPage(data.page ?? page);
            setTxTotalPages(data.totalPages ?? 0);
        } catch (error) { console.error('Error loading transactions:', error); }
        finally { setLoadingTransactions(false); setLoadingMoreTx(false); }
    };

    const applyTxFilters = () => {
        loadTransactions(1, false, txFilters);
    };

    const loadMoreTransactions = () => {
        if (txPage >= txTotalPages || loadingMoreTx) return;
        loadTransactions(txPage + 1, true);
    };

    const loadBankAccounts = async () => {
        try {
            setLoadingBanks(true);
            const data = await bankAccountService.getBankAccounts();
            setBankAccounts(data.bankAccounts || []);
        } catch (error) { console.error('Error loading bank accounts:', error); }
        finally { setLoadingBanks(false); }
    };

    const loadWithdrawals = async () => {
        try {
            setLoadingWithdrawals(true);
            const data = await withdrawalService.getMyWithdrawals();
            setWithdrawals(data.withdrawals || []);
        } catch (error) { console.error('Error loading withdrawals:', error); }
        finally { setLoadingWithdrawals(false); }
    };

    const handleDeposit = async () => {
        if (depositAmount < 2000) { toast.error('Số tiền nạp tối thiểu là 2.000đ'); return; }
        try {
            setIsLoading(true);
            const result = await paymentService.createDeposit(depositAmount);
            if (result.checkoutUrl) {
                window.open(result.checkoutUrl, '_blank');
                toast.info('Vui lòng hoàn tất thanh toán trên trang PayOS');
            }
        } catch (error) { toast.error(error.response?.data?.message || 'Không thể tạo link nạp tiền'); }
        finally { setIsLoading(false); }
    };

    const handleWithdraw = async () => {
        const amount = Number(withdrawAmount);
        if (!amount || amount < 50000) { toast.error('Số tiền rút tối thiểu là 50.000đ'); return; }
        if (amount > (user?.availableBalance || 0)) { toast.error('Số dư không đủ'); return; }
        if (!selectedBankId) { toast.error('Vui lòng chọn tài khoản ngân hàng'); return; }
        try {
            setIsLoading(true);
            const result = await withdrawalService.createWithdrawal(amount, selectedBankId);
            setCurrentWithdrawalId(result.withdrawalId || result.id);
            setShowOtpModal(true);
            setOtpCountdown(600); // 10 minutes
            toast.success('Đã gửi mã OTP đến email của bạn');
        } catch (error) { toast.error(error.response?.data?.message || 'Không thể tạo yêu cầu rút tiền'); }
        finally { setIsLoading(false); }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) { toast.error('Vui lòng nhập mã OTP 6 số'); return; }
        try {
            setIsLoading(true);
            await withdrawalService.verifyOtp(currentWithdrawalId, otpCode);
            toast.success('Xác nhận thành công! Yêu cầu đang chờ admin duyệt.');
            setShowOtpModal(false);
            setOtpCode('');
            setWithdrawAmount('');
            await loadWithdrawals();
            await refreshUser();
        } catch (error) { toast.error(error.response?.data?.message || 'Mã OTP không đúng'); }
        finally { setIsLoading(false); }
    };

    const handleResendOtp = async () => {
        try {
            await withdrawalService.resendOtp(currentWithdrawalId);
            setOtpCountdown(600);
            toast.success('Đã gửi lại mã OTP');
        } catch (error) { toast.error(error.response?.data?.message || 'Không thể gửi lại OTP'); }
    };

    const handleCancelWithdrawal = async (id) => {
        if (!window.confirm('Bạn có chắc muốn hủy yêu cầu rút tiền này?')) return;
        try {
            await withdrawalService.cancelWithdrawal(id);
            toast.success('Đã hủy yêu cầu rút tiền');
            await loadWithdrawals();
            await refreshUser();
        } catch (error) { toast.error(error.response?.data?.message || 'Không thể hủy yêu cầu'); }
    };

    // Bank account handlers
    const handleSaveBankAccount = async () => {
        if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolder) {
            toast.error('Vui lòng điền đầy đủ thông tin'); return;
        }
        try {
            setIsLoading(true);
            if (editingBank) {
                await bankAccountService.updateBankAccount(editingBank.id, bankForm);
                toast.success('Đã cập nhật tài khoản');
            } else {
                await bankAccountService.createBankAccount(bankForm);
                toast.success('Đã thêm tài khoản ngân hàng');
            }
            setShowBankForm(false);
            setEditingBank(null);
            setBankForm({ bankName: '', accountNumber: '', accountHolder: '', branch: '' });
            await loadBankAccounts();
        } catch (error) { toast.error(error.response?.data?.message || 'Lỗi khi lưu tài khoản'); }
        finally { setIsLoading(false); }
    };

    const handleDeleteBank = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
        try {
            await bankAccountService.deleteBankAccount(id);
            toast.success('Đã xóa tài khoản');
            await loadBankAccounts();
        } catch (error) { toast.error(error.response?.data?.message || 'Không thể xóa'); }
    };

    const handleSetDefault = async (id) => {
        try {
            await bankAccountService.setDefault(id);
            toast.success('Đã đặt mặc định');
            await loadBankAccounts();
        } catch (error) { toast.error(error.response?.data?.message || 'Lỗi'); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getTransactionTypeLabel = (type) => {
        const labels = {
            0: { text: 'Nạp tiền', color: '#10B981' },
            1: { text: 'Rút tiền', color: '#EF4444' },
            2: { text: 'Đặt cọc', color: '#F59E0B' },
            3: { text: 'Hoàn cọc', color: '#10B981' },
            4: { text: 'Thanh toán', color: '#EF4444' },
            5: { text: 'Hoàn tiền', color: '#10B981' },
            6: { text: 'Admin điều chỉnh', color: '#6366F1' },
            7: { text: 'Giữ tiền rút', color: '#F59E0B' },
            8: { text: 'Hoàn tiền rút', color: '#10B981' },
            9: { text: '🔒 Đóng băng Escrow', color: '#3B82F6' },
            10: { text: '✅ Giải phóng Escrow', color: '#10B981' },
            11: { text: '💸 Hoàn Escrow', color: '#8B5CF6' },
        };
        return labels[type] || { text: 'Khác', color: '#6B7280' };
    };

    const getWithdrawalStatusInfo = (status) => {
        const statuses = {
            0: { text: 'Chờ xác nhận OTP', color: '#F59E0B', bg: '#FEF3C7' },
            1: { text: 'Chờ admin duyệt', color: '#3B82F6', bg: '#DBEAFE' },
            2: { text: 'Đang xử lý', color: '#8B5CF6', bg: '#EDE9FE' },
            3: { text: 'Hoàn tất', color: '#10B981', bg: '#D1FAE5' },
            4: { text: 'Bị từ chối', color: '#EF4444', bg: '#FEE2E2' },
            5: { text: 'Đã hủy', color: '#6B7280', bg: '#F3F4F6' }
        };
        return statuses[status] || { text: 'Không xác định', color: '#6B7280', bg: '#F3F4F6' };
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Ví của tôi</h1>
                    <p className="text-text-secondary">Quản lý số dư và giao dịch của bạn</p>
                </div>

                {/* Balance Cards */}
                <div className="balance-cards">
                    <div className="balance-card available">
                        <div className="balance-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="balance-info">
                            <span className="balance-label">Số dư khả dụng</span>
                            <span className="balance-amount">{formatCurrency(user?.availableBalance || 0)}</span>
                        </div>
                    </div>
                    <div className="balance-card held">
                        <div className="balance-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div className="balance-info">
                            <span className="balance-label">🔒 Escrow đơn hàng</span>
                            <span className="balance-amount">{formatCurrency(user?.escrowBalance || 0)}</span>
                            {(user?.escrowBalance || 0) > 0 && (
                                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                    Đang bảo vệ giao dịch — sẽ giải phóng khi nhận hàng
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="balance-card held-withdrawal">
                        <div className="balance-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="balance-info">
                            <span className="balance-label">⏳ Chờ rút tiền</span>
                            <span className="balance-amount">{formatCurrency(user?.heldBalance || 0)}</span>
                        </div>
                    </div>
                    <div className="balance-card total">
                        <div className="balance-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="balance-info">
                            <span className="balance-label">Tổng số dư</span>
                            <span className="balance-amount">{formatCurrency((user?.availableBalance || 0) + (user?.escrowBalance || 0) + (user?.heldBalance || 0))}</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="wallet-tabs">
                    <button className={`wallet-tab ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => setActiveTab('deposit')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nạp tiền
                    </button>
                    <button className={`wallet-tab ${activeTab === 'withdraw' ? 'active' : ''}`} onClick={() => setActiveTab('withdraw')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        Rút tiền
                    </button>
                    <button className={`wallet-tab ${activeTab === 'banks' ? 'active' : ''}`} onClick={() => setActiveTab('banks')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Tài khoản NH
                    </button>
                    <button className={`wallet-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Lịch sử
                    </button>
                </div>

                {/* Deposit Tab */}
                {activeTab === 'deposit' && (
                    <div className="deposit-section">
                        <h2>Nạp tiền</h2>
                        <p className="deposit-desc">Chọn số tiền bạn muốn nạp vào ví</p>
                        <div className="quick-amounts">
                            {quickAmounts.map((amount) => (
                                <button key={amount} className={`quick-btn ${depositAmount === amount ? 'active' : ''}`} onClick={() => setDepositAmount(amount)}>
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                        <div className="custom-amount">
                            <label>Hoặc nhập số tiền khác:</label>
                            <div className="amount-input-wrapper">
                                <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} min={2000} max={100000000} step={1000} />
                                <span className="currency-suffix">VND</span>
                            </div>
                        </div>
                        <button className="deposit-btn" onClick={handleDeposit} disabled={isLoading || depositAmount < 2000}>
                            {isLoading ? (<><span className="spinner"></span> Đang xử lý...</>) : (<><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Nạp {formatCurrency(depositAmount)}</>)}
                        </button>
                    </div>
                )}

                {/* Withdraw Tab */}
                {activeTab === 'withdraw' && (
                    <div className="withdraw-section">
                        <h2>Rút tiền</h2>
                        <p className="deposit-desc">Rút tiền từ ví vào tài khoản ngân hàng của bạn</p>

                        {bankAccounts.length === 0 ? (
                            <div className="empty-state">
                                <p>Bạn chưa có tài khoản ngân hàng nào.</p>
                                <button className="add-bank-btn" onClick={() => { setActiveTab('banks'); setShowBankForm(true); }}>
                                    + Thêm tài khoản ngân hàng
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Tài khoản ngân hàng</label>
                                    <select value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)} className="bank-select">
                                        <option value="">-- Chọn tài khoản --</option>
                                        {bankAccounts.map(bank => (
                                            <option key={bank.id} value={bank.id}>
                                                {bank.bankName} - ***{bank.accountNumber?.slice(-4)} - {bank.accountHolder} {bank.isDefault ? '(Mặc định)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Số tiền rút (tối thiểu 50.000 VND)</label>
                                    <div className="amount-input-wrapper">
                                        <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} min={50000} max={user?.availableBalance || 0} step={1000} placeholder="Nhập số tiền" />
                                        <span className="currency-suffix">VND</span>
                                    </div>
                                    <span className="available-hint">Khả dụng: {formatCurrency(user?.availableBalance || 0)}</span>
                                </div>

                                {Number(withdrawAmount) > 0 && (
                                    <div className="withdraw-summary">
                                        <div className="summary-row"><span>Số tiền rút:</span><span>{formatCurrency(Number(withdrawAmount))}</span></div>
                                        <div className="summary-row"><span>Phí xử lý:</span><span>{formatCurrency(0)}</span></div>
                                        <div className="summary-row total"><span>Số tiền nhận:</span><span>{formatCurrency(Number(withdrawAmount))}</span></div>
                                    </div>
                                )}

                                <button className="withdraw-btn" onClick={handleWithdraw} disabled={isLoading || !withdrawAmount || Number(withdrawAmount) < 50000}>
                                    {isLoading ? (<><span className="spinner"></span> Đang xử lý...</>) : 'Rút tiền'}
                                </button>
                            </>
                        )}

                        {/* Withdrawal History */}
                        {withdrawals.length > 0 && (
                            <div className="withdrawal-history">
                                <h3>Các yêu cầu rút tiền</h3>
                                <div className="withdrawals-list">
                                    {withdrawals.map(w => {
                                        const statusInfo = getWithdrawalStatusInfo(w.status);
                                        return (
                                            <div key={w.id} className="withdrawal-item">
                                                <div className="withdrawal-main">
                                                    <div className="withdrawal-amount">{formatCurrency(w.amount)}</div>
                                                    <span className="withdrawal-status" style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}>{statusInfo.text}</span>
                                                </div>
                                                <div className="withdrawal-details">
                                                    {w.bankSnapshot && <span>{w.bankSnapshot.bankName} - ***{w.bankSnapshot.accountNumber?.slice(-4)}</span>}
                                                    <span>{new Date(w.createdAt).toLocaleString('vi-VN')}</span>
                                                </div>
                                                {w.rejectionReason && <div className="rejection-reason">Lý do: {w.rejectionReason}</div>}
                                                {(w.status === 0 || w.status === 1) && (
                                                    <button className="cancel-btn" onClick={() => handleCancelWithdrawal(w.id)}>Hủy yêu cầu</button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bank Accounts Tab */}
                {activeTab === 'banks' && (
                    <div className="banks-section">
                        <div className="section-header">
                            <h2>Tài khoản ngân hàng</h2>
                            <button className="add-bank-btn" onClick={() => { setShowBankForm(true); setEditingBank(null); setBankForm({ bankName: '', accountNumber: '', accountHolder: '', branch: '' }); }}>
                                + Thêm tài khoản
                            </button>
                        </div>

                        {showBankForm && (
                            <div className="bank-form">
                                <h3>{editingBank ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}</h3>
                                <div className="form-group">
                                    <label>Tên ngân hàng *</label>
                                    <input type="text" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} placeholder="VD: Vietcombank, BIDV, Techcombank..." />
                                </div>
                                <div className="form-group">
                                    <label>Số tài khoản *</label>
                                    <input type="text" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} placeholder="Nhập số tài khoản" />
                                </div>
                                <div className="form-group">
                                    <label>Tên chủ tài khoản *</label>
                                    <input type="text" value={bankForm.accountHolder} onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })} placeholder="Nhập tên chủ tài khoản" />
                                </div>
                                <div className="form-group">
                                    <label>Chi nhánh</label>
                                    <input type="text" value={bankForm.branch} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} placeholder="VD: HCM, Hà Nội..." />
                                </div>
                                <div className="form-actions">
                                    <button className="save-btn" onClick={handleSaveBankAccount} disabled={isLoading}>{isLoading ? 'Đang lưu...' : 'Lưu'}</button>
                                    <button className="cancel-form-btn" onClick={() => { setShowBankForm(false); setEditingBank(null); }}>Hủy</button>
                                </div>
                            </div>
                        )}

                        {loadingBanks ? (
                            <div className="loading-transactions"><span className="spinner"></span><span>Đang tải...</span></div>
                        ) : bankAccounts.length === 0 ? (
                            <div className="no-transactions">
                                <p>Chưa có tài khoản ngân hàng nào</p>
                            </div>
                        ) : (
                            <div className="bank-list">
                                {bankAccounts.map(bank => (
                                    <div key={bank.id} className={`bank-item ${bank.isDefault ? 'default' : ''}`}>
                                        <div className="bank-info-row">
                                            <div className="bank-name">
                                                {bank.bankName}
                                                {bank.isDefault && <span className="default-badge">Mặc định</span>}
                                            </div>
                                            <div className="bank-actions">
                                                {!bank.isDefault && <button className="btn-sm" onClick={() => handleSetDefault(bank.id)}>Đặt mặc định</button>}
                                                <button className="btn-sm edit" onClick={() => { setEditingBank(bank); setBankForm({ bankName: bank.bankName, accountNumber: bank.accountNumber, accountHolder: bank.accountHolder, branch: bank.branch || '' }); setShowBankForm(true); }}>Sửa</button>
                                                <button className="btn-sm delete" onClick={() => handleDeleteBank(bank.id)}>Xóa</button>
                                            </div>
                                        </div>
                                        <div className="bank-detail">
                                            <span>STK: ***{bank.accountNumber?.slice(-4)}</span>
                                            <span>{bank.accountHolder}</span>
                                            {bank.branch && <span>CN: {bank.branch}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Transaction History Tab */}
                {activeTab === 'history' && (
                    <div className="transactions-section">
                        <div className="section-header">
                            <h2>Lịch sử giao dịch</h2>
                            <button className="refresh-btn" onClick={() => loadTransactions(1)} disabled={loadingTransactions} title="Làm mới">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                        <div className="tx-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                            <select value={txFilters.type} onChange={(e) => setTxFilters(f => ({ ...f, type: e.target.value }))} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                <option value="">Tất cả loại</option>
                                <option value="0">Nạp tiền</option>
                                <option value="1">Rút tiền</option>
                                <option value="2">Đặt cọc</option>
                                <option value="3">Hoàn cọc</option>
                                <option value="4">Thanh toán</option>
                                <option value="5">Hoàn tiền</option>
                                <option value="6">Admin điều chỉnh</option>
                                <option value="7">Giữ tiền rút</option>
                                <option value="8">Hoàn tiền rút</option>
                                <option value="9">🔒 Đóng băng Escrow</option>
                                <option value="10">✅ Giải phóng Escrow</option>
                                <option value="11">💸 Hoàn Escrow</option>
                            </select>
                            <input type="date" value={txFilters.dateFrom} onChange={(e) => setTxFilters(f => ({ ...f, dateFrom: e.target.value }))} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                            <span>→</span>
                            <input type="date" value={txFilters.dateTo} onChange={(e) => setTxFilters(f => ({ ...f, dateTo: e.target.value }))} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                            <button type="button" onClick={applyTxFilters} disabled={loadingTransactions} style={{ padding: '6px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Lọc</button>
                        </div>
                        {loadingTransactions ? (
                            <div className="loading-transactions"><span className="spinner"></span><span>Đang tải...</span></div>
                        ) : transactions.length === 0 ? (
                            <div className="no-transactions"><p>Chưa có giao dịch nào</p></div>
                        ) : (
                            <div className="transactions-list">
                                {transactions.map((tx) => {
                                    const typeInfo = getTransactionTypeLabel(tx.type);
                                    return (
                                        <div key={tx.id} className="transaction-item">
                                            <div className="tx-left">
                                                <span className="tx-type" style={{ backgroundColor: typeInfo.color }}>{typeInfo.text}</span>
                                                <div className="tx-details">
                                                    <span className="tx-desc">{tx.description}</span>
                                                    <span className="tx-date">{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                                                </div>
                                            </div>
                                            <div className="tx-right">
                                                <span className={`tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                                                    {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                                </span>
                                                <span className="tx-balance">Số dư: {formatCurrency(tx.balanceAfter)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {!loadingTransactions && transactions.length > 0 && txPage < txTotalPages && (
                            <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                <button type="button" onClick={loadMoreTransactions} disabled={loadingMoreTx} className="refresh-btn" style={{ padding: '8px 16px' }}>
                                    {loadingMoreTx ? 'Đang tải...' : 'Xem thêm'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Xác nhận rút tiền</h2>
                        <p>Nhập mã OTP đã gửi đến email của bạn</p>
                        <div className="otp-input-wrapper">
                            <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="otp-input" autoFocus />
                        </div>
                        <div className="otp-timer">
                            {otpCountdown > 0 ? (
                                <span>Mã OTP hết hạn sau {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}</span>
                            ) : (
                                <button className="resend-btn" onClick={handleResendOtp}>Gửi lại mã OTP</button>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="verify-btn" onClick={handleVerifyOtp} disabled={isLoading || otpCode.length !== 6}>
                                {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                            <button className="cancel-modal-btn" onClick={() => setShowOtpModal(false)}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
