import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import ReviewModal from '../components/review/ReviewModal';
import Button from '../components/common/Button';
import './MyOrders.css';

function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmModal, setConfirmModal] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const [shipModal, setShipModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [shipData, setShipData] = useState({ trackingNumber: '', shippingCarrier: '', shippingNote: '' });
    const [processing, setProcessing] = useState(false);
    const [reviewModal, setReviewModal] = useState({ isOpen: false, sellerName: '' });

    useEffect(() => {
        if (id) loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.getOrder(id);
            setOrder(data);
        } catch (err) {
            setError(err.response?.status === 404 ? 'Đơn hàng không tồn tại' : (err.message || 'Không thể tải đơn hàng'));
            toast.error(err.response?.status === 404 ? 'Đơn hàng không tồn tại' : 'Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const isBuyer = user?.id && order?.buyerId === user.id;
    const isSeller = user?.id && order?.sellerId === user.id;

    const handleConfirmReceived = async () => {
        try {
            setProcessing(true);
            await orderService.confirmOrder(id);
            toast.success('Đã xác nhận nhận hàng!');
            setConfirmModal(false);
            loadOrder();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            setProcessing(true);
            await orderService.cancelOrder(id, cancelReason);
            toast.success('Đã hủy đơn hàng.');
            setCancelModal(false);
            setCancelReason('');
            loadOrder();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        } finally {
            setProcessing(false);
        }
    };

    const handleShipOrder = async () => {
        try {
            setProcessing(true);
            await orderService.shipOrder(id, shipData);
            toast.success('Đã cập nhật trạng thái gửi hàng!');
            setShipModal(false);
            setShipData({ trackingNumber: '', shippingCarrier: '', shippingNote: '' });
            loadOrder();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
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
        const iconMap = { 0: '⏳', 1: '🚚', 2: '✅', 3: '❌' };
        return (
            <span className={`status-badge ${statusMap[status] || 'status-pending-shipment'}`}>
                {iconMap[status]} {statusText}
            </span>
        );
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateString) =>
        dateString ? new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    if (loading) return <Loading />;
    if (error || !order) {
        return (
            <div className="orders-page">
                <p className="text-red-600">{error || 'Đơn hàng không tồn tại'}</p>
                <Link to="/my-orders">← Về đơn mua</Link> | <Link to="/my-sales">Đơn bán</Link>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="flex items-center gap-4 mb-6">
                <button type="button" onClick={() => navigate(-1)} className="text-primary-blue hover:underline">
                    ← Quay lại
                </button>
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
            </div>

            <div className="order-card max-w-2xl">
                <div className="order-card-content flex gap-4">
                    <div className="order-image flex-shrink-0">
                        {order.productImage ? (
                            <img src={order.productImage} alt={order.productTitle} className="w-32 h-32 object-cover rounded-lg" />
                        ) : (
                            <div className="order-image-placeholder w-32 h-32 flex items-center justify-center text-4xl rounded-lg bg-gray-100">📷</div>
                        )}
                    </div>
                    <div className="order-details flex-1 min-w-0">
                        <h2 className="order-title text-lg font-semibold">{order.productTitle}</h2>
                        <div className="order-meta flex flex-wrap gap-2 mt-2">
                            <span className="order-meta-item">👤 Người mua: {order.buyerName}</span>
                            <span className="order-meta-item">👤 Người bán: {order.sellerName}</span>
                            <span className="order-meta-item">📅 {formatDate(order.createdAt)}</span>
                            {getStatusBadge(order.status, order.statusText)}
                        </div>
                        {order.status === 1 && (order.trackingNumber || order.shippingCarrier) && (
                            <div className="shipping-info mt-2 p-2 bg-gray-50 rounded">
                                {order.trackingNumber && <div>📋 Mã vận đơn: <strong>{order.trackingNumber}</strong></div>}
                                {order.shippingCarrier && <div>🚛 ĐVVC: <strong>{order.shippingCarrier}</strong></div>}
                                {order.shippingNote && <div className="text-sm text-gray-600">{order.shippingNote}</div>}
                            </div>
                        )}
                        <div className="order-amount text-xl font-bold mt-2">{formatCurrency(order.amount)}</div>
                    </div>
                </div>

                <div className="order-actions flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <Link to={`/auctions/${order.auctionId}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
                        Xem phiên đấu giá
                    </Link>
                    {isBuyer && order.status === 1 && (
                        <Button variant="primary" onClick={() => setConfirmModal(true)}>✅ Xác nhận đã nhận hàng</Button>
                    )}
                    {isBuyer && (order.status === 0 || order.status === 1) && (
                        <Button variant="danger" onClick={() => setCancelModal(true)}>Hủy đơn</Button>
                    )}
                    {isSeller && order.status === 0 && (
                        <Button variant="primary" onClick={() => setShipModal(true)}>🚚 Đánh dấu đã gửi hàng</Button>
                    )}
                    {isSeller && (order.status === 0 || order.status === 1) && (
                        <Button variant="secondary" onClick={() => setCancelModal(true)}>Hủy đơn</Button>
                    )}
                    {(isBuyer || isSeller) && order.status !== 3 && order.status !== 4 && (
                        <Button variant="secondary" onClick={() => navigate(`/disputes/create/${order.id}`)}>⚖️ Mở tranh chấp</Button>
                    )}
                    {order.status === 4 && (
                        <Button variant="secondary" onClick={() => navigate('/disputes')}>🔍 Xem tranh chấp</Button>
                    )}
                    {isBuyer && order.status === 2 && !order.buyerHasReviewed && (
                        <Button variant="secondary" onClick={() => setReviewModal({ isOpen: true, sellerName: order.sellerName })}>⭐ Đánh giá người bán</Button>
                    )}
                    {isBuyer && order.status === 2 && order.buyerHasReviewed && (
                        <span className="reviewed-badge">✅ Đã đánh giá</span>
                    )}
                </div>
            </div>

            <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Xác nhận đã nhận hàng">
                <p>Bạn đã nhận được hàng? Xác nhận sẽ hoàn tất đơn hàng.</p>
                <div className="flex gap-2 mt-4">
                    <Button variant="primary" onClick={handleConfirmReceived} disabled={processing}>{processing ? 'Đang xử lý...' : 'Xác nhận'}</Button>
                    <Button variant="secondary" onClick={() => setConfirmModal(false)}>Hủy</Button>
                </div>
            </Modal>

            <Modal isOpen={cancelModal} onClose={() => { setCancelModal(false); setCancelReason(''); }} title="Hủy đơn hàng">
                <p>Bạn có chắc muốn hủy đơn hàng này?</p>
                <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Lý do (tùy chọn)" className="w-full mt-2 px-3 py-2 border rounded" />
                <div className="flex gap-2 mt-4">
                    <Button variant="danger" onClick={handleCancelOrder} disabled={processing}>{processing ? 'Đang xử lý...' : 'Hủy đơn'}</Button>
                    <Button variant="secondary" onClick={() => { setCancelModal(false); setCancelReason(''); }}>Đóng</Button>
                </div>
            </Modal>

            <Modal isOpen={shipModal} onClose={() => { setShipModal(false); setShipData({ trackingNumber: '', shippingCarrier: '', shippingNote: '' }); }} title="Đánh dấu đã gửi hàng">
                <div className="space-y-2">
                    <label className="block">Mã vận đơn *</label>
                    <input type="text" value={shipData.trackingNumber} onChange={(e) => setShipData({ ...shipData, trackingNumber: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="VD: EX123456789" />
                    <label className="block">Đơn vị vận chuyển</label>
                    <input type="text" value={shipData.shippingCarrier} onChange={(e) => setShipData({ ...shipData, shippingCarrier: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="VD: GHN, Viettel Post" />
                    <label className="block">Ghi chú</label>
                    <input type="text" value={shipData.shippingNote} onChange={(e) => setShipData({ ...shipData, shippingNote: e.target.value })} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="flex gap-2 mt-4">
                    <Button variant="primary" onClick={handleShipOrder} disabled={processing || !shipData.trackingNumber.trim()}>{processing ? 'Đang xử lý...' : 'Xác nhận gửi hàng'}</Button>
                    <Button variant="secondary" onClick={() => setShipModal(false)}>Hủy</Button>
                </div>
            </Modal>

            {reviewModal.isOpen && (
                <ReviewModal
                    isOpen={reviewModal.isOpen}
                    onClose={() => setReviewModal({ isOpen: false, sellerName: '' })}
                    orderId={id}
                    targetName={reviewModal.sellerName}
                    targetRole="người bán"
                    onSuccess={() => { setReviewModal({ isOpen: false, sellerName: '' }); loadOrder(); }}
                />
            )}
        </div>
    );
}

export default OrderDetail;
