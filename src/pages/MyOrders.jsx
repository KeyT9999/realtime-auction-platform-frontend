import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import ReviewModal from '../components/review/ReviewModal';
import './MyOrders.css';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null });
    const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
    const [cancelReason, setCancelReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [reviewModal, setReviewModal] = useState({ isOpen: false, orderId: null, sellerName: '' });
    const [filters, setFilters] = useState({ status: '', fromDate: '', toDate: '', search: '' });

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async (filterOverride = null) => {
        try {
            setLoading(true);
            const f = filterOverride ?? filters;
            const params = {};
            if (f.status !== '') params.status = Number(f.status);
            if (f.fromDate) params.fromDate = f.fromDate;
            if (f.toDate) params.toDate = f.toDate;
            if (f.search?.trim()) params.search = f.search.trim();
            const data = await orderService.getMyOrders(Object.keys(params).length ? params : {});
            setOrders(data);
        } catch (error) {
            toast.error('Không thể tải danh sách đơn hàng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        loadOrders(filters);
    };

    const handleConfirmReceived = async () => {
        if (!confirmModal.orderId) return;

        try {
            setProcessing(true);
            await orderService.confirmOrder(confirmModal.orderId);
            toast.success('Đã xác nhận nhận hàng thành công!');
            setConfirmModal({ isOpen: false, orderId: null });
            loadOrders();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi xác nhận');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelModal.orderId) return;

        try {
            setProcessing(true);
            await orderService.cancelOrder(cancelModal.orderId, cancelReason);
            toast.success('Đã hủy đơn hàng. Tiền sẽ được hoàn lại.');
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
            <h1>📦 Đơn hàng của tôi</h1>

            <div className="order-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="0">Chờ gửi hàng</option>
                    <option value="1">Đang vận chuyển</option>
                    <option value="2">Hoàn tất</option>
                    <option value="3">Đã hủy</option>
                </select>
                <input type="date" value={filters.fromDate} onChange={(e) => setFilters(f => ({ ...f, fromDate: e.target.value }))} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                <span>→</span>
                <input type="date" value={filters.toDate} onChange={(e) => setFilters(f => ({ ...f, toDate: e.target.value }))} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                <input type="text" value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Tìm theo tên sản phẩm" style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '160px' }} />
                <button type="button" onClick={applyFilters} style={{ padding: '6px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Lọc</button>
            </div>

            {orders.length === 0 ? (
                <div className="empty-orders">
                    <div className="empty-orders-icon">🛒</div>
                    <h3>Chưa có đơn hàng nào</h3>
                    <p>Bạn chưa thắng phiên đấu giá nào. Hãy tham gia đấu giá ngay!</p>
                    <Link to="/auctions" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none' }}>
                        Khám phá đấu giá
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
                                            👤 Người bán: {order.sellerName}
                                        </span>
                                        <span className="order-meta-item">
                                            📅 {formatDate(order.createdAt)}
                                        </span>
                                        {getStatusBadge(order.status, order.statusText)}
                                    </div>

                                    {/* Shipping info */}
                                    {order.status === 1 && (order.trackingNumber || order.shippingCarrier) && (
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
                                        </div>
                                    )}

                                    <div className="order-amount">{formatCurrency(order.amount)}</div>
                                </div>
                            </div>

                            {/* Actions based on status */}
                            <div className="order-actions">
                                <Link to={`/orders/${order.id}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
                                    Xem chi tiết
                                </Link>

                                {order.status === 1 && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => setConfirmModal({ isOpen: true, orderId: order.id })}
                                    >
                                        ✅ Xác nhận đã nhận hàng
                                    </button>
                                )}

                                {(order.status === 0 || order.status === 1) && (
                                    <button
                                        className="btn-danger"
                                        onClick={() => setCancelModal({ isOpen: true, orderId: order.id })}
                                    >
                                        Hủy đơn
                                    </button>
                                )}

                                {/* Review button for completed orders */}
                                {order.status === 2 && !order.buyerHasReviewed && (
                                    <button
                                        className="btn-review"
                                        onClick={() => setReviewModal({
                                            isOpen: true,
                                            orderId: order.id,
                                            sellerName: order.sellerName
                                        })}
                                    >
                                        ⭐ Đánh giá người bán
                                    </button>
                                )}
                                {order.status === 2 && order.buyerHasReviewed && (
                                    <span className="reviewed-badge">✅ Đã đánh giá</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm Received Modal */}
            <Modal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, orderId: null })}
                title="Xác nhận đã nhận hàng"
            >
                <div style={{ padding: '1rem' }}>
                    <p style={{ marginBottom: '1.5rem' }}>
                        Bạn có chắc chắn đã nhận được hàng không? Sau khi xác nhận, tiền sẽ được chuyển cho người bán.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => setConfirmModal({ isOpen: false, orderId: null })}
                            disabled={processing}
                        >
                            Hủy
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleConfirmReceived}
                            disabled={processing}
                        >
                            {processing ? 'Đang xử lý...' : 'Xác nhận nhận hàng'}
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
                        Bạn có chắc muốn hủy đơn hàng này? Tiền cọc sẽ được hoàn lại vào ví của bạn.
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
                onClose={() => setReviewModal({ isOpen: false, orderId: null, sellerName: '' })}
                orderId={reviewModal.orderId}
                targetName={reviewModal.sellerName}
                targetRole="người bán"
                onSuccess={loadOrders}
            />
        </div>
    );
}

export default MyOrders;
