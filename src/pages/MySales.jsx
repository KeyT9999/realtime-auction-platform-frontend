import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import ReviewModal from '../components/review/ReviewModal';
import './MyOrders.css';

function MySales() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shipModal, setShipModal] = useState({ isOpen: false, orderId: null, order: null });
    const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
    const [shipData, setShipData] = useState({ trackingNumber: '', shippingCarrier: '', shippingNote: '' });
    const [cancelReason, setCancelReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [reviewModal, setReviewModal] = useState({ isOpen: false, orderId: null, buyerName: '' });

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getMySales();
            setOrders(data);
        } catch (error) {
            toast.error('Không thể tải danh sách đơn bán');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleShipOrder = async () => {
        if (!shipModal.orderId) return;

        try {
            setProcessing(true);
            await orderService.shipOrder(shipModal.orderId, shipData);
            toast.success('Đã cập nhật trạng thái gửi hàng!');
            setShipModal({ isOpen: false, orderId: null, order: null });
            setShipData({ trackingNumber: '', shippingCarrier: '', shippingNote: '' });
            loadOrders();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelModal.orderId) return;

        try {
            setProcessing(true);
            await orderService.cancelOrder(cancelModal.orderId, cancelReason);
            toast.success('Đã hủy đơn hàng.');
            setCancelModal({ isOpen: false, orderId: null });
            setCancelReason('');
            loadOrders();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi hủy đơn');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status, statusText) => {
        const statusMap = {
            0: 'status-pending-shipment',
            1: 'status-shipped',
            2: 'status-completed',
            3: 'status-cancelled',
        };
        const iconMap = {
            0: '⏳',
            1: '🚚',
            2: '✅',
            3: '❌',
        };
        return (
            <span className={`status-badge ${statusMap[status] || 'status-pending-shipment'}`}>
                {iconMap[status]} {statusText}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="orders-page">
            <h1>💰 Đơn bán của tôi</h1>

            {orders.length === 0 ? (
                <div className="empty-orders">
                    <div className="empty-orders-icon">📭</div>
                    <h3>Chưa có đơn bán nào</h3>
                    <p>Bạn chưa bán được sản phẩm nào. Hãy tạo phiên đấu giá mới!</p>
                    <Link to="/create-auction" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none' }}>
                        Tạo đấu giá mới
                    </Link>
                </div>
            ) : (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-content">
                                <div className="order-image">
                                    {order.productImage ? (
                                        <img src={order.productImage} alt={order.productTitle} />
                                    ) : (
                                        <div className="order-image-placeholder">📷</div>
                                    )}
                                </div>
                                <div className="order-details">
                                    <h3 className="order-title">{order.productTitle}</h3>
                                    <div className="order-meta">
                                        <span className="order-meta-item">
                                            👤 Người mua: {order.buyerName}
                                        </span>
                                        <span className="order-meta-item">
                                            📅 {formatDate(order.createdAt)}
                                        </span>
                                        {getStatusBadge(order.status, order.statusText)}
                                    </div>

                                    {/* Shipping info if shipped */}
                                    {order.status >= 1 && (order.trackingNumber || order.shippingCarrier) && (
                                        <div className="shipping-info">
                                            {order.trackingNumber && (
                                                <span className="shipping-info-item">
                                                    📋 Mã vận đơn: <strong>{order.trackingNumber}</strong>
                                                </span>
                                            )}
                                            {order.shippingCarrier && (
                                                <span className="shipping-info-item">
                                                    🚛 ĐVVC: <strong>{order.shippingCarrier}</strong>
                                                </span>
                                            )}
                                            {order.shippedAt && (
                                                <span className="shipping-info-item">
                                                    📅 Gửi lúc: <strong>{formatDate(order.shippedAt)}</strong>
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="order-amount">{formatCurrency(order.amount)}</div>
                                </div>
                            </div>

                            {/* Actions based on status */}
                            <div className="order-actions">
                                <Link to={`/auctions/${order.auctionId}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
                                    Xem chi tiết
                                </Link>

                                {order.status === 0 && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => setShipModal({ isOpen: true, orderId: order.id, order })}
                                    >
                                        🚚 Đã gửi hàng
                                    </button>
                                )}

                                {order.status === 1 && (
                                    <span style={{ padding: '0.5rem 1rem', color: '#1e40af', fontWeight: '500' }}>
                                        Chờ người mua xác nhận...
                                    </span>
                                )}

                                {order.status === 0 && (
                                    <button
                                        className="btn-danger"
                                        onClick={() => setCancelModal({ isOpen: true, orderId: order.id })}
                                    >
                                        Hủy đơn
                                    </button>
                                )}

                                {/* Review button for completed orders */}
                                {order.status === 2 && !order.sellerHasReviewed && (
                                    <button
                                        className="btn-review"
                                        onClick={() => setReviewModal({
                                            isOpen: true,
                                            orderId: order.id,
                                            buyerName: order.buyerName
                                        })}
                                    >
                                        ⭐ Đánh giá người mua
                                    </button>
                                )}
                                {order.status === 2 && order.sellerHasReviewed && (
                                    <span className="reviewed-badge">✅ Đã đánh giá</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Ship Order Modal */}
            <Modal
                isOpen={shipModal.isOpen}
                onClose={() => {
                    setShipModal({ isOpen: false, orderId: null, order: null });
                    setShipData({ trackingNumber: '', shippingCarrier: '', shippingNote: '' });
                }}
                title="Xác nhận gửi hàng"
            >
                <div className="ship-modal-content" style={{ padding: '1rem' }}>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        Nhập thông tin vận chuyển để người mua có thể theo dõi đơn hàng.
                    </p>

                    <label>
                        Mã vận đơn
                        <input
                            type="text"
                            value={shipData.trackingNumber}
                            onChange={(e) => setShipData({ ...shipData, trackingNumber: e.target.value })}
                            placeholder="VD: VN123456789"
                        />
                    </label>

                    <label>
                        Đơn vị vận chuyển
                        <input
                            type="text"
                            value={shipData.shippingCarrier}
                            onChange={(e) => setShipData({ ...shipData, shippingCarrier: e.target.value })}
                            placeholder="VD: GHTK, GHN, J&T, Viettel Post..."
                        />
                    </label>

                    <label>
                        Ghi chú (tùy chọn)
                        <textarea
                            value={shipData.shippingNote}
                            onChange={(e) => setShipData({ ...shipData, shippingNote: e.target.value })}
                            placeholder="Ghi chú thêm về đơn hàng..."
                            rows={3}
                        />
                    </label>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShipModal({ isOpen: false, orderId: null, order: null });
                                setShipData({ trackingNumber: '', shippingCarrier: '', shippingNote: '' });
                            }}
                            disabled={processing}
                        >
                            Hủy
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleShipOrder}
                            disabled={processing}
                        >
                            {processing ? 'Đang xử lý...' : 'Xác nhận đã gửi'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Cancel Order Modal */}
            <Modal
                isOpen={cancelModal.isOpen}
                onClose={() => {
                    setCancelModal({ isOpen: false, orderId: null });
                    setCancelReason('');
                }}
                title="Hủy đơn hàng"
            >
                <div style={{ padding: '1rem' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        Bạn có chắc muốn hủy đơn hàng này? Tiền cọc sẽ được hoàn lại cho người mua.
                    </p>
                    <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                        <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Lý do hủy (tùy chọn)</span>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Nhập lý do hủy đơn..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '80px' }}
                        />
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setCancelModal({ isOpen: false, orderId: null });
                                setCancelReason('');
                            }}
                            disabled={processing}
                        >
                            Đóng
                        </button>
                        <button
                            className="btn-danger"
                            onClick={handleCancelOrder}
                            disabled={processing}
                        >
                            {processing ? 'Đang xử lý...' : 'Xác nhận hủy'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Review Modal */}
            <ReviewModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ isOpen: false, orderId: null, buyerName: '' })}
                orderId={reviewModal.orderId}
                targetName={reviewModal.buyerName}
                targetRole="người mua"
                onSuccess={loadOrders}
            />
        </div>
    );
}

export default MySales;
