import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auctionService } from '../services/auctionService';
import { bidService } from '../services/bidService';
import { watchlistService } from '../services/watchlistService';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [isWatching, setIsWatching] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [auctionData, bidsData, watchlistData] = await Promise.all([
        auctionService.getAuctionById(id),
        bidService.getBidsByAuction(id),
        watchlistService.getMyWatchlist().catch(() => []),
      ]);
      setAuction(auctionData);
      setBids(bidsData);
      const watchlistItem = watchlistData.find(item => item.auctionId === id);
      setIsWatching(!!watchlistItem);
      setWatchlistId(watchlistItem?.id);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    try {
      setBidding(true);
      await bidService.createBid({
        auctionId: id,
        amount: parseFloat(bidAmount),
      });
      setBidAmount('');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setBidding(false);
    }
  };

  const handleWatchlist = async () => {
    try {
      if (isWatching) {
        await watchlistService.removeFromWatchlist(watchlistId);
        setIsWatching(false);
        setWatchlistId(null);
      } else {
        const result = await watchlistService.addToWatchlist(id);
        setIsWatching(true);
        setWatchlistId(result.id);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;
  if (!auction) return <Alert type="error" message="Không tìm thấy đấu giá" />;

  const canBid = user && auction.status === 1 && auction.sellerId !== user.id;
  const statusNames = ['Nháp', 'Đang diễn ra', 'Chờ xử lý', 'Hoàn thành', 'Đã hủy'];

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="space-y-6">
                {auction.images && auction.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {auction.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${auction.title} - Image ${idx + 1}`}
                        className="w-full h-64 object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-4">{auction.title}</h1>
                  <p className="text-text-secondary mb-4">{auction.description}</p>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      auction.status === 1 ? 'bg-green-100 text-green-800' :
                      auction.status === 3 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {statusNames[auction.status]}
                    </span>
                    {user && (
                      <Button
                        variant={isWatching ? 'danger' : 'outline'}
                        onClick={handleWatchlist}
                      >
                        {isWatching ? 'Xóa khỏi danh sách theo dõi' : 'Thêm vào danh sách theo dõi'}
                      </Button>
                    )}
                  </div>
                </div>
                {auction.product && (
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-2">Chi tiết sản phẩm</h2>
                    <div className="space-y-2 text-text-secondary">
                      <p><strong>Tên:</strong> {auction.product.name}</p>
                      <p><strong>Tình trạng:</strong> {['Mới', 'Như mới', 'Đã sử dụng', 'Tạm được', 'Kém'][auction.product.condition]}</p>
                      {auction.product.brand && <p><strong>Thương hiệu:</strong> {auction.product.brand}</p>}
                      {auction.product.model && <p><strong>Model:</strong> {auction.product.model}</p>}
                      {auction.product.year && <p><strong>Năm:</strong> {auction.product.year}</p>}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-text-primary mb-4">Lịch sử đấu giá</h2>
              <div className="space-y-2">
                {bids.map((bid) => (
                  <div key={bid.id} className="flex items-center justify-between p-3 bg-background-primary rounded">
                    <div>
                      <p className="text-text-primary font-semibold">
                        {bid.amount.toLocaleString('vi-VN')} VND
                      </p>
                      <p className="text-text-secondary text-sm">
                        bởi {bid.userName || 'Ẩn danh'} • {new Date(bid.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {bid.isWinningBid && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        Đang thắng
                      </span>
                    )}
                  </div>
                ))}
                {bids.length === 0 && (
                  <p className="text-text-secondary text-center py-4">Chưa có lượt đấu giá nào</p>
                )}
              </div>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <div className="space-y-6">
                <div>
                  <p className="text-text-secondary text-sm mb-1">Giá hiện tại</p>
                  <p className="text-4xl font-bold text-primary">
                    {auction.currentPrice.toLocaleString('vi-VN')} VND
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Giá khởi điểm:</span>
                    <span className="text-text-primary">{auction.startingPrice.toLocaleString('vi-VN')} VND</span>
                  </div>
                  {auction.reservePrice && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Giá dự trữ:</span>
                      <span className="text-text-primary">{auction.reservePrice.toLocaleString('vi-VN')} VND</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Bước giá:</span>
                    <span className="text-text-primary">{auction.bidIncrement.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Số lượt đấu giá:</span>
                    <span className="text-text-primary">{auction.bidCount || bids.length}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border-primary">
                  <p className="text-text-secondary text-sm mb-2">Thời gian còn lại</p>
                  <p className="text-text-primary font-semibold">
                    {new Date(auction.endTime).toLocaleString('vi-VN')}
                  </p>
                </div>
                {canBid && (
                  <form onSubmit={handleBid} className="pt-4 border-t border-border-primary">
                    <Input
                      label="Your Bid"
                      type="number"
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Tối thiểu: ${(auction.currentPrice + auction.bidIncrement).toLocaleString('vi-VN')} VND`}
                      required
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full mt-4"
                      disabled={bidding}
                    >
                      {bidding ? 'Đang đấu giá...' : 'Đấu giá'}
                    </Button>
                  </form>
                )}
                {!user && (
                  <div className="pt-4 border-t border-border-primary">
                    <p className="text-text-secondary text-sm mb-2">Muốn đấu giá?</p>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => navigate('/login')}
                    >
                      Đăng nhập để đấu giá
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
import { useParams } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { signalRService } from '../services/signalRService';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

function AuctionDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        loadAuction();

        // Setup Real-time
        const setupSignalR = async () => {
            await signalRService.startConnection();
            await signalRService.joinAuction(id);

            signalRService.on('UpdateBid', (data) => {
                console.log('Bid Update:', data);
                setAuction(prev => ({
                    ...prev,
                    currentPrice: data.currentPrice,
                    winnerId: data.winnerId, // masked or ID depending on backend
                    endTime: data.endTime || prev.endTime
                }));
                toast.info(`New highest bid: ${data.currentPrice.toLocaleString()} VND`);
            });

            signalRService.on('AuctionEnded', (data) => {
                setAuction(prev => ({ ...prev, status: data.status }));
                toast.info('Auction ended!');
            });

            signalRService.on('TimeExtended', (data) => {
                setAuction(prev => ({ ...prev, endTime: data.newEndTime }));
                toast.warning('Auction time extended by 2 minutes!');
            });
        };

        setupSignalR();

        return () => {
            signalRService.leaveAuction(id);
            signalRService.off('UpdateBid');
            signalRService.off('AuctionEnded');
            signalRService.off('TimeExtended');
        };
    }, [id]);

    useEffect(() => {
        // Timer logic
        if (!auction?.endTime) return;

        const timer = setInterval(() => {
            const end = new Date(auction.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft('ENDED');
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, [auction]);

    const loadAuction = async () => {
        try {
            const data = await auctionService.getAuctionById(id);
            setAuction(data);
            if (data) {
                // Suggest next bid
                const step = data.stepPrice?.$numberDecimal ? parseFloat(data.stepPrice.$numberDecimal) : data.stepPrice;
                const current = data.currentPrice?.$numberDecimal ? parseFloat(data.currentPrice.$numberDecimal) : data.currentPrice || data.startPrice; // Handle decimal128 from Mongo

                // Helper to parse Decimal128 or number
                const parseMoney = (val) => val?.$numberDecimal ? parseFloat(val.$numberDecimal) : (val || 0);

                const nextMin = parseMoney(data.currentPrice) > 0
                    ? parseMoney(data.currentPrice) + parseMoney(data.stepPrice)
                    : parseMoney(data.startPrice);

                setBidAmount(nextMin);
            }
        } catch (err) {
            toast.error('Failed to load auction');
        } finally {
            setLoading(false);
        }
    };

    const handleBid = async () => {
        if (!user) {
            toast.error('Please login to bid');
            return;
        }
        try {
            await auctionService.placeBid(id, bidAmount);
            toast.success('Bid placed successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to place bid');
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!auction) return <div className="text-center py-10">Auction not found</div>;

    // Helper to parse Decimal128
    const parseMoney = (val) => val?.$numberDecimal ? parseFloat(val.$numberDecimal) : (val || 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="h-96 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                        {auction.imageUrls && auction.imageUrls.length > 0 ? (
                            <img src={auction.imageUrls[0]} alt={auction.title} className="max-h-full max-w-full object-contain" />
                        ) : (
                            <span className="text-gray-400">No Image</span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-gray-800">{auction.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                    ${auction.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {auction.status}
                        </span>
                    </div>

                    <p className="text-gray-600 mb-6">{auction.description}</p>

                    <div className="border-t border-b border-gray-100 py-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Current Price</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {parseMoney(auction.currentPrice).toLocaleString()} VND
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Time Left</p>
                                <p className="text-2xl font-bold text-red-500">{timeLeft}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Start Price</p>
                                <p className="font-medium">{parseMoney(auction.startPrice).toLocaleString()} VND</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Step Price</p>
                                <p className="font-medium">{parseMoney(auction.stepPrice).toLocaleString()} VND</p>
                            </div>
                        </div>
                    </div>

                    {/* Bidding Section */}
                    {auction.status === 'Active' && timeLeft !== 'ENDED' ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Place your bid</label>
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(Number(e.target.value))}
                                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleBid}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                                    disabled={!user}
                                >
                                    Place Bid
                                </button>
                            </div>
                            {!user && <p className="text-sm text-red-500 mt-2">Login to bid</p>}
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
                            Bidding has ended
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuctionDetail;
