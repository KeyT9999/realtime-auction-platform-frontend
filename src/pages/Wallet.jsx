import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { toast } from 'react-toastify';
import './Wallet.css';

const Wallet = () => {
    const { user, refreshUser } = useAuth();
    const [depositAmount, setDepositAmount] = useState(100000);
    const [isLoading, setIsLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    // Các mức nạp nhanh
    const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

    useEffect(() => {
        const loadData = async () => {
            // Refresh user data to get latest balance
            try {
                await refreshUser();
            } catch (error) {
                console.error('Error refreshing user:', error);
            }
            // Load transactions
            await loadTransactions();
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy 1 lần khi mount

    // Polling để check pending transactions
    useEffect(() => {
        const pendingTransactions = transactions.filter(
            tx => tx.type === 0 && (tx.status === 0 || tx.status === undefined) && tx.payOsOrderCode
        );

        if (pendingTransactions.length === 0) return;

        const pollInterval = setInterval(async () => {
            let hasUpdate = false;
            for (const tx of pendingTransactions) {
                try {
                    const status = await paymentService.getDepositStatus(tx.payOsOrderCode);
                    if (status?.status === 'PAID') {
                        // Refresh user và transactions khi có deposit thành công
                        await refreshUser();
                        await loadTransactions();
                        hasUpdate = true;
                        break;
                    }
                } catch (error) {
                    console.error('Error checking deposit status:', error);
                }
            }
            if (hasUpdate) {
                clearInterval(pollInterval);
            }
        }, 3000); // Poll mỗi 3 giây

        return () => clearInterval(pollInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions]);

    const loadTransactions = async () => {
        try {
            setLoadingTransactions(true);
            const data = await paymentService.getTransactions();
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleDeposit = async () => {
        if (depositAmount < 2000) {
            toast.error('Số tiền nạp tối thiểu là 2,000đ');
            return;
        }

        try {
            setIsLoading(true);
            const result = await paymentService.createDeposit(depositAmount);

            // Mở trang thanh toán PayOS
            if (result.checkoutUrl) {
                window.open(result.checkoutUrl, '_blank');
                toast.info('Vui lòng hoàn tất thanh toán trên trang PayOS');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể tạo link nạp tiền');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getTransactionTypeLabel = (type) => {
        const labels = {
            0: { text: 'Nạp tiền', color: '#10B981' },
            1: { text: 'Rút tiền', color: '#EF4444' },
            2: { text: 'Đặt cọc', color: '#F59E0B' },
            3: { text: 'Hoàn cọc', color: '#10B981' },
            4: { text: 'Thanh toán', color: '#EF4444' },
            5: { text: 'Hoàn tiền', color: '#10B981' },
            6: { text: 'Admin điều chỉnh', color: '#6366F1' }
        };
        return labels[type] || { text: 'Khác', color: '#6B7280' };
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        Ví của tôi
                    </h1>
                    <p className="text-text-secondary">
                        Quản lý số dư và giao dịch của bạn
                    </p>
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
                            <span className="balance-label">Đang giữ cọc</span>
                            <span className="balance-amount">{formatCurrency(user?.escrowBalance || 0)}</span>
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
                            <span className="balance-amount">{formatCurrency((user?.availableBalance || 0) + (user?.escrowBalance || 0))}</span>
                        </div>
                    </div>
                </div>

                {/* Deposit Section */}
                <div className="deposit-section">
                    <h2>Nạp tiền</h2>
                    <p className="deposit-desc">Chọn số tiền bạn muốn nạp vào ví</p>

                    <div className="quick-amounts">
                        {quickAmounts.map((amount) => (
                            <button
                                key={amount}
                                className={`quick-btn ${depositAmount === amount ? 'active' : ''}`}
                                onClick={() => setDepositAmount(amount)}
                            >
                                {formatCurrency(amount)}
                            </button>
                        ))}
                    </div>

                    <div className="custom-amount">
                        <label>Hoặc nhập số tiền khác:</label>
                        <div className="amount-input-wrapper">
                            <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(Number(e.target.value))}
                                min={2000}
                                max={100000000}
                                step={1000}
                            />
                            <span className="currency-suffix">VNĐ</span>
                        </div>
                    </div>

                    <button
                        className="deposit-btn"
                        onClick={handleDeposit}
                        disabled={isLoading || depositAmount < 2000}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nạp {formatCurrency(depositAmount)}
                            </>
                        )}
                    </button>
                </div>

                {/* Transaction History */}
                <div className="transactions-section">
                    <div className="section-header">
                        <h2>Lịch sử giao dịch</h2>
                        <button className="refresh-btn" onClick={loadTransactions} disabled={loadingTransactions}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {loadingTransactions ? (
                        <div className="loading-transactions">
                            <span className="spinner"></span>
                            <span>Đang tải...</span>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="no-transactions">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p>Chưa có giao dịch nào</p>
                        </div>
                    ) : (
                        <div className="transactions-list">
                            {transactions.map((tx) => {
                                const typeInfo = getTransactionTypeLabel(tx.type);
                                return (
                                    <div key={tx.id} className="transaction-item">
                                        <div className="tx-left">
                                            <span className="tx-type" style={{ backgroundColor: typeInfo.color }}>
                                                {typeInfo.text}
                                            </span>
                                            <div className="tx-details">
                                                <span className="tx-desc">{tx.description}</span>
                                                <span className="tx-date">
                                                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="tx-right">
                                            <span className={`tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                                                {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                            </span>
                                            <span className="tx-balance">
                                                Số dư: {formatCurrency(tx.balanceAfter)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
