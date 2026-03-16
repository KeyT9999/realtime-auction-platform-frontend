import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { withdrawalService } from '../services/withdrawalService';
import { bankAccountService } from '../services/bankAccountService';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorUtils';

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
            const data = await withdrawalService.getMyWithdrawals();
            setWithdrawals(data.withdrawals || []);
        } catch (error) { console.error('Error loading withdrawals:', error); }
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
        } catch (error) { toast.error(getErrorMessage(error, 'Không thể tạo link nạp tiền')); }
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
        } catch (error) { toast.error(getErrorMessage(error, 'Không thể tạo yêu cầu rút tiền')); }
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
        } catch (error) { toast.error(getErrorMessage(error, 'Mã OTP không đúng')); }
        finally { setIsLoading(false); }
    };

    const handleResendOtp = async () => {
        try {
            await withdrawalService.resendOtp(currentWithdrawalId);
            setOtpCountdown(600);
            toast.success('Đã gửi lại mã OTP');
        } catch (error) { toast.error(getErrorMessage(error, 'Không thể gửi lại OTP')); }
    };

    const handleCancelWithdrawal = async (id) => {
        if (!window.confirm('Bạn có chắc muốn hủy yêu cầu rút tiền này?')) return;
        try {
            await withdrawalService.cancelWithdrawal(id);
            toast.success('Đã hủy yêu cầu rút tiền');
            await loadWithdrawals();
            await refreshUser();
        } catch (error) { toast.error(getErrorMessage(error, 'Không thể hủy yêu cầu')); }
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
        } catch (error) { toast.error(getErrorMessage(error, 'Lỗi khi lưu tài khoản')); }
        finally { setIsLoading(false); }
    };

    const handleDeleteBank = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
        try {
            await bankAccountService.deleteBankAccount(id);
            toast.success('Đã xóa tài khoản');
            await loadBankAccounts();
        } catch (error) { toast.error(getErrorMessage(error, 'Không thể xóa')); }
    };

    const handleSetDefault = async (id) => {
        try {
            await bankAccountService.setDefault(id);
            toast.success('Đã đặt mặc định');
            await loadBankAccounts();
        } catch (error) { toast.error(getErrorMessage(error, 'Lỗi')); }
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
            11: { text: '💰 Hoàn Escrow', color: '#8B5CF6' },
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
        <div className="w-full text-white font-[Inter,sans-serif] min-h-screen bg-slate-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                        <span role="img" aria-label="wallet">💳</span> Ví của tôi
                    </h1>
                    <p className="text-slate-400">Quản lý số dư và giao dịch của bạn</p>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-5 shadow-lg flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wide mb-1">Khả dụng</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(user?.availableBalance || 0)}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-5 shadow-lg flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Giữ cọc (Escrow)</p>
                            <p className="text-xl font-bold text-slate-300">{formatCurrency(user?.escrowBalance || 0)}</p>
                            {(user?.escrowBalance || 0) > 0 && (
                                <p className="text-[10px] text-slate-500 mt-1 italic">Đang bảo vệ giao dịch</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-amber-500/20 p-5 shadow-lg flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wide mb-1">Chờ rút tiền</p>
                            <p className="text-xl font-bold text-amber-100">{formatCurrency(user?.heldBalance || 0)}</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-md rounded-2xl border border-indigo-500/30 p-5 shadow-lg flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-indigo-300/80 uppercase tracking-wide mb-1">Tổng tài sản</p>
                            <p className="text-xl font-bold text-white shrink-0 truncate max-w-[120px]">{formatCurrency((user?.availableBalance || 0) + (user?.escrowBalance || 0) + (user?.heldBalance || 0))}</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 tabular-nums">
                    <button
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'deposit' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        onClick={() => setActiveTab('deposit')}
                    >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        Nạp tiền
                    </button>
                    <button
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'withdraw' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        onClick={() => setActiveTab('withdraw')}
                    >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        Rút tiền
                    </button>
                    <button
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'banks' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        onClick={() => setActiveTab('banks')}
                    >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Tài khoản NH
                    </button>
                    <button
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Lịch sử
                    </button>
                </div>

                {/* Deposit Tab */}
                {activeTab === 'deposit' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-2">Nạp tiền</h2>
                        <p className="text-slate-400 mb-6 text-sm">Chọn số tiền bạn muốn nạp vào ví</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                            {quickAmounts.map((amount) => (
                                <button key={amount} className={`py-3 px-4 rounded-xl border font-bold transition-all ${depositAmount === amount ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`} onClick={() => setDepositAmount(amount)}>
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Hoặc nhập số tiền khác:</label>
                            <div className="relative">
                                <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} min={2000} max={100000000} step={1000} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-4 pr-16 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">VND</span>
                            </div>
                        </div>
                        <button className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isLoading || depositAmount < 2000 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-500 text-slate-900 hover:bg-amber-600 shadow-lg shadow-amber-500/20'}`} onClick={handleDeposit} disabled={isLoading || depositAmount < 2000}>
                            {isLoading ? (<><span className="w-5 h-5 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin"></span> Đang xử lý...</>) : (<><svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg> Nạp {formatCurrency(depositAmount)}</>)}
                        </button>
                    </div>
                )}

                {/* Withdraw Tab */}
                {activeTab === 'withdraw' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-2">Rút tiền</h2>
                        <p className="text-slate-400 mb-6 text-sm">Rút tiền từ ví vào tài khoản ngân hàng của bạn</p>

                        {bankAccounts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 bg-slate-950/50 rounded-2xl border border-dashed border-slate-700">
                                <p className="text-slate-400 mb-4">Bạn chưa có tài khoản ngân hàng nào.</p>
                                <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors" onClick={() => { setActiveTab('banks'); setShowBankForm(true); }}>
                                    + Thêm tài khoản ngân hàng
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Tài khoản ngân hàng</label>
                                    <select value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors appearance-none">
                                        <option value="">-- Chọn tài khoản --</option>
                                        {bankAccounts.map(bank => (
                                            <option key={bank.id} value={bank.id}>
                                                {bank.bankName} - ***{bank.accountNumber?.slice(-4)} - {bank.accountHolder} {bank.isDefault ? '(Mặc định)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Số tiền rút (tối thiểu 50.000 VND)</label>
                                    <div className="relative">
                                        <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} min={50000} max={user?.availableBalance || 0} step={1000} placeholder="Nhập số tiền" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-4 pr-16 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">VND</span>
                                    </div>
                                    <p className="mt-2 text-xs font-semibold text-emerald-500">Khả dụng: {formatCurrency(user?.availableBalance || 0)}</p>
                                </div>

                                {Number(withdrawAmount) > 0 && (
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 mt-2">
                                        <div className="flex justify-between text-sm"><span className="text-slate-400">Số tiền rút:</span><span className="font-semibold">{formatCurrency(Number(withdrawAmount))}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-slate-400">Phí xử lý:</span><span className="font-semibold text-emerald-500">Miễn phí</span></div>
                                        <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-800 mt-2"><span className="text-white">Số tiền nhận:</span><span className="text-amber-500">{formatCurrency(Number(withdrawAmount))}</span></div>
                                    </div>
                                )}

                                <button className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all mt-4 ${isLoading || !withdrawAmount || Number(withdrawAmount) < 50000 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-500 text-slate-900 hover:bg-amber-600 shadow-lg shadow-amber-500/20'}`} onClick={handleWithdraw} disabled={isLoading || !withdrawAmount || Number(withdrawAmount) < 50000}>
                                    {isLoading ? (<><span className="w-5 h-5 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin inline-block align-middle mr-2"></span> Đang xử lý...</>) : 'Rút tiền'}
                                </button>
                            </div>
                        )}

                        {/* Withdrawal History */}
                        {withdrawals.length > 0 && (
                            <div className="mt-10 pt-8 border-t border-slate-800">
                                <h3 className="text-lg font-bold mb-4">Các yêu cầu rút tiền</h3>
                                <div className="space-y-3">
                                    {withdrawals.map(w => {
                                        const statusInfo = getWithdrawalStatusInfo(w.status);
                                        return (
                                            <div key={w.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-4 justify-between sm:items-center group">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-lg font-bold text-white">{formatCurrency(w.amount)}</span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ color: statusInfo.color, backgroundColor: statusInfo.color + '15', border: `1px solid ${statusInfo.color}30` }}>{statusInfo.text}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 space-y-1">
                                                        {w.bankSnapshot && <p>{w.bankSnapshot.bankName} - ***{w.bankSnapshot.accountNumber?.slice(-4)}</p>}
                                                        <p>{new Date(w.createdAt).toLocaleString('vi-VN')}</p>
                                                    </div>
                                                    {w.rejectionReason && <p className="text-sm text-red-400 mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">Lý do từ chối: {w.rejectionReason}</p>}
                                                </div>
                                                {(w.status === 0 || w.status === 1) && (
                                                    <button className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg text-sm font-bold transition-colors border border-transparent hover:border-red-500/30" onClick={() => handleCancelWithdrawal(w.id)}>Hủy yêu cầu</button>
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
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold">Tài khoản ngân hàng</h2>
                            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-amber-500/20" onClick={() => { setShowBankForm(true); setEditingBank(null); setBankForm({ bankName: '', accountNumber: '', accountHolder: '', branch: '' }); }}>
                                + Thêm tài khoản
                            </button>
                        </div>

                        {showBankForm && (
                            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-8 space-y-4 shadow-inner">
                                <h3 className="font-bold text-lg text-emerald-400 mb-2">{editingBank ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Tên ngân hàng <span className="text-red-500">*</span></label>
                                        <input type="text" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} placeholder="VD: Vietcombank, BIDV..." className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Số tài khoản <span className="text-red-500">*</span></label>
                                        <input type="text" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} placeholder="Nhập số tài khoản" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Tên chủ tài khoản <span className="text-red-500">*</span></label>
                                        <input type="text" value={bankForm.accountHolder} onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })} placeholder="Nhập tên chủ tài khoản" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Chi nhánh</label>
                                        <input type="text" value={bankForm.branch} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} placeholder="VD: HCM, Hà Nội..." className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors" />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-slate-800">
                                    <button className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors" onClick={() => { setShowBankForm(false); setEditingBank(null); }}>Hủy</button>
                                    <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20" onClick={handleSaveBankAccount} disabled={isLoading}>{isLoading ? 'Đang lưu...' : 'Lưu tài khoản'}</button>
                                </div>
                            </div>
                        )}

                        {loadingBanks ? (
                            <div className="flex justify-center py-12"><span className="w-8 h-8 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></span></div>
                        ) : bankAccounts.length === 0 && !showBankForm ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-slate-950/50 rounded-2xl border border-dashed border-slate-700">
                                <p className="text-slate-400">Chưa có tài khoản ngân hàng nào</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {bankAccounts.map(bank => (
                                    <div key={bank.id} className={`p-5 rounded-2xl border transition-all ${bank.isDefault ? 'bg-amber-500/5 border-amber-500/30 ring-1 ring-amber-500/20' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="font-bold text-lg text-white flex items-center gap-2">
                                                {bank.bankName}
                                                {bank.isDefault && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] uppercase tracking-wider border border-amber-500/20">Mặc định</span>}
                                            </div>
                                            <div className="flex gap-1">
                                                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" onClick={() => { setEditingBank(bank); setBankForm({ bankName: bank.bankName, accountNumber: bank.accountNumber, accountHolder: bank.accountHolder, branch: bank.branch || '' }); setShowBankForm(true); }} title="Sửa">
                                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" onClick={() => handleDeleteBank(bank.id)} title="Xóa">
                                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1 block text-sm text-slate-400">
                                            <p><span className="text-slate-500 w-24 inline-block">Số TK:</span> <span className="font-mono text-slate-300 font-semibold">{bank.accountNumber}</span></p>
                                            <p><span className="text-slate-500 w-24 inline-block">Chủ TK:</span> <span className="text-slate-300 font-semibold uppercase">{bank.accountHolder}</span></p>
                                            {bank.branch && <p><span className="text-slate-500 w-24 inline-block">Chi nhánh:</span> <span className="text-slate-300">{bank.branch}</span></p>}
                                        </div>
                                        {!bank.isDefault && (
                                            <button className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors" onClick={() => handleSetDefault(bank.id)}>
                                                Đặt làm mặc định
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Transaction History Tab */}
                {activeTab === 'history' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold">Lịch sử giao dịch</h2>
                            <button className="p-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors shrink-0" onClick={() => loadTransactions(1)} disabled={loadingTransactions} title="Làm mới">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                            <select value={txFilters.type} onChange={(e) => setTxFilters(f => ({ ...f, type: e.target.value }))} className="px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl focus:border-amber-500 outline-none text-sm appearance-none">
                                <option value="">Tất cả loại giao dịch</option>
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
                                <option value="10">✔ Giải phóng Escrow</option>
                                <option value="11">💰 Hoàn Escrow</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <input type="date" value={txFilters.dateFrom} onChange={(e) => setTxFilters(f => ({ ...f, dateFrom: e.target.value }))} className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl focus:border-amber-500 outline-none text-sm" />
                                <span className="text-slate-500">→</span>
                                <input type="date" value={txFilters.dateTo} onChange={(e) => setTxFilters(f => ({ ...f, dateTo: e.target.value }))} className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl focus:border-amber-500 outline-none text-sm" />
                            </div>
                            <button type="button" onClick={applyTxFilters} disabled={loadingTransactions} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-500/20">Lọc</button>
                        </div>
                        {loadingTransactions ? (
                            <div className="flex justify-center py-12"><span className="w-8 h-8 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></span></div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-slate-950/50 rounded-2xl border border-dashed border-slate-700">
                                <p className="text-slate-400">Chưa có giao dịch nào</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((tx) => {
                                    const typeInfo = getTransactionTypeLabel(tx.type);
                                    return (
                                        <div key={tx.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors gap-4">
                                            <div className="flex gap-4 items-start">
                                                <div className="shrink-0 mt-1">
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider block text-center" style={{ color: typeInfo.color, backgroundColor: typeInfo.color + '15', border: `1px solid ${typeInfo.color}30`, minWidth: '90px' }}>
                                                        {typeInfo.text}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white mb-1 leading-snug">{tx.description}</p>
                                                    <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-row justify-between w-full sm:w-auto sm:flex-col items-center sm:items-end sm:min-w-[140px] shrink-0">
                                                <span className={`font-bold text-lg ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                                </span>
                                                <p className="text-xs text-slate-400 mt-1">Số dư: {formatCurrency(tx.balanceAfter)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {!loadingTransactions && transactions.length > 0 && txPage < txTotalPages && (
                            <div className="text-center mt-8">
                                <button type="button" onClick={loadMoreTransactions} disabled={loadingMoreTx} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors">
                                    {loadingMoreTx ? 'Đang tải...' : 'Xem thêm'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowOtpModal(false)}></div>
                    <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl">
                        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-2">Xác nhận rút tiền</h2>
                        <p className="text-slate-400 text-center text-sm mb-6">Nhập mã OTP đã được gửi đến email của bạn</p>

                        <div className="mb-6">
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 px-4 text-center text-white font-mono text-2xl tracking-[0.5em] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                autoFocus
                            />
                        </div>

                        <div className="text-center text-sm mb-8">
                            {otpCountdown > 0 ? (
                                <span className="text-slate-300">Mã OTP hết hạn sau <span className="font-bold text-amber-500">{Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}</span></span>
                            ) : (
                                <button className="text-amber-500 hover:text-amber-400 font-bold underline" onClick={handleResendOtp}>Gửi lại mã OTP</button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors" onClick={() => setShowOtpModal(false)}>Hủy</button>
                            <button className={`flex-1 flex justify-center items-center py-3 rounded-xl font-bold transition-all ${isLoading || otpCode.length !== 6 ? 'bg-amber-500/50 text-slate-800 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-lg shadow-amber-500/20'}`} onClick={handleVerifyOtp} disabled={isLoading || otpCode.length !== 6}>
                                {isLoading ? <span className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></span> : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
