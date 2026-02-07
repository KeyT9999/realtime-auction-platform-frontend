import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './PaymentResult.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [status, setStatus] = useState('loading');
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        const checkPayment = async () => {
            const orderCode = searchParams.get('orderCode');
            const code = searchParams.get('code');

            if (code === '00') {
                setStatus('success');
                if (orderCode) {
                    try {
                        // Gọi getDepositStatus - sẽ tự động update transaction nếu PayOS đã PAID
                        const info = await paymentService.getDepositStatus(orderCode);
                        setPaymentInfo(info);
                        
                        // Đợi một chút để đảm bảo backend đã xử lý xong
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // Refresh user data để lấy balance mới nhất
                        try {
                            await refreshUser();
                        } catch (error) {
                            console.error('Error refreshing user:', error);
                        }

                        // Auto redirect to wallet after 2 seconds
                        setRedirecting(true);
                        setTimeout(() => {
                            navigate('/wallet');
                        }, 2000);
                    } catch (error) {
                        console.error('Error fetching payment info:', error);
                    }
                }
            } else {
                setStatus('error');
            }
        };

        checkPayment();
    }, [searchParams, navigate, refreshUser]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="payment-result-page">
            <div className="result-container">
                {status === 'loading' && (
                    <div className="result-card loading">
                        <div className="spinner-large"></div>
                        <p>Đang xử lý...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="result-card success">
                        <div className="result-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1>Nạp tiền thành công!</h1>
                        {paymentInfo && (
                            <p className="amount">+{formatCurrency(paymentInfo.amount)}</p>
                        )}
                        <p className="message">Số tiền đã được cộng vào ví của bạn</p>
                        {redirecting && (
                            <p className="redirect-message">Đang chuyển về ví của bạn...</p>
                        )}
                        <div className="actions">
                            <Link to="/wallet" className="btn-primary">Về ví của tôi</Link>
                            <Link to="/auctions" className="btn-secondary">Tiếp tục đấu giá</Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="result-card error">
                        <div className="result-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1>Thanh toán không thành công</h1>
                        <p className="message">Vui lòng thử lại hoặc liên hệ hỗ trợ</p>
                        <div className="actions">
                            <Link to="/wallet" className="btn-primary">Thử lại</Link>
                            <Link to="/" className="btn-secondary">Về trang chủ</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
