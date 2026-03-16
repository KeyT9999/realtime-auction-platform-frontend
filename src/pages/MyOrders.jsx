import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import ReviewModal from '../components/review/ReviewModal';
import EscrowStatusBadge from '../components/common/EscrowStatusBadge';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        orderId: null,
    });
    const [cancelModal, setCancelModal] = useState({
        isOpen: false,
        orderId: null,
    });
    const [cancelReason, setCancelReason] = useState("");
    const [processing, setProcessing] = useState(false);
    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
        orderId: null,
        sellerName: "",
    });
    const [filters, setFilters] = useState({
        status: "",
        fromDate: "",
        toDate: "",
        search: "",
    });

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
        const badgeStyles = {
            0: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            1: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
            2: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            3: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
        };
        const iconMap = {
            0: '⏳',
            1: '🚚',
            2: '✅',
            3: '❌',
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeStyles[status] || badgeStyles[0]}`}>
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
        <div className="w-full min-h-screen bg-slate-950 mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <span role="img" aria-label="package">📦</span> Đơn hàng của tôi
                </h1>

                <div className="flex flex-wrap gap-3 items-center mb-6 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none text-sm"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="0">Chờ gửi hàng</option>
                        <option value="1">Đang vận chuyển</option>
                        <option value="2">Hoàn tất</option>
                        <option value="3">Đã hủy</option>
                    </select>

                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-2">
                        <input type="date" value={filters.fromDate} onChange={(e) => setFilters(f => ({ ...f, fromDate: e.target.value }))} className="bg-transparent text-white text-sm outline-none px-2 py-2" />
                        <span className="text-slate-500 text-xs">→</span>
                        <input type="date" value={filters.toDate} onChange={(e) => setFilters(f => ({ ...f, toDate: e.target.value }))} className="bg-transparent text-white text-sm outline-none px-2 py-2" />
                    </div>

                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                        placeholder="Tìm theo tên sản phẩm"
                        className="px-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none text-sm min-w-[200px]"
                    />
                    <button
                        type="button"
                        onClick={applyFilters}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-colors text-sm cursor-pointer ml-auto"
                    >
                        Lọc
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-12 text-center flex flex-col items-center">
                        <div className="text-6xl mb-4 opacity-50">🛒</div>
                        <h3 className="text-xl font-bold text-white mb-2">Chưa có đơn hàng nào</h3>
                        <p className="text-slate-400 mb-6">Bạn chưa thắng phiên đấu giá nào. Hãy tham gia đấu giá ngay!</p>
                        <Link to="/auctions" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-colors inline-block">
                            Khám phá đấu giá
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="p-5 sm:p-6 flex flex-col md:row gap-5 items-start md:items-center flex-wrap md:flex-nowrap">
                                    <div className="w-full md:w-32 h-32 shrink-0 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                                        {order.productImage ? (
                                            <img src={order.productImage} alt={order.productTitle} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">📷</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-2 truncate">{order.productTitle}</h3>
                                                <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-2 items-center">
                                                    <span className="flex items-center gap-1"><span className="text-slate-500">Người bán:</span> <span className="text-slate-300 font-semibold">{order.sellerName}</span></span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block"></span>
                                                    <span className="flex items-center gap-1"><span className="text-slate-500">Ngày đặt:</span> <span>{formatDate(order.createdAt)}</span></span>
                                                </div>
                                                {/* Escrow Badge */}
                                                {order.escrowStatus && order.escrowStatus !== 'None' && (
                                                    <div className="mb-2">
                                                        <EscrowStatusBadge
                                                            escrowStatus={order.escrowStatus}
                                                            escrowAmount={order.escrowAmount}
                                                            daysUntilAutoRelease={order.daysUntilAutoRelease}
                                                            compact
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusBadge(order.status, order.statusText)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg sm:text-2xl font-black text-amber-500 tracking-tight">
                                                    {formatCurrency(order.amount)}
                                                </div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Mã đơn: #{order.id.slice(0, 8)}</p>
                                            </div>
                                        </div>

                                        {/* Shipping info */}
                                        {order.status === 1 && (order.trackingNumber || order.shippingCarrier) && (
                                            <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3 text-sm text-blue-300 flex flex-wrap gap-4 mt-2">
                                                {order.trackingNumber && (
                                                    <span>Mã vận đơn: <strong className="text-blue-400">{order.trackingNumber}</strong></span>
                                                )}
                                                {order.shippingCarrier && (
                                                    <span>ĐVVC: <strong className="text-blue-400">{order.shippingCarrier}</strong></span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions based on status */}
                                <div className="bg-slate-950/50 px-5 py-4 border-t border-slate-800 flex flex-wrap gap-3 justify-end items-center">
                                    <Link to={`/orders/${order.id}`} className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700">
                                        Xem chi tiết
                                    </Link>

                                    {order.status === 1 && (
                                        <button
                                            className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-colors"
                                            onClick={() => setConfirmModal({ isOpen: true, orderId: order.id })}
                                        >
                                            ✅ Xác nhận đã nhận hàng
                                        </button>
                                    )}

                                    {(order.status === 0 || order.status === 1) && (
                                        <button
                                            className="px-5 py-2 rounded-xl text-sm font-semibold border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors"
                                            onClick={() => setCancelModal({ isOpen: true, orderId: order.id })}
                                        >
                                            Hủy đơn
                                        </button>
                                    )}

                                    {/* Review button for completed orders */}
                                    {order.status === 2 && !order.buyerHasReviewed && (
                                        <button
                                            className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-500 text-slate-900 hover:bg-amber-600 transition-colors"
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
                                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">check_circle</span> Đã đánh giá
                                        </span>
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
                    <div className="p-5 font-[Inter,sans-serif]">
                        <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                            Bạn có chắc chắn đã nhận được hàng không? Sau khi xác nhận, tiền sẽ được chuyển cho người bán.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700/80 transition-colors"
                                onClick={() => setConfirmModal({ isOpen: false, orderId: null })}
                                disabled={processing}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
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
                    <div className="p-5 font-[Inter,sans-serif]">
                        <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                            Bạn có chắc muốn hủy đơn hàng này? Tiền cọc sẽ được hoàn lại vào ví của bạn.
                        </p>
                        <label className="block mb-6">
                            <span className="block mb-2 text-sm font-semibold text-slate-400">Lý do hủy (tùy chọn)</span>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Nhập lý do hủy đơn..."
                                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all min-h-[100px]"
                            />
                        </label>
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700/80 transition-colors"
                                onClick={() => {
                                    setCancelModal({ isOpen: false, orderId: null });
                                    setCancelReason('');
                                }}
                                disabled={processing}
                            >
                                Đóng
                            </button>
                            <button
                                className="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-500 border border-red-500/30 font-bold text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
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
        </div>
    );
}

export default MyOrders;
