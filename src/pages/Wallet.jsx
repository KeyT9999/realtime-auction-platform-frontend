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

    const loadTransactions = async () => {
        try {
            setLoadingTransactions(true);
            const data = await paymentService.getTransactions();
            setTransactions(data.transactions || []);
        } catch (error) { console.error('Error loading transactions:', error); }
        finally { setLoadingTransactions(false); }
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
        if (depositAmount < 2000) { toast.error('So tien nap toi thieu la 2,000d'); return; }
        try {
            setIsLoading(true);
            const result = await paymentService.createDeposit(depositAmount);
            if (result.checkoutUrl) {
                window.open(result.checkoutUrl, '_blank');
                toast.info('Vui long hoan tat thanh toan tren trang PayOS');
            }
        } catch (error) { toast.error(error.response?.data?.message || 'Khong the tao link nap tien'); }
        finally { setIsLoading(false); }
    };

    const handleWithdraw = async () => {
        const amount = Number(withdrawAmount);
        if (!amount || amount < 50000) { toast.error('So tien rut toi thieu la 50,000d'); return; }
        if (amount > (user?.availableBalance || 0)) { toast.error('So du khong du'); return; }
        if (!selectedBankId) { toast.error('Vui long chon tai khoan ngan hang'); return; }
        try {
            setIsLoading(true);
            const result = await withdrawalService.createWithdrawal(amount, selectedBankId);
            setCurrentWithdrawalId(result.withdrawalId || result.id);
            setShowOtpModal(true);
            setOtpCountdown(600); // 10 minutes
            toast.success('Da gui ma OTP den email cua ban');
        } catch (error) { toast.error(error.response?.data?.message || 'Khong the tao yeu cau rut tien'); }
        finally { setIsLoading(false); }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) { toast.error('Vui long nhap ma OTP 6 so'); return; }
        try {
            setIsLoading(true);
            await withdrawalService.verifyOtp(currentWithdrawalId, otpCode);
            toast.success('Xac nhan thanh cong! Yeu cau dang cho admin duyet.');
            setShowOtpModal(false);
            setOtpCode('');
            setWithdrawAmount('');
            await loadWithdrawals();
            await refreshUser();
        } catch (error) { toast.error(error.response?.data?.message || 'Ma OTP khong dung'); }
        finally { setIsLoading(false); }
    };

    const handleResendOtp = async () => {
        try {
            await withdrawalService.resendOtp(currentWithdrawalId);
            setOtpCountdown(600);
            toast.success('Da gui lai ma OTP');
        } catch (error) { toast.error(error.response?.data?.message || 'Khong the gui lai OTP'); }
    };

    const handleCancelWithdrawal = async (id) => {
        if (!window.confirm('Ban co chac muon huy yeu cau rut tien nay?')) return;
        try {
            await withdrawalService.cancelWithdrawal(id);
            toast.success('Da huy yeu cau rut tien');
            await loadWithdrawals();
            await refreshUser();
        } catch (error) { toast.error(error.response?.data?.message || 'Khong the huy yeu cau'); }
    };

    // Bank account handlers
    const handleSaveBankAccount = async () => {
        if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolder) {
            toast.error('Vui long dien day du thong tin'); return;
        }
        try {
            setIsLoading(true);
            if (editingBank) {
                await bankAccountService.updateBankAccount(editingBank.id, bankForm);
                toast.success('Da cap nhat tai khoan');
            } else {
                await bankAccountService.createBankAccount(bankForm);
                toast.success('Da them tai khoan ngan hang');
            }
            setShowBankForm(false);
            setEditingBank(null);
            setBankForm({ bankName: '', accountNumber: '', accountHolder: '', branch: '' });
            await loadBankAccounts();
        } catch (error) { toast.error(error.response?.data?.message || 'Loi khi luu tai khoan'); }
        finally { setIsLoading(false); }
    };

    const handleDeleteBank = async (id) => {
        if (!window.confirm('Ban co chac muon xoa tai khoan nay?')) return;
        try {
            await bankAccountService.deleteBankAccount(id);
            toast.success('Da xoa tai khoan');
            await loadBankAccounts();
        } catch (error) { toast.error(error.response?.data?.message || 'Khong the xoa'); }
    };

    const handleSetDefault = async (id) => {
        try {
            await bankAccountService.setDefault(id);
            toast.success('Da dat mac dinh');
            await loadBankAccounts();
        } catch (error) { toast.error(error.response?.data?.message || 'Loi'); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getTransactionTypeLabel = (type) => {
        const labels = {
            0: { text: 'Nap tien', color: '#10B981' },
            1: { text: 'Rut tien', color: '#EF4444' },
            2: { text: 'Dat coc', color: '#F59E0B' },
            3: { text: 'Hoan coc', color: '#10B981' },
            4: { text: 'Thanh toan', color: '#EF4444' },
            5: { text: 'Hoan tien', color: '#10B981' },
            6: { text: 'Admin dieu chinh', color: '#6366F1' },
            7: { text: 'Giu tien rut', color: '#F59E0B' },
            8: { text: 'Hoan tien rut', color: '#10B981' }
        };
        return labels[type] || { text: 'Khac', color: '#6B7280' };
    };

    const getWithdrawalStatusInfo = (status) => {
        const statuses = {
            0: { text: 'Cho xac nhan OTP', color: '#F59E0B', bg: '#FEF3C7' },
            1: { text: 'Cho admin duyet', color: '#3B82F6', bg: '#DBEAFE' },
            2: { text: 'Dang xu ly', color: '#8B5CF6', bg: '#EDE9FE' },
            3: { text: 'Hoan tat', color: '#10B981', bg: '#D1FAE5' },
            4: { text: 'Bi tu choi', color: '#EF4444', bg: '#FEE2E2' },
            5: { text: 'Da huy', color: '#6B7280', bg: '#F3F4F6' }
        };
        return statuses[status] || { text: 'Khong xac dinh', color: '#6B7280', bg: '#F3F4F6' };
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Vi cua toi</h1>
                    <p className="text-text-secondary">Quan ly so du va giao dich cua ban</p>
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
                            <span className="balance-label">So du kha dung</span>
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
                            <span className="balance-label">Dang giu coc (auction)</span>
                            <span className="balance-amount">{formatCurrency(user?.escrowBalance || 0)}</span>
                        </div>
                    </div>
                    <div className="balance-card held-withdrawal">
                        <div className="balance-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="balance-info">
                            <span className="balance-label">Dang giu (rut tien)</span>
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
                            <span className="balance-label">Tong so du</span>
                            <span className="balance-amount">{formatCurrency((user?.availableBalance || 0) + (user?.escrowBalance || 0) + (user?.heldBalance || 0))}</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="wallet-tabs">
                    <button className={`wallet-tab ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => setActiveTab('deposit')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nap tien
                    </button>
                    <button className={`wallet-tab ${activeTab === 'withdraw' ? 'active' : ''}`} onClick={() => setActiveTab('withdraw')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        Rut tien
                    </button>
                    <button className={`wallet-tab ${activeTab === 'banks' ? 'active' : ''}`} onClick={() => setActiveTab('banks')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Tai khoan NH
                    </button>
                    <button className={`wallet-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Lich su
                    </button>
                </div>

                {/* Deposit Tab */}
                {activeTab === 'deposit' && (
                    <div className="deposit-section">
                        <h2>Nap tien</h2>
                        <p className="deposit-desc">Chon so tien ban muon nap vao vi</p>
                        <div className="quick-amounts">
                            {quickAmounts.map((amount) => (
                                <button key={amount} className={`quick-btn ${depositAmount === amount ? 'active' : ''}`} onClick={() => setDepositAmount(amount)}>
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                        <div className="custom-amount">
                            <label>Hoac nhap so tien khac:</label>
                            <div className="amount-input-wrapper">
                                <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} min={2000} max={100000000} step={1000} />
                                <span className="currency-suffix">VND</span>
                            </div>
                        </div>
                        <button className="deposit-btn" onClick={handleDeposit} disabled={isLoading || depositAmount < 2000}>
                            {isLoading ? (<><span className="spinner"></span> Dang xu ly...</>) : (<><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Nap {formatCurrency(depositAmount)}</>)}
                        </button>
                    </div>
                )}

                {/* Withdraw Tab */}
                {activeTab === 'withdraw' && (
                    <div className="withdraw-section">
                        <h2>Rut tien</h2>
                        <p className="deposit-desc">Rut tien tu vi vao tai khoan ngan hang cua ban</p>

                        {bankAccounts.length === 0 ? (
                            <div className="empty-state">
                                <p>Ban chua co tai khoan ngan hang nao.</p>
                                <button className="add-bank-btn" onClick={() => { setActiveTab('banks'); setShowBankForm(true); }}>
                                    + Them tai khoan ngan hang
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Tai khoan ngan hang</label>
                                    <select value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)} className="bank-select">
                                        <option value="">-- Chon tai khoan --</option>
                                        {bankAccounts.map(bank => (
                                            <option key={bank.id} value={bank.id}>
                                                {bank.bankName} - ***{bank.accountNumber?.slice(-4)} - {bank.accountHolder} {bank.isDefault ? '(Mac dinh)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>So tien rut (toi thieu 50,000 VND)</label>
                                    <div className="amount-input-wrapper">
                                        <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} min={50000} max={user?.availableBalance || 0} step={1000} placeholder="Nhap so tien" />
                                        <span className="currency-suffix">VND</span>
                                    </div>
                                    <span className="available-hint">Kha dung: {formatCurrency(user?.availableBalance || 0)}</span>
                                </div>

                                {Number(withdrawAmount) > 0 && (
                                    <div className="withdraw-summary">
                                        <div className="summary-row"><span>So tien rut:</span><span>{formatCurrency(Number(withdrawAmount))}</span></div>
                                        <div className="summary-row"><span>Phi xu ly:</span><span>{formatCurrency(0)}</span></div>
                                        <div className="summary-row total"><span>So tien nhan:</span><span>{formatCurrency(Number(withdrawAmount))}</span></div>
                                    </div>
                                )}

                                <button className="withdraw-btn" onClick={handleWithdraw} disabled={isLoading || !withdrawAmount || Number(withdrawAmount) < 50000}>
                                    {isLoading ? (<><span className="spinner"></span> Dang xu ly...</>) : 'Rut tien'}
                                </button>
                            </>
                        )}

                        {/* Withdrawal History */}
                        {withdrawals.length > 0 && (
                            <div className="withdrawal-history">
                                <h3>Cac yeu cau rut tien</h3>
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
                                                {w.rejectionReason && <div className="rejection-reason">Ly do: {w.rejectionReason}</div>}
                                                {(w.status === 0 || w.status === 1) && (
                                                    <button className="cancel-btn" onClick={() => handleCancelWithdrawal(w.id)}>Huy yeu cau</button>
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
                            <h2>Tai khoan ngan hang</h2>
                            <button className="add-bank-btn" onClick={() => { setShowBankForm(true); setEditingBank(null); setBankForm({ bankName: '', accountNumber: '', accountHolder: '', branch: '' }); }}>
                                + Them tai khoan
                            </button>
                        </div>

                        {showBankForm && (
                            <div className="bank-form">
                                <h3>{editingBank ? 'Sua tai khoan' : 'Them tai khoan moi'}</h3>
                                <div className="form-group">
                                    <label>Ten ngan hang *</label>
                                    <input type="text" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} placeholder="VD: Vietcombank, BIDV, Techcombank..." />
                                </div>
                                <div className="form-group">
                                    <label>So tai khoan *</label>
                                    <input type="text" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} placeholder="Nhap so tai khoan" />
                                </div>
                                <div className="form-group">
                                    <label>Ten chu tai khoan *</label>
                                    <input type="text" value={bankForm.accountHolder} onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })} placeholder="Nhap ten chu tai khoan" />
                                </div>
                                <div className="form-group">
                                    <label>Chi nhanh</label>
                                    <input type="text" value={bankForm.branch} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} placeholder="VD: HCM, Ha Noi..." />
                                </div>
                                <div className="form-actions">
                                    <button className="save-btn" onClick={handleSaveBankAccount} disabled={isLoading}>{isLoading ? 'Dang luu...' : 'Luu'}</button>
                                    <button className="cancel-form-btn" onClick={() => { setShowBankForm(false); setEditingBank(null); }}>Huy</button>
                                </div>
                            </div>
                        )}

                        {loadingBanks ? (
                            <div className="loading-transactions"><span className="spinner"></span><span>Dang tai...</span></div>
                        ) : bankAccounts.length === 0 ? (
                            <div className="no-transactions">
                                <p>Chua co tai khoan ngan hang nao</p>
                            </div>
                        ) : (
                            <div className="bank-list">
                                {bankAccounts.map(bank => (
                                    <div key={bank.id} className={`bank-item ${bank.isDefault ? 'default' : ''}`}>
                                        <div className="bank-info-row">
                                            <div className="bank-name">
                                                {bank.bankName}
                                                {bank.isDefault && <span className="default-badge">Mac dinh</span>}
                                            </div>
                                            <div className="bank-actions">
                                                {!bank.isDefault && <button className="btn-sm" onClick={() => handleSetDefault(bank.id)}>Dat mac dinh</button>}
                                                <button className="btn-sm edit" onClick={() => { setEditingBank(bank); setBankForm({ bankName: bank.bankName, accountNumber: bank.accountNumber, accountHolder: bank.accountHolder, branch: bank.branch || '' }); setShowBankForm(true); }}>Sua</button>
                                                <button className="btn-sm delete" onClick={() => handleDeleteBank(bank.id)}>Xoa</button>
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
                            <h2>Lich su giao dich</h2>
                            <button className="refresh-btn" onClick={loadTransactions} disabled={loadingTransactions}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                        {loadingTransactions ? (
                            <div className="loading-transactions"><span className="spinner"></span><span>Dang tai...</span></div>
                        ) : transactions.length === 0 ? (
                            <div className="no-transactions"><p>Chua co giao dich nao</p></div>
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
                                                <span className="tx-balance">So du: {formatCurrency(tx.balanceAfter)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Xac nhan rut tien</h2>
                        <p>Nhap ma OTP da gui den email cua ban</p>
                        <div className="otp-input-wrapper">
                            <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="otp-input" autoFocus />
                        </div>
                        <div className="otp-timer">
                            {otpCountdown > 0 ? (
                                <span>Ma OTP het han sau {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}</span>
                            ) : (
                                <button className="resend-btn" onClick={handleResendOtp}>Gui lai ma OTP</button>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="verify-btn" onClick={handleVerifyOtp} disabled={isLoading || otpCode.length !== 6}>
                                {isLoading ? 'Dang xu ly...' : 'Xac nhan'}
                            </button>
                            <button className="cancel-modal-btn" onClick={() => setShowOtpModal(false)}>Huy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
