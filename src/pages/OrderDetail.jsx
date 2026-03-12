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
        <div className="orders-page">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button type="button" onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '0.9rem' }}>
                    {'â† Quay l\u1ea1i'}
                </button>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                    {'Chi ti\u1ebft \u0111\u01a1n h\u00e0ng'}
                </h1>
            </div>

            {order.escrowStatus && order.escrowStatus !== 'None' && (
                <div className={'escrow-section mb-4 ' + (ef ? 'escrow-section--frozen' : er ? 'escrow-section--released' : 'escrow-section--refunded')}>
                    <div className="escrow-section__header">
                        <span className="escrow-section__icon">{ef ? 'ðŸ”’' : er ? 'âœ…' : 'ðŸ’¸'}</span>
                        <div>
                            <div className="escrow-section__title">
                                {ef && 'Ti\u1ec1n \u0111ang \u0111\u01b0\u1ee3c b\u1ea3o v\u1ec7 b\u1edfi Escrow'}
                                {er && 'Escrow \u0111\u00e3 gi\u1ea3i ph\u00f3ng th\u00e0nh c\u00f4ng'}
                                {erf && 'Escrow \u0111\u00e3 ho\u00e0n ti\u1ec1n th\u00e0nh c\u00f4ng'}
                            </div>
                            {order.escrowAmount > 0 && (
                                <div className="escrow-section__amount">{fmt(order.escrowAmount)}</div>
                            )}
                        </div>
                    </div>

                    {ef && isBuyer && (
                        <div className="escrow-section__notice escrow-notice--buyer">
                            ðŸ›¡ï¸ <strong>{'B\u1ea3o v\u1ec7 Ng\u01b0\u1eddi mua:'}</strong>{' '}
                            {'Ti\u1ec1n c\u1ee7a b\u1ea1n \u0111ang \u0111\u01b0\u1ee3c gi\u1eef an to\u00e0n trong Escrow. Ch\u1ec9 chuy\u1ec3n cho ng\u01b0\u1eddi b\u00e1n khi b\u1ea1n x\u00e1c nh\u1eadn nh\u1eadn h\u00e0ng.'}
                        </div>
                    )}

                    {ef && isSeller && (
                        <div className="escrow-section__notice escrow-notice--seller">
                            ðŸ“¦ <strong>{'B\u1ea3o v\u1ec7 Ng\u01b0\u1eddi b\u00e1n:'}</strong>{' '}
                            {order.escrowAmount > 0 ? fmt(order.escrowAmount) : 'Ti\u1ec1n'}
                            {' \u0111ang \u0111\u01b0\u1ee3c gi\u1eef an to\u00e0n \u2014 b\u1ea1n s\u1ebd nh\u1eadn \u0111\u01b0\u1ee3c khi giao h\u00e0ng th\u00e0nh c\u00f4ng.'}
                        </div>
                    )}

                    {ef && order.status === 1 && countdown && !countdown.expired && (
                        <div className="escrow-countdown">
                            <span className="escrow-countdown__label">
                                {'â° T\u1ef1 \u0111\u1ed9ng gi\u1ea3i ph\u00f3ng Escrow sau:'}
                            </span>
                            <div className="escrow-countdown__timer">
                                <div className="countdown-unit">
                                    <span className="countdown-value">{countdown.days}</span>
                                    <span className="countdown-label">{'ng\u00e0y'}</span>
                                </div>
                                <span className="countdown-sep">:</span>
                                <div className="countdown-unit">
                                    <span className="countdown-value">{String(countdown.hours).padStart(2,'0')}</span>
                                    <span className="countdown-label">{'gi\u1edd'}</span>
                                </div>
                                <span className="countdown-sep">:</span>
                                <div className="countdown-unit">
                                    <span className="countdown-value">{String(countdown.minutes).padStart(2,'0')}</span>
                                    <span className="countdown-label">{'ph\u00fat'}</span>
                                </div>
                                <span className="countdown-sep">:</span>
                                <div className="countdown-unit">
                                    <span className="countdown-value">{String(countdown.seconds).padStart(2,'0')}</span>
                                    <span className="countdown-label">{'gi\u00e2y'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="escrow-timeline">
                        <div className={'escrow-step' + (order.escrowFrozenAt ? ' step--done' : '')}>
                            <span className="step-dot">ðŸ”’</span>
                            <div>
                                <div className="step-label">{'Ti\u1ec1n \u0111\u00f3ng b\u0103ng'}</div>
                                {order.escrowFrozenAt && <div className="step-time">{fmtDate(order.escrowFrozenAt)}</div>}
                            </div>
                        </div>
                        <div className="step-line" />
                        <div className={'escrow-step' + (order.shippedAt ? ' step--done' : '')}>
                            <span className="step-dot">ðŸ“¦</span>
                            <div>
                                <div className="step-label">{'Giao h\u00e0ng'}</div>
                                {order.shippedAt && <div className="step-time">{fmtDate(order.shippedAt)}</div>}
                            </div>
                        </div>
                        <div className="step-line" />
                        <div className={'escrow-step' + (order.escrowReleasedAt ? ' step--done' : '')}>
                            <span className="step-dot">{erf ? 'ðŸ’¸' : 'âœ…'}</span>
                            <div>
                                <div className="step-label">{erf ? 'Ho\u00e0n ti\u1ec1n' : 'Thanh to\u00e1n'}</div>
                                {order.escrowReleasedAt && <div className="step-time">{fmtDate(order.escrowReleasedAt)}</div>}
                                {order.escrowReleaseReason && (
                                    <div className="step-reason">{RELEASE_REASON[order.escrowReleaseReason] || order.escrowReleaseReason}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="order-card">
                <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ flexShrink: 0 }}>
                        {order.productImage
                            ? <img src={order.productImage} alt={order.productTitle} style={{ width: 128, height: 128, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                            : <div style={{ width: 128, height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: '#f5f5f5', borderRadius: 8 }}>ðŸ“·</div>
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 className="order-title">{order.productTitle}</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                            <span>{'ðŸ‘¤ Ng\u01b0\u1eddi mua: '}<strong>{order.buyerName}</strong></span>
                            <span>{'ðŸ‘¤ Ng\u01b0\u1eddi b\u00e1n: '}<strong>{order.sellerName}</strong></span>
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>ðŸ“… {fmtDate(order.createdAt)}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                            <span className={'status-badge ' + (STATUS_CLS[order.status] || '')}>{order.statusText}</span>
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
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#eff6ff', borderRadius: 8, fontSize: '0.875rem' }}>
                                {order.trackingNumber && <div>{'ðŸ“‹ M\u00e3 v\u1eadn \u0111\u01a1n: '}<strong>{order.trackingNumber}</strong></div>}
                                {order.shippingCarrier && <div>{'ðŸš› \u0110VVC: '}<strong>{order.shippingCarrier}</strong></div>}
                            </div>
                        )}
                        <div className="order-amount" style={{ marginTop: '0.5rem' }}>{fmt(order.amount)}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
                    <Link to={'/auctions/' + order.auctionId}
                        style={{ textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>
                        {'Xem phi\u00ean \u0111\u1ea5u gi\u00e1'}
                    </Link>
                    {isBuyer && order.status === 1 && (
                        <Button variant="primary" onClick={() => setConfirmModal(true)}>{'âœ… X\u00e1c nh\u1eadn \u0111\u00e3 nh\u1eadn h\u00e0ng'}</Button>
                    )}
                    {isBuyer && (order.status === 0 || order.status === 1) && (
                        <Button variant="danger" onClick={() => setCancelModal(true)}>{'H\u1ee7y \u0111\u01a1n'}</Button>
                    )}
                    {isSeller && order.status === 0 && (
                        <Button variant="primary" onClick={() => setShipModal(true)}>{'ðŸšš \u0110\u00e1nh d\u1ea5u \u0111\u00e3 g\u1eedi h\u00e0ng'}</Button>
                    )}
                    {isSeller && (order.status === 0 || order.status === 1) && (
                        <Button variant="secondary" onClick={() => setCancelModal(true)}>{'H\u1ee7y \u0111\u01a1n'}</Button>
                    )}
                    {(isBuyer || isSeller) && order.status !== 3 && order.status !== 4 && (
                        <Button variant="secondary" onClick={() => navigate('/disputes/create/' + order.id)}>{'âš–ï¸ M\u1edf tranh ch\u1ea5p'}</Button>
                    )}
                    {order.status === 4 && (
                        <Button variant="secondary" onClick={() => navigate('/disputes')}>{'ðŸ” Xem tranh ch\u1ea5p'}</Button>
                    )}
                    {isBuyer && order.status === 2 && !order.buyerHasReviewed && (
                        <Button variant="secondary" onClick={() => setReviewModal({ isOpen: true, sellerName: order.sellerName })}>{'â­ \u0110\u00e1nh gi\u00e1 ng\u01b0\u1eddi b\u00e1n'}</Button>
                    )}
                    {isBuyer && order.status === 2 && order.buyerHasReviewed && (
                        <span style={{ padding: '0.5rem 1rem', border: '1px solid #dcfce7', background: '#f0fdf4', color: '#16a34a', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600 }}>
                            {'âœ… \u0110\u00e3 \u0111\u00e1nh gi\u00e1'}
                        </span>
                    )}
                </div>
            </div>

            <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title={'X\u00e1c nh\u1eadn \u0111\u00e3 nh\u1eadn h\u00e0ng'}>
                <div style={{ padding: '0.5rem 0' }}>
                    <div className="escrow-confirm-notice">
                        <p>{'ðŸ’¸ Sau khi x\u00e1c nh\u1eadn:'}</p>
                        <ul>
                            <li>{'âœ… Ti\u1ec1n Escrow gi\u1ea3i ph\u00f3ng cho ng\u01b0\u1eddi b\u00e1n'}</li>
                            <li>{'âœ… Ho\u00e0n t\u1ea5t \u0111\u01a1n h\u00e0ng'}</li>
                            <li>{'âš ï¸ Kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c'}</li>
                        </ul>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <Button variant="primary" onClick={handleConfirmReceived} disabled={processing}>
                            {processing ? '\u0110ang x\u1eed l\u00fd...' : 'âœ… X\u00e1c nh\u1eadn & Gi\u1ea3i ph\u00f3ng ti\u1ec1n'}
                        </Button>
                        <Button variant="secondary" onClick={() => setConfirmModal(false)}>{'Ch\u01b0a, \u0111\u1ee3i \u0111\u00e3'}</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={cancelModal} onClose={() => { setCancelModal(false); setCancelReason(''); }} title={'H\u1ee7y \u0111\u01a1n h\u00e0ng'}>
                <div style={{ padding: '0.5rem 0' }}>
                    <p>{'B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n h\u1ee7y \u0111\u01a1n h\u00e0ng n\u00e0y?'}</p>
                    {order.escrowStatus === 'Frozen' && (
                        <div className="escrow-confirm-notice" style={{ marginTop: '0.5rem' }}>
                            {'ðŸ’¸ Ti\u1ec1n Escrow s\u1ebd \u0111\u01b0\u1ee3c ho\u00e0n tr\u1ea3 v\u1ec1 v\u00ed c\u1ee7a b\u1ea1n.'}
                        </div>
                    )}
                    <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                        placeholder={'L\u00fd do (t\u00f9y ch\u1ecdn)'}
                        style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <Button variant="danger" onClick={handleCancelOrder} disabled={processing}>
                            {processing ? '\u0110ang x\u1eed l\u00fd...' : 'H\u1ee7y & Ho\u00e0n ti\u1ec1n'}
                        </Button>
                        <Button variant="secondary" onClick={() => { setCancelModal(false); setCancelReason(''); }}>{'\u0110\u00f3ng'}</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={shipModal}
                onClose={() => { setShipModal(false); setShipData({ trackingNumber: '', shippingCarrier: '', shippingNote: '' }); }}
                title={'\u0110\u00e1nh d\u1ea5u \u0111\u00e3 g\u1eedi h\u00e0ng'}>
                <div style={{ padding: '0.5rem 0' }}>
                    {order.escrowStatus === 'Frozen' && (
                        <div className="escrow-confirm-notice" style={{ marginBottom: '0.75rem' }}>
                            {'â° Sau khi g\u1eedi, b\u1ed9 \u0111\u1ebfm 7 ng\u00e0y auto-release s\u1ebd b\u1eaft \u0111\u1ea7u.'}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>{'M\u00e3 v\u1eadn \u0111\u01a1n *'}</label>
                        <input type="text" value={shipData.trackingNumber}
                            onChange={(e) => setShipData({ ...shipData, trackingNumber: e.target.value })}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6 }}
                            placeholder="EX123456789" />
                        <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>{'\u0110\u01a1n v\u1ecb v\u1eadn chuy\u1ec3n'}</label>
                        <input type="text" value={shipData.shippingCarrier}
                            onChange={(e) => setShipData({ ...shipData, shippingCarrier: e.target.value })}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6 }}
                            placeholder="GHN, Viettel Post, J&T" />
                        <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>{'Ghi ch\u00fa'}</label>
                        <input type="text" value={shipData.shippingNote}
                            onChange={(e) => setShipData({ ...shipData, shippingNote: e.target.value })}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6 }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <Button variant="primary" onClick={handleShipOrder} disabled={processing || !shipData.trackingNumber.trim()}>
                            {processing ? '\u0110ang x\u1eed l\u00fd...' : 'ðŸšš X\u00e1c nh\u1eadn g\u1eedi h\u00e0ng'}
                        </Button>
                        <Button variant="secondary" onClick={() => setShipModal(false)}>{'H\u1ee7y'}</Button>
                    </div>
                </div>
            </Modal>

            {reviewModal.isOpen && (
                <ReviewModal
                    isOpen={reviewModal.isOpen}
                    onClose={() => setReviewModal({ isOpen: false, sellerName: '' })}
                    orderId={id}
                    targetName={reviewModal.sellerName}
                    targetRole={'ng\u01b0\u1eddi b\u00e1n'}
                    onSuccess={() => { setReviewModal({ isOpen: false, sellerName: '' }); loadOrder(); }}
                />
            )}
        </div>
    );
}

export default OrderDetail;