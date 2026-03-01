import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { auctionService } from '../services/auctionService';
import { bidService } from '../services/bidService';
import { watchlistService } from '../services/watchlistService';
import { signalRService } from '../services/signalRService';
import ImageGallery from '../components/auction/ImageGallery';
import CountdownTimer from '../components/auction/CountdownTimer';
import BidHistory from '../components/auction/BidHistory';
import BidForm from '../components/auction/BidForm';
import SellerInfo from '../components/auction/SellerInfo';
import OnlineViewers from '../components/auction/OnlineViewers';
import BuyoutButton from '../components/auction/BuyoutButton';
import SellerActions from '../components/auction/SellerActions';
import WinnerCelebration from '../components/auction/WinnerCelebration';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversation } = useChat();

  // Data states
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [isWatching, setIsWatching] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bidding states
  const [bidding, setBidding] = useState(false);

  // Buyout states
  const [buyouting, setBuyouting] = useState(false);

  // Seller actions states
  const [processingAction, setProcessingAction] = useState(false);

  // Winner celebration
  const [showCelebration, setShowCelebration] = useState(false);
  const [winningAmount, setWinningAmount] = useState(0);

  // SignalR states
  const [viewerCount, setViewerCount] = useState(0);
  const [connectionState, setConnectionState] = useState('Disconnected');

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const initializeSignalR = async () => {
      try {
        // Start SignalR connection
        await signalRService.startConnection();
        setConnectionState(signalRService.getConnectionState());

        // Join this auction's room
        await signalRService.joinAuction(id);

        // Setup event handlers
        signalRService.on('UpdateBid', handleBidUpdate);
        signalRService.on('ViewerCountUpdated', handleViewerCountUpdate);
        signalRService.on('UserOutbid', handleUserOutbid);
        signalRService.on('EndingSoon', handleEndingSoon);
        signalRService.on('AuctionEnded', handleAuctionEnded);
        signalRService.on('TimeExtended', handleTimeExtended);
        signalRService.on('AuctionAccepted', handleAuctionAccepted);
        signalRService.on('AuctionBuyout', handleAuctionBuyout);
        signalRService.on('AuctionCancelled', handleAuctionCancelled);
        signalRService.on('Reconnecting', () => setConnectionState('Reconnecting'));
        signalRService.on('Reconnected', async () => {
          setConnectionState('Connected');
          toast.info('Đã kết nối lại với server');
          await signalRService.joinAuction(id);
        });
        signalRService.on('Disconnected', () => {
          setConnectionState('Disconnected');
          toast.warning('Mất kết nối với server');
        });
      } catch (err) {
        console.error('SignalR initialization error:', err);
        toast.error('Không thể kết nối realtime. Vui lòng tải lại trang.');
      }
    };

    initializeSignalR();

    // Cleanup
    return () => {
      signalRService.leaveAuction(id);
      signalRService.off('UpdateBid');
      signalRService.off('ViewerCountUpdated');
      signalRService.off('UserOutbid');
      signalRService.off('EndingSoon');
      signalRService.off('AuctionEnded');
      signalRService.off('TimeExtended');
      signalRService.off('AuctionAccepted');
      signalRService.off('AuctionBuyout');
      signalRService.off('AuctionCancelled');
      signalRService.off('Reconnecting');
      signalRService.off('Reconnected');
      signalRService.off('Disconnected');
    };
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [auctionData, bidsData, watchlistData] = await Promise.all([
        auctionService.getAuctionById(id),
        bidService.getBidsByAuction(id),
        user ? watchlistService.getMyWatchlist().catch(() => []) : Promise.resolve([]),
      ]);

      // Backend now handles auto-activation automatically
      setAuction(auctionData);
      setBids(bidsData);

      if (user) {
        const watchlistItem = watchlistData.find(item => item.auctionId === id);
        setIsWatching(!!watchlistItem);
        setWatchlistId(watchlistItem?.id);
      }

      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu đấu giá');
      toast.error(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  // SignalR Event Handlers
  const handleBidUpdate = (data) => {
    console.log('Bid update received:', data);

    // Support both PascalCase and camelCase from server
    const rawBid = data.Bid ?? data.bid;
    const currentPriceFromPayload = data.CurrentPrice ?? data.currentPrice;
    // Derive current price from new bid if server didn't send it (keeps UI in sync)
    const currentPrice = currentPriceFromPayload != null
      ? currentPriceFromPayload
      : (rawBid && (rawBid.amount ?? rawBid.Amount));
    const bidCount = data.BidCount ?? data.bidCount;

    // Update auction current price
    if (auction && (currentPrice != null || bidCount != null)) {
      setAuction(prev => ({
        ...prev,
        ...(currentPrice != null && { currentPrice: Number(currentPrice) }),
        ...(bidCount != null && { bidCount: bidCount ?? prev.bidCount }),
      }));
    }

    // Update bids list (normalize bid to camelCase for rest of app)
    if (rawBid) {
      const bid = {
        id: rawBid.id ?? rawBid.Id,
        auctionId: rawBid.auctionId ?? rawBid.AuctionId,
        userId: rawBid.userId ?? rawBid.UserId,
        userName: rawBid.userName ?? rawBid.UserName,
        amount: rawBid.amount ?? rawBid.Amount,
        timestamp: rawBid.timestamp ?? rawBid.Timestamp,
        isWinningBid: rawBid.isWinningBid ?? rawBid.IsWinningBid,
        createdAt: rawBid.createdAt ?? rawBid.CreatedAt,
        autoBid: rawBid.autoBid ?? rawBid.AutoBid,
      };
      setBids(prev => [bid, ...prev]);

      // Show toast notification (only for bids from other users)
      if (bid.userId !== user?.id && bid.amount != null) {
        toast.info(`${bid.userName ?? 'Người dùng'} đã đặt giá ${Number(bid.amount).toLocaleString('vi-VN')} VND`, {
          autoClose: 3000,
        });
      }
    }
  };

  const handleViewerCountUpdate = (data) => {
    const count = data?.ViewerCount ?? data?.viewerCount ?? 0;
    setViewerCount(Number(count));
  };

  const handleUserOutbid = (data) => {
    const bidderName = data?.BidderName ?? data?.bidderName ?? 'Người khác';
    const newBid = data?.NewBid ?? data?.newBid;
    const str = newBid != null ? Number(newBid).toLocaleString('vi-VN') : '—';
    toast.warning(
      `⚠️ Bạn đã bị vượt giá! ${bidderName} đã đặt ${str} VND`,
      {
        position: 'top-center',
        autoClose: 5000,
        className: 'bg-red-50 border-2 border-red-500',
      }
    );
  };

  const handleEndingSoon = (data) => {
    const title = data?.AuctionTitle ?? data?.auctionTitle ?? 'Đấu giá này';
    const timeRemaining = data?.TimeRemaining ?? data?.timeRemaining ?? 'ít hơn 1 giờ';
    const currentPrice = data?.CurrentPrice ?? data?.currentPrice;
    const msg = currentPrice
      ? `⏰ ${title} sắp kết thúc (còn ${timeRemaining}). Giá hiện tại: ${currentPrice}`
      : `⏰ ${title} sắp kết thúc (còn ${timeRemaining})`;
    toast.info(msg, { autoClose: 8000 });
  };

  const handleAuctionEnded = (data) => {
    toast.info('🏁 Đấu giá đã kết thúc!');
    setAuction(prev => ({ ...prev, status: 3 }));
  };

  const handleTimeExtended = (data) => {
    const minutes = data?.ExtendedMinutes ?? data?.extendedMinutes ?? 0;
    const newEndTime = data?.NewEndTime ?? data?.newEndTime;
    toast.info(`⏰ Thời gian đấu giá đã được gia hạn thêm ${minutes} phút`);
    if (newEndTime != null) setAuction(prev => ({ ...prev, endTime: newEndTime }));
  };

  const handleAuctionAccepted = (data) => {
    const winnerId = data?.WinnerId ?? data?.winnerId;
    const winningBid = data?.WinningBid ?? data?.winningBid;
    const winnerName = data?.WinnerName ?? data?.winnerName ?? 'Người thắng';
    setAuction(prev => ({ ...prev, status: 3, winnerId, endReason: 'accepted' }));

    const bidStr = winningBid != null ? Number(winningBid).toLocaleString('vi-VN') : '—';
    if (user?.id === winnerId) {
      setWinningAmount(winningBid ?? 0);
      setShowCelebration(true);
      toast.success('🎉 Chúc mừng! Bạn đã thắng đấu giá!');
    } else if (user?.id === auction?.sellerId) {
      toast.success(`✅ Đã chấp nhận giá ${bidStr} VND từ ${winnerName}`);
    } else {
      toast.info(`Đấu giá đã kết thúc - Seller chấp nhận giá ${bidStr} VND`);
    }
  };

  const handleAuctionBuyout = (data) => {
    const buyerId = data?.BuyerId ?? data?.buyerId;
    const buyoutPrice = data?.BuyoutPrice ?? data?.buyoutPrice;
    const buyerName = data?.BuyerName ?? data?.buyerName ?? 'Người mua';
    setAuction(prev => ({ ...prev, status: 3, winnerId: buyerId, endReason: 'buyout' }));

    const priceStr = buyoutPrice != null ? Number(buyoutPrice).toLocaleString('vi-VN') : '—';
    if (user?.id === buyerId) {
      setWinningAmount(buyoutPrice ?? 0);
      setShowCelebration(true);
      toast.success('🎉 Mua ngay thành công! Bạn đã sở hữu sản phẩm!');
    } else {
      toast.info(`⚡ ${buyerName} đã mua ngay với giá ${priceStr} VND`);
    }
  };

  const handleAuctionCancelled = (data) => {
    const reason = data?.Reason ?? data?.reason ?? 'Đã hủy';
    setAuction(prev => ({ ...prev, status: 4, endReason: 'cancelled' }));
    toast.warning(`❌ Đấu giá đã bị hủy: ${reason}`);
  };

  // Bid Submission
  const handleBidSubmit = async (amount) => {
    try {
      setBidding(true);
      await bidService.createBid({
        auctionId: id,
        amount: amount,
      });

      toast.success('✅ Đặt giá thành công!');

      // Don't reload data here - SignalR will update it
    } catch (err) {
      const status = err.status ?? err.response?.status;
      const message = err.message || 'Đặt giá thất bại';
      if (status === 429) {
        toast.warning(message || 'Vui lòng đợi 2 giây trước khi đặt giá lại.');
      } else if (status === 409 || (status === 400 && (message.includes('Giá') || message.includes('giá')))) {
        toast.warning(message);
        loadData();
      } else {
        toast.error(message);
      }
      throw err;
    } finally {
      setBidding(false);
    }
  };

  // Watchlist Toggle
  const handleWatchlist = async () => {
    try {
      if (isWatching) {
        await watchlistService.removeFromWatchlist(watchlistId);
        setIsWatching(false);
        setWatchlistId(null);
        toast.success('Đã xóa khỏi danh sách theo dõi');
      } else {
        const result = await watchlistService.addToWatchlist(id);
        setIsWatching(true);
        setWatchlistId(result.id);
        toast.success('Đã thêm vào danh sách theo dõi');
      }
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    }
  };

  // Buyout Handler
  const handleBuyout = async () => {
    try {
      setBuyouting(true);
      await auctionService.buyout(id);
      toast.success('⚡ Mua ngay thành công!');
      // SignalR will update the UI
    } catch (err) {
      toast.error(err.message || 'Mua ngay thất bại');
    } finally {
      setBuyouting(false);
    }
  };

  // Seller Actions
  const handleAcceptBid = async (message) => {
    try {
      setProcessingAction(true);
      await auctionService.acceptBid(id, message);
      toast.success('✅ Đã chấp nhận giá hiện tại!');
      // SignalR will update the UI
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
      throw err;
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancelAuction = async () => {
    try {
      setProcessingAction(true);
      await auctionService.cancelAuction(id);
      toast.success('Đã hủy đấu giá');
      // SignalR will update the UI
    } catch (err) {
      toast.error(err.message || 'Hủy đấu giá thất bại');
      throw err;
    } finally {
      setProcessingAction(false);
    }
  };

  // Loading & Error States
  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;
  if (!auction) return <Alert type="error" message="Không tìm thấy đấu giá" />;

  // Computed values – derive current price from bid history so it stays in sync with realtime updates
  const effectiveCurrentPrice = (bids.length > 0 && (bids[0].amount != null || bids[0].Amount != null))
    ? Number(bids[0].amount ?? bids[0].Amount)
    : (auction.currentPrice ?? auction.startingPrice);
  const canBid = user && auction.status === 1 && auction.sellerId !== user.id;
  const isOwner = user && auction.sellerId === user.id;
  const userIsWinning = user && bids.length > 0 && bids[0]?.userId === user.id;
  const hasBuyoutPrice = auction.buyoutPrice && auction.buyoutPrice > 0;
  const canBuyout = canBid && hasBuyoutPrice;

  const statusNames = ['Nháp', 'Đang diễn ra', 'Chờ xử lý', 'Hoàn thành', 'Đã hủy'];
  const conditionNames = ['Mới', 'Như mới', 'Đã sử dụng', 'Tạm được', 'Kém'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Connection Status Banner */}
        {connectionState === 'Reconnecting' && (
          <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Đang kết nối lại...</span>
          </div>
        )}

        {/* Header with Online Viewers */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 shadow-sm transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>

          <OnlineViewers viewerCount={viewerCount} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <ImageGallery images={auction.images} title={auction.title} />
            </Card>

            {/* Title, Description, Status */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-bold text-text-primary">{auction.title}</h1>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${auction.status === 1
                      ? 'bg-green-100 text-green-800'
                      : auction.status === 3
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {statusNames[auction.status]}
                  </span>
                </div>

                {auction.categoryName && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium">{auction.categoryName}</span>
                  </div>
                )}

                {auction.description && (
                  <div className="pt-4 border-t border-border-primary">
                    <h3 className="font-semibold text-text-primary mb-2">Mô tả</h3>
                    <p className="text-text-secondary whitespace-pre-wrap">{auction.description}</p>
                  </div>
                )}

                {user && (
                  <div className="pt-4">
                    <Button
                      variant={isWatching ? 'danger' : 'outline'}
                      onClick={handleWatchlist}
                      className="w-full sm:w-auto"
                    >
                      {isWatching ? '❌ Xóa khỏi danh sách theo dõi' : '⭐ Thêm vào danh sách theo dõi'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Product Details */}
            {auction.product && (
              <Card>
                <h2 className="text-xl font-semibold text-text-primary mb-4">Chi tiết sản phẩm</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-text-secondary">Tên sản phẩm:</span>
                    <p className="font-semibold text-text-primary">{auction.product.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Tình trạng:</span>
                    <p className="font-semibold text-text-primary">
                      {conditionNames[auction.product.condition]}
                    </p>
                  </div>
                  {auction.product.brand && (
                    <div>
                      <span className="text-sm text-text-secondary">Thương hiệu:</span>
                      <p className="font-semibold text-text-primary">{auction.product.brand}</p>
                    </div>
                  )}
                  {auction.product.model && (
                    <div>
                      <span className="text-sm text-text-secondary">Model:</span>
                      <p className="font-semibold text-text-primary">{auction.product.model}</p>
                    </div>
                  )}
                  {auction.product.year && (
                    <div>
                      <span className="text-sm text-text-secondary">Năm sản xuất:</span>
                      <p className="font-semibold text-text-primary">{auction.product.year}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Bid History */}
            <BidHistory bids={bids} highlightNewBid={true} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Countdown Timer */}
            <CountdownTimer
              startTime={auction.startTime}
              endTime={auction.endTime}
              status={auction.status}
            />

            {/* Price Info & Bid Form — Premium Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Gradient price header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
                <p className="text-blue-100 text-[11px] font-bold uppercase tracking-wider mb-0.5">Giá hiện tại</p>
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  {effectiveCurrentPrice.toLocaleString('vi-VN')}
                  <span className="text-xl ml-1">₫</span>
                </p>
              </div>

              <div className="p-5 space-y-4">
                {/* Price details grid */}
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Giá khởi điểm', value: `${auction.startingPrice.toLocaleString('vi-VN')} ₫`, cls: 'text-gray-800' },
                    auction.reservePrice ? { label: 'Giá dự trữ', value: `${auction.reservePrice.toLocaleString('vi-VN')} ₫`, cls: 'text-gray-800' } : null,
                    { label: 'Bước giá', value: `${auction.bidIncrement.toLocaleString('vi-VN')} ₫`, cls: 'text-emerald-600 font-bold' },
                    { label: 'Lượt đặt giá', value: `${auction.bidCount || bids.length} lượt`, cls: 'text-gray-800' },
                  ].filter(Boolean).map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{row.label}</span>
                      <span className={`font-semibold ${row.cls}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Winning Status */}
                {userIsWinning && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-1">👑</p>
                    <p className="font-bold text-emerald-800">Bạn đang thắng!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Giá của bạn là cao nhất hiện tại</p>
                  </div>
                )}

                {/* Buyout Button */}
                {canBuyout && (
                  <BuyoutButton
                    buyoutPrice={auction.buyoutPrice}
                    currentPrice={effectiveCurrentPrice}
                    onBuyout={handleBuyout}
                    isSubmitting={buyouting}
                  />
                )}

                {/* Bid Form or Login Prompt */}
                {canBid ? (
                  <BidForm
                    currentPrice={effectiveCurrentPrice}
                    bidIncrement={auction.bidIncrement}
                    onSubmit={handleBidSubmit}
                    isSubmitting={bidding}
                    isOwner={isOwner}
                    isActive={auction.status === 1}
                    userIsWinning={userIsWinning}
                  />
                ) : !user ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 text-center">Đăng nhập để tham gia đấu giá</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                    >
                      Đăng nhập
                    </button>
                  </div>
                ) : null}

                {/* Chat with Seller Button */}
                {user && auction.sellerId !== user.id && (
                  <button
                    className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      const sellerUser = {
                        id: auction.sellerId,
                        firstName: auction.seller?.firstName || (auction.sellerName ? auction.sellerName.split(' ').slice(0, -1).join(' ') : 'Người'),
                        lastName: auction.seller?.lastName || (auction.sellerName ? auction.sellerName.split(' ').slice(-1).join(' ') : 'Bán')
                      };
                      startConversation(sellerUser, auction.id);
                    }}
                  >
                    💬 Chat với người bán
                  </button>
                )}
              </div>
            </div>

            {/* Seller Actions (if owner) */}
            {isOwner && (
              <SellerActions
                auction={auction}
                bids={bids}
                onAcceptBid={handleAcceptBid}
                onCancel={handleCancelAuction}
                isProcessing={processingAction}
              />
            )}

            {/* Seller Info (if not owner) */}
            {!isOwner && (
              <SellerInfo sellerId={auction.sellerId} sellerName={auction.sellerName} />
            )}
          </div>
        </div>
      </div>

      {/* Winner Celebration Modal */}
      <WinnerCelebration
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
        amount={winningAmount}
      />
    </div>
  );
};

export default AuctionDetail;
