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
        signalRService.on('AuctionEnded', handleAuctionEnded);
        signalRService.on('TimeExtended', handleTimeExtended);
        signalRService.on('AuctionAccepted', handleAuctionAccepted);
        signalRService.on('AuctionBuyout', handleAuctionBuyout);
        signalRService.on('AuctionCancelled', handleAuctionCancelled);
        signalRService.on('Reconnecting', () => setConnectionState('Reconnecting'));
        signalRService.on('Reconnected', () => {
          setConnectionState('Connected');
          toast.info('Đã kết nối lại với server');
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

    // Update auction current price
    if (auction && data.CurrentPrice) {
      setAuction(prev => ({
        ...prev,
        currentPrice: data.CurrentPrice,
        bidCount: data.BidCount || prev.bidCount
      }));
    }

    // Update bids list
    if (data.Bid) {
      setBids(prev => [data.Bid, ...prev]);
    }

    // Show toast notification
    if (data.Bid && data.Bid.userId !== user?.id) {
      toast.info(`${data.Bid.userName} đã đặt giá ${data.Bid.amount.toLocaleString('vi-VN')} VND`, {
        autoClose: 3000,
      });
    }
  };

  const handleViewerCountUpdate = (data) => {
    setViewerCount(data.ViewerCount || 0);
  };

  const handleUserOutbid = (data) => {
    toast.warning(
      `⚠️ Bạn đã bị vượt giá! ${data.BidderName} đã đặt ${data.NewBid.toLocaleString('vi-VN')} VND`,
      {
        position: 'top-center',
        autoClose: 5000,
        className: 'bg-red-50 border-2 border-red-500',
      }
    );

    // Play notification sound (optional)
    // new Audio('/notification.mp3').play().catch(() => {});
  };

  const handleAuctionEnded = (data) => {
    toast.info('🏁 Đấu giá đã kết thúc!');
    setAuction(prev => ({ ...prev, status: 3 }));
  };

  const handleTimeExtended = (data) => {
    toast.info(`⏰ Thời gian đấu giá đã được gia hạn thêm ${data.ExtendedMinutes} phút`);
    setAuction(prev => ({ ...prev, endTime: data.NewEndTime }));
  };

  const handleAuctionAccepted = (data) => {
    setAuction(prev => ({ ...prev, status: 3, winnerId: data.WinnerId, endReason: 'accepted' }));

    if (user?.id === data.WinnerId) {
      // Current user is winner
      setWinningAmount(data.WinningBid);
      setShowCelebration(true);
      toast.success('🎉 Chúc mừng! Bạn đã thắng đấu giá!');
    } else if (user?.id === auction.sellerId) {
      // Current user is seller
      toast.success(`✅ Đã chấp nhận giá ${data.WinningBid.toLocaleString('vi-VN')} VND từ ${data.WinnerName}`);
    } else {
      // Other bidders
      toast.info(`Đấu giá đã kết thúc - Seller chấp nhận giá ${data.WinningBid.toLocaleString('vi-VN')} VND`);
    }
  };

  const handleAuctionBuyout = (data) => {
    setAuction(prev => ({ ...prev, status: 3, winnerId: data.BuyerId, endReason: 'buyout' }));

    if (user?.id === data.BuyerId) {
      // Current user is buyer
      setWinningAmount(data.BuyoutPrice);
      setShowCelebration(true);
      toast.success('🎉 Mua ngay thành công! Bạn đã sở hữu sản phẩm!');
    } else {
      toast.info(`⚡ ${data.BuyerName} đã mua ngay với giá ${data.BuyoutPrice.toLocaleString('vi-VN')} VND`);
    }
  };

  const handleAuctionCancelled = (data) => {
    setAuction(prev => ({ ...prev, status: 4, endReason: 'cancelled' }));
    toast.warning(`❌ Đấu giá đã bị hủy: ${data.Reason}`);
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
      toast.error(err.message || 'Đặt giá thất bại');
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

  // Computed values
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
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
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

            {/* Price Info & Bid Form */}
            <Card>
              <div className="space-y-6">
                {/* Current Price */}
                <div>
                  <p className="text-sm text-text-secondary mb-1">Giá hiện tại</p>
                  <p className="text-4xl font-bold text-primary">
                    {auction.currentPrice.toLocaleString('vi-VN')} ₫
                  </p>
                </div>

                {/* Price Details */}
                <div className="space-y-2 text-sm border-t border-b border-border-primary py-4">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Giá khởi điểm:</span>
                    <span className="font-semibold text-text-primary">
                      {auction.startingPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  {auction.reservePrice && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Giá dự trữ:</span>
                      <span className="font-semibold text-text-primary">
                        {auction.reservePrice.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Bước giá:</span>
                    <span className="font-semibold text-green-600">
                      {auction.bidIncrement.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Số lượt đấu giá:</span>
                    <span className="font-semibold text-text-primary">{auction.bidCount || bids.length}</span>
                  </div>
                </div>

                {/* Winning Status */}
                {userIsWinning && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg p-4 text-center">
                    <p className="text-2xl mb-2">👑</p>
                    <p className="font-bold text-green-800">Bạn đang thắng!</p>
                    <p className="text-sm text-green-600 mt-1">Giá của bạn là cao nhất hiện tại</p>
                  </div>
                )}

                {/* Buyout Button */}
                {canBuyout && (
                  <BuyoutButton
                    buyoutPrice={auction.buyoutPrice}
                    currentPrice={auction.currentPrice}
                    onBuyout={handleBuyout}
                    isSubmitting={buyouting}
                  />
                )}

                {/* Bid Form or Login Prompt */}
                {canBid ? (
                  <BidForm
                    currentPrice={auction.currentPrice}
                    bidIncrement={auction.bidIncrement}
                    onSubmit={handleBidSubmit}
                    isSubmitting={bidding}
                    isOwner={isOwner}
                    isActive={auction.status === 1}
                    userIsWinning={userIsWinning}
                  />
                ) : !user ? (
                  <div className="pt-4 border-t border-border-primary">
                    <p className="text-sm text-text-secondary mb-3 text-center">
                      Đăng nhập để tham gia đấu giá
                    </p>
                    <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
                      Đăng nhập
                    </Button>
                  </div>
                ) : null}

                {/* Chat with Seller Button */}
                {user && auction.sellerId !== user.id && (
                  <div className="pt-4 border-t border-border-primary">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const sellerUser = {
                          id: auction.sellerId,
                          firstName: auction.seller?.firstName || (auction.sellerName ? auction.sellerName.split(' ').slice(0, -1).join(' ') : 'Người'),
                          lastName: auction.seller?.lastName || (auction.sellerName ? auction.sellerName.split(' ').slice(-1).join(' ') : 'Bán')
                        };
                        startConversation(sellerUser, auction.id);
                      }}
                    >
                      Chat với người bán
                    </Button>
                  </div>
                )}
              </div>
            </Card>

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
