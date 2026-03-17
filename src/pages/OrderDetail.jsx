import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import ReviewModal from '../components/review/ReviewModal';
import Button from '../components/common/Button';
import EscrowStatusBadge from '../components/common/EscrowStatusBadge';
import './MyOrders.css';

function useCountdown(targetDate) {
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);
    useEffect(() => {
        if (!targetDate) { setTimeLeft(null); return; }
        const calc = () => {
            const diff = new Date(targetDate) - new Date();
            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
                return;
            }
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
                expired: false
            });
        };
        calc();
        timerRef.current = setInterval(calc, 1000);
        return () => clearInterval(timerRef.current);
    }, [targetDate]);
    return timeLeft;
}

const RELEASE_REASON = {
    BuyerConfirmed: 'Ng\u01b0\u1eddi mua \u0111\u00e3 x\u00e1c nh\u1eadn',
    AutoRelease: 'T\u1ef1 \u0111\u1ed9ng gi\u1ea3i ph\u00f3ng (7 ng\u00e0y)',
    AdminDecision_SellerWins: 'Admin: Ng\u01b0\u1eddi b\u00e1n th\u1eafng',
    AdminDecision_BuyerWins: 'Admin: Ng\u01b0\u1eddi mua th\u1eafng',
    OrderCancelled: '\u0110\u01a1n h\u00e0ng b\u1ecb h\u1ee7y',
};

const STATUS_CLS = {
    0: 'status-pending-shipment', 1: 'status-shipped',
    2: 'status-completed', 3: 'status-cancelled', 4: 'status-disputed'
};

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

    const countdown = useCountdown(
        order?.escrowStatus === 'Frozen' && order?.escrowAutoReleaseAt ? order.escrowAutoReleaseAt : null
    );

    useEffect(() => { if (id) loadOrder(); }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true); setError(null);
            const data = await orderService.getOrder(id);
            setOrder(data);
        } catch (err) {
            const msg = err.response?.status === 404 ? 'Kh\u00f4ng t\u00ecm th\u1ea5y' : (err.message || 'L\u1ed7i t\u1ea3i d\u1eef li\u1ec7u');
            setError(msg); toast.error(msg);
        } finally { setLoading(false); }
    };

    const isBuyer = user?.id && order?.buyerId === user.id;
    const isSeller = user?.id && order?.sellerId === user.id;

    const handleConfirmReceived = async () => {
        try {
            setProcessing(true);
            await orderService.confirmOrder(id);
            toast.success('\u0110\u00e3 x\u00e1c nh\u1eadn! Ti\u1ec1n Escrow \u0111\u00e3 \u0111\u01b0\u1ee3c gi\u1ea3i ph\u00f3ng cho ng\u01b0\u1eddi b\u00e1n.');
            setConfirmModal(false); loadOrder();
        } catch (err) { toast.error(err.message || 'L\u1ed7i'); }
        finally { setProcessing(false); }
    };

    const handleCancelOrder = async () => {
        try {
            setProcessing(true);
            await orderService.cancelOrder(id, cancelReason);
            toast.success('\u0110\u00e3 h\u1ee7y. Ti\u1ec1n Escrow \u0111\u00e3 ho\u00e0n v\u1ec1 v\u00ed.');
            setCancelModal(false); setCancelReason(''); loadOrder();
        } catch (err) { toast.error(err.message || 'L\u1ed7i'); }
        finally { setProcessing(false); }
    };

    const handleShipOrder = async () => {
        try {
            setProcessing(true);
            await orderService.shipOrder(id, shipData);
            toast.success('\u0110\u00e3 c\u1eadp nh\u1eadt g\u1eedi h\u00e0ng!');
            setShipModal(false); setShipData({ trackingNumber: '', shippingCarrier: '', shippingNote: '' }); loadOrder();
        } catch (err) { toast.error(err.message || 'L\u1ed7i'); }
        finally { setProcessing(false); }
    };

    const fmt = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--';

    if (loading) return <Loading />;
    if (error || !order) return (
        <div className="orders-page">
            <p style={{ color: 'red' }}>{error}</p>
            <Link to="/my-orders">&larr; Quay l\u1ea1i</Link>
        </div>
    );

    const ef = order.escrowStatus === 'Frozen';
    const er = order.escrowStatus === 'Released';
    const erf = order.escrowStatus === 'Refunded';

    return (
        <div className="bg-slate-950 min-h-screen text-slate-300 font-display p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Quay lại
                    </button>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white m-0">
                        Chi tiết đơn hàng
                    </h1>
                </div>
            {order.escrowStatus && order.escrowStatus !== 'None' && (
                <div className={`mb-6 rounded-3xl p-6 border ${ef ? 'bg-emerald-500/10 border-emerald-500/20' : er ? 'bg-blue-500/10 border-blue-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${ef ? 'bg-emerald-500/20' : er ? 'bg-blue-500/20' : 'bg-rose-500/20'}`}>
                            {ef ? '🔒' : er ? '✅' : '💸'}
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <h3 className={`text-lg font-bold mb-1 ${ef ? 'text-emerald-400' : er ? 'text-blue-400' : 'text-rose-400'}`}>
                                {ef && 'Tiền đang được bảo vệ bởi Escrow'}
                                {er && 'Escrow đã giải phóng thành công'}
                                {erf && 'Escrow đã hoàn tiền thành công'}
                            </h3>
                            {order.escrowAmount > 0 && (
                                <div className={`text-2xl font-black ${ef ? 'text-emerald-500' : er ? 'text-blue-500' : 'text-rose-500'}`}>
                                    {fmt(order.escrowAmount)}
                                </div>
                            )}
                        </div>
                    </div>

                    {ef && isBuyer && (
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-sm text-slate-300 mb-4 flex gap-3">
                            <span className="text-xl">🛡️</span>
                            <div>
                                <strong className="text-white block mb-1">Bảo vệ Người mua:</strong>
                                Tiền của bạn đang được giữ an toàn trong Escrow. Chỉ chuyển cho người bán khi bạn xác nhận nhận hàng.
                            </div>
                        </div>
                    )}

                    {ef && isSeller && (
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-sm text-slate-300 mb-4 flex gap-3">
                            <span className="text-xl">🛡️</span>
                            <div>
                                <strong className="text-white block mb-1">Bảo vệ Người bán:</strong>
                                {order.escrowAmount > 0 ? fmt(order.escrowAmount) : 'Tiền'} đang được giữ an toàn — bạn sẽ nhận được khi giao hàng thành công.
                            </div>
                        </div>
                    )}

                    {ef && order.status === 1 && countdown && !countdown.expired && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-700 mb-6 w-fit mx-auto sm:mx-0">
                            <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">timer</span>
                                Tự động giải phóng sau:
                            </span>
                            <div className="flex gap-2">
                                <div className="flex flex-col items-center justify-center bg-slate-950 rounded-xl w-14 h-14 border border-slate-700 shadow-inner">
                                    <span className="text-xl font-black text-white leading-none mb-1">{countdown.days}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ngày</span>
                                </div>
                                <span className="text-xl font-black text-slate-600 self-center mb-2">:</span>
                                <div className="flex flex-col items-center justify-center bg-slate-950 rounded-xl w-14 h-14 border border-slate-700 shadow-inner">
                                    <span className="text-xl font-black text-white leading-none mb-1">{String(countdown.hours).padStart(2,'0')}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">giờ</span>
                                </div>
                                <span className="text-xl font-black text-slate-600 self-center mb-2">:</span>
                                <div className="flex flex-col items-center justify-center bg-slate-950 rounded-xl w-14 h-14 border border-slate-700 shadow-inner">
                                    <span className="text-xl font-black text-white leading-none mb-1">{String(countdown.minutes).padStart(2,'0')}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">phút</span>
                                </div>
                                <span className="text-xl font-black text-slate-600 self-center mb-2">:</span>
                                <div className="flex flex-col items-center justify-center bg-slate-950 rounded-xl w-14 h-14 border border-slate-700 shadow-inner">
                                    <span className="text-xl font-black text-white leading-none mb-1">{String(countdown.seconds).padStart(2,'0')}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">giây</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="relative pt-6 md:pt-8 md:pl-4">
                        {/* Timeline styles implementation embedded using Tailwind where possible */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-0 relative z-10">
                            <div className={`flex-1 flex md:flex-col items-start gap-4 ${order.escrowFrozenAt ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg z-10 ${order.escrowFrozenAt ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                    🔒
                                </div>
                                <div className="flex-1 md:pr-4 relative">
                                    {/* Connecting line desktop */}
                                    <div className="hidden md:block absolute h-1 bg-slate-800 top-[-30px] right-0 left-5 -z-10"></div>
                                    <div className={`hidden md:block absolute h-1 top-[-30px] left-5 -z-10 transition-all duration-700 ${order.shippedAt ? 'right-0 bg-amber-500' : 'w-0'}`}></div>

                                    {/* Connecting line mobile */}
                                    <div className="md:hidden absolute w-1 bg-slate-800 top-5 bottom-[-40px] left-[-34px] -z-10"></div>
                                    <div className={`md:hidden absolute w-1 top-5 left-[-34px] -z-10 transition-all duration-700 ${order.shippedAt ? 'bottom-[-40px] bg-amber-500' : 'h-0'}`}></div>

                                    <h4 className={`text-sm font-bold mb-1 ${order.escrowFrozenAt ? 'text-white' : 'text-slate-400'}`}>Tiền đóng băng</h4>
                                    {order.escrowFrozenAt && <p className="text-xs text-slate-400">{fmtDate(order.escrowFrozenAt)}</p>}
                                </div>
                            </div>

                            <div className={`flex-1 flex md:flex-col items-start gap-4 ${order.shippedAt ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg z-10 ${order.shippedAt ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                    📦
                                </div>
                                <div className="flex-1 md:pr-4 relative">
                                    {/* Connecting line desktop */}
                                    <div className="hidden md:block absolute h-1 bg-slate-800 top-[-30px] right-0 left-5 -z-10"></div>
                                    <div className={`hidden md:block absolute h-1 top-[-30px] left-5 -z-10 transition-all duration-700 ${order.escrowReleasedAt ? 'right-0 bg-amber-500' : 'w-0'}`}></div>

                                    {/* Connecting line mobile */}
                                    <div className="md:hidden absolute w-1 bg-slate-800 top-5 bottom-[-40px] left-[-34px] -z-10"></div>
                                    <div className={`md:hidden absolute w-1 top-5 left-[-34px] -z-10 transition-all duration-700 ${order.escrowReleasedAt ? 'bottom-[-40px] bg-amber-500' : 'h-0'}`}></div>

                                    <h4 className={`text-sm font-bold mb-1 ${order.shippedAt ? 'text-white' : 'text-slate-400'}`}>Giao hàng</h4>
                                    {order.shippedAt && <p className="text-xs text-slate-400">{fmtDate(order.shippedAt)}</p>}
                                </div>
                            </div>

                            <div className={`flex-1 flex md:flex-col items-start gap-4 ${order.escrowReleasedAt ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg z-10 ${order.escrowReleasedAt ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                    {erf ? '💸' : '✅'}
                                </div>
                                <div className="flex-1 relative">
                                    <h4 className={`text-sm font-bold mb-1 ${order.escrowReleasedAt ? 'text-white' : 'text-slate-400'}`}>{erf ? 'Hoàn tiền' : 'Thanh toán'}</h4>
                                    {order.escrowReleasedAt && <p className="text-xs text-slate-400 mb-1">{fmtDate(order.escrowReleasedAt)}</p>}
                                    {order.escrowReleaseReason && (
                                        <p className="inline-block px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-300">
                                            {RELEASE_REASON[order.escrowReleaseReason] || order.escrowReleaseReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 p-6">
                    <div className="shrink-0">
                        {order.productImage ? (
                            <img
                                src={order.productImage}
                                alt={order.productTitle}
                                className="w-full md:w-32 h-48 md:h-32 object-cover rounded-xl border border-slate-700 bg-slate-800"
                            />
                        ) : (
                            <div className="w-full md:w-32 h-48 md:h-32 flex items-center justify-center text-5xl bg-slate-800 border border-slate-700 rounded-xl">
                                📷
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h2 className="text-xl font-bold text-white mb-2 leading-tight">{order.productTitle}</h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">person</span>
                                Người mua:
                                <strong className="text-slate-300 ml-1">{order.buyerName}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">storefront</span>
                                Người bán:
                                <strong className="text-slate-300 ml-1">{order.sellerName}</strong>
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 text-xs ml-auto">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {fmtDate(order.createdAt)}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1
                                ${order.status === 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
                                ${order.status === 1 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                                ${order.status === 2 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                                ${order.status === 3 ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                            `}>
                                {order.status === 0 && <span className="material-symbols-outlined text-[14px]">pending</span>}
                                {order.status === 1 && <span className="material-symbols-outlined text-[14px]">local_shipping</span>}
                                {order.status === 2 && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                                {order.status === 3 && <span className="material-symbols-outlined text-[14px]">cancel</span>}
                                {order.statusText}
                            </span>
                            {order.escrowStatus && order.escrowStatus !== 'None' && (
                                <EscrowStatusBadge
                                    escrowStatus={order.escrowStatus}
                                    escrowAmount={order.escrowAmount}
                                    daysUntilAutoRelease={order.daysUntilAutoRelease}
                                    compact
                                />
                            )}
                        </div>
                        {order.status === 1 && (order.trackingNumber || order.shippingCarrier) && (
                            <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm flex gap-4">
                                {order.trackingNumber && (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-500 text-[18px]">barcode</span>
                                        <span className="text-slate-400">Mã vận đơn:</span>
                                        <strong className="text-slate-200">{order.trackingNumber}</strong>
                                    </div>
                                )}
                                {order.shippingCarrier && (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-500 text-[18px]">local_shipping</span>
                                        <span className="text-slate-400">ĐVVC:</span>
                                        <strong className="text-slate-200">{order.shippingCarrier}</strong>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="mt-4 text-2xl font-black text-amber-500 ml-auto md:ml-0 md:text-right w-full">{fmt(order.amount)}</div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 p-4 md:px-6 md:py-5 border-t border-slate-800 bg-slate-900/50">
                    <Link to={'/auctions/' + order.auctionId}
                        className="px-5 py-2.5 bg-slate-800 text-slate-300 text-sm font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                        Xem phiên đấu giá
                    </Link>
                    {isBuyer && order.status === 1 && (
                        <button onClick={() => setConfirmModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-500/20 text-slate-950 text-sm font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            Xác nhận đã nhận hàng
                        </button>
                    )}
                    {isBuyer && order.status === 0 && (
                        <button onClick={() => setCancelModal(true)} className="px-5 py-2.5 bg-red-500/10 text-red-500 text-sm font-bold rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20">
                            Hủy đơn
                        </button>
                    )}
                    {isSeller && order.status === 0 && (
                        <button onClick={() => setShipModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-sm font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-colors shadow-sm shadow-amber-500/20 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">package_2</span>
                            Đánh dấu đã gửi hàng
                        </button>
                    )}
                    {isSeller && (order.status === 0 || order.status === 1) && (
                        <button onClick={() => setCancelModal(true)} className="px-5 py-2.5 bg-red-500/10 text-red-500 text-sm font-bold rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20">
                            Hủy đơn
                        </button>
                    )}
                    {(isBuyer || isSeller) && order.status !== 3 && order.status !== 4 && (
                        <button onClick={() => navigate('/disputes/create/' + order.id)} className="px-5 py-2.5 bg-slate-800 text-rose-400 text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                            Mở tranh chấp
                        </button>
                    )}
                    {order.status === 4 && (
                        <button onClick={() => navigate('/disputes')} className="px-5 py-2.5 bg-slate-800 text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                            Xem tranh chấp
                        </button>
                    )}
                    {isBuyer && order.status === 2 && !order.buyerHasReviewed && (
                        <button onClick={() => setReviewModal({ isOpen: true, sellerName: order.sellerName })} className="px-5 py-2.5 bg-amber-500/10 text-amber-500 text-sm font-bold rounded-xl hover:bg-amber-500/20 transition-colors border border-amber-500/20 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">star</span>
                            Đánh giá người bán
                        </button>
                    )}
                    {isBuyer && order.status === 2 && order.buyerHasReviewed && (
                        <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            Đã đánh giá
                        </span>
                    )}
                </div>
            </div>

            <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Xác nhận đã nhận hàng">
                <div className="p-2 space-y-4 text-slate-300">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <p className="font-bold text-emerald-400 mb-2">💸 Sau khi xác nhận:</p>
                        <ul className="space-y-1 text-sm text-emerald-300/80">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> Tiền Escrow giải phóng cho người bán</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> Hoàn tất đơn hàng</li>
                            <li className="flex items-center gap-2 text-rose-400"><span className="material-symbols-outlined text-[16px]">warning</span> Không thể hoàn tác</li>
                        </ul>
                    </div>
                    <div className="flex gap-3 mt-6 justify-end">
                        <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors" onClick={() => setConfirmModal(false)}>Chưa, đợi đã</button>
                        <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-xl font-bold transition-colors shadow-sm shadow-emerald-500/20 flex items-center gap-2" onClick={handleConfirmReceived} disabled={processing}>
                            {processing ? 'Đang xử lý...' : <>✅ Xác nhận & Giải phóng tiền</>}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={cancelModal} onClose={() => { setCancelModal(false); setCancelReason(''); }} title="Hủy đơn hàng">
                <div className="p-2 space-y-4 text-slate-300">
                    <p>Bạn có chắc muốn hủy đơn hàng này?</p>
                    {order.escrowStatus === 'Frozen' && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
                            💸 Tiền Escrow sẽ được hoàn trả về ví của bạn.
                        </div>
                    )}
                    <label className="block">
                        <span className="text-sm font-bold text-slate-400 mb-2 block">Lý do (tùy chọn)</span>
                        <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Nhập lý do hủy..."
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
                    </label>
                    <div className="flex gap-3 justify-end mt-6">
                        <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors" onClick={() => { setCancelModal(false); setCancelReason(''); }}>Đóng</button>
                        <button className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl font-bold transition-colors" onClick={handleCancelOrder} disabled={processing}>
                            {processing ? 'Đang xử lý...' : 'Hủy & Hoàn tiền'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={shipModal}
                onClose={() => { setShipModal(false); setShipData({ trackingNumber: '', shippingCarrier: '', shippingNote: '' }); }}
                title="Đánh dấu đã gửi hàng">
                <div className="p-2 space-y-4 text-slate-300">
                    {order.escrowStatus === 'Frozen' && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm flex gap-2">
                            <span className="material-symbols-outlined text-[20px]">timer</span>
                            Sau khi gửi, bộ đếm 7 ngày auto-release sẽ bắt đầu.
                        </div>
                    )}
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-bold text-slate-400 mb-2 block">Mã vận đơn <span className="text-rose-500">*</span></span>
                            <input type="text" value={shipData.trackingNumber}
                                onChange={(e) => setShipData({ ...shipData, trackingNumber: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                placeholder="EX123456789" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-slate-400 mb-2 block">Đơn vị vận chuyển <span className="text-rose-500">*</span></span>
                            <input type="text" value={shipData.shippingCarrier}
                                onChange={(e) => setShipData({ ...shipData, shippingCarrier: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                placeholder="GHN, Viettel Post, J&T" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-slate-400 mb-2 block">Ghi chú</span>
                            <input type="text" value={shipData.shippingNote}
                                onChange={(e) => setShipData({ ...shipData, shippingNote: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                placeholder="Ghi chú thêm..." />
                        </label>
                    </div>
                    <div className="flex gap-3 justify-end mt-6">
                        <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors" onClick={() => setShipModal(false)}>Hủy</button>
                        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-bold transition-colors shadow-sm shadow-amber-500/20 flex items-center gap-2" onClick={handleShipOrder} disabled={processing || !shipData.trackingNumber.trim() || !shipData.shippingCarrier.trim()}>
                            {processing ? 'Đang xử lý...' : <>🚚 Xác nhận gửi hàng</>}
                        </button>
                    </div>
                </div>
            </Modal>

            {reviewModal.isOpen && (
                <ReviewModal
                    isOpen={reviewModal.isOpen}
                    onClose={() => setReviewModal({ isOpen: false, sellerName: '' })}
                    orderId={id}
                    targetName={reviewModal.sellerName}
                    targetRole={'người bán'}
                    onSuccess={() => { setReviewModal({ isOpen: false, sellerName: '' }); loadOrder(); }}
                />
            )}
            </div>
        </div>
    );
}

export default OrderDetail;