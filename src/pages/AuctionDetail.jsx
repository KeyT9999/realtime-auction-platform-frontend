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

export default AuctionDetail;
