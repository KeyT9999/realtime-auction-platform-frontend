import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { auctionService } from '../services/auctionService';
import { bidService } from '../services/bidService';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const MyAuctions = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [auctionBids, setAuctionBids] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAuctions({ sellerId: user?.id });
      // API returns {items, totalCount, page...} or array
      const auctionList = data.items || data;
      setAuctions(auctionList);
      
      // Load bids for each auction
      const bidsPromises = auctionList.map(async (auction) => {
        try {
          const bids = await bidService.getBidsByAuction(auction.id);
          return { [auction.id]: bids };
        } catch {
          return { [auction.id]: [] };
        }
      });
      
      const bidsResults = await Promise.all(bidsPromises);
      const bidsMap = Object.assign({}, ...bidsResults);
      setAuctionBids(bidsMap);
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đấu giá này?')) {
      return;
    }
    try {
      await auctionService.deleteAuction(id);
      toast.success('Đã xóa đấu giá');
      loadAuctions();
    } catch (err) {
      toast.error(err.message || 'Xóa thất bại');
    }
  };

  const handleAcceptBid = async (auctionId) => {
    if (!window.confirm('Bạn có chắc muốn chấp nhận giá hiện tại và kết thúc đấu giá?')) {
      return;
    }
    try {
      setProcessingId(auctionId);
      await auctionService.acceptBid(auctionId);
      toast.success('✅ Đã chấp nhận giá!');
      loadAuctions();
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelAuction = async (auctionId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đấu giá này?')) {
      return;
    }
    try {
      setProcessingId(auctionId);
      await auctionService.cancelAuction(auctionId);
      toast.success('Đã hủy đấu giá');
      loadAuctions();
    } catch (err) {
      toast.error(err.message || 'Hủy thất bại');
    } finally {
      setProcessingId(null);
    }
  };

  const canAcceptBid = (auction) => {
    const bids = auctionBids[auction.id] || [];
    const hasBids = bids.length > 0;
    const meetsReserve = !auction.reservePrice || auction.currentPrice >= auction.reservePrice;
    return auction.status === 1 && hasBids && meetsReserve;
  };

  const canCancel = (auction) => {
    const bids = auctionBids[auction.id] || [];
    return auction.status === 0 || (auction.status === 1 && bids.length === 0);
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Đấu giá của tôi</h1>
          <Link to="/create-auction">
            <Button variant="primary">Tạo đấu giá mới</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <Card key={auction.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {auction.images && auction.images.length > 0 && (
                  <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {auction.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {auction.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-text-secondary">Giá hiện tại</p>
                      <p className="text-2xl font-bold text-primary">
                        {auction.currentPrice.toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      auction.status === 1 ? 'bg-green-100 text-green-800' :
                      auction.status === 3 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {['Nháp', 'Đang diễn ra', 'Chờ xử lý', 'Hoàn thành', 'Đã hủy'][auction.status]}
                    </span>
                  </div>
                  
                  {/* Quick Stats */}
                  {auction.status === 1 && (
                    <div className="mb-3 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Lượt đấu giá:</span>
                        <span className="font-semibold">{auctionBids[auction.id]?.length || 0}</span>
                      </div>
                      {auction.buyoutPrice && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Giá mua ngay:</span>
                          <span className="font-semibold text-orange-600">
                            {auction.buyoutPrice.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* Accept Bid - chỉ hiện nếu đủ điều kiện */}
                    {canAcceptBid(auction) && (
                      <Button
                        variant="primary"
                        onClick={() => handleAcceptBid(auction.id)}
                        disabled={processingId === auction.id}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        ✅ Chấp nhận giá ({auction.currentPrice.toLocaleString('vi-VN')} ₫)
                      </Button>
                    )}

                    <div className="flex gap-2">
                      <Link to={`/auctions/${auction.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Xem chi tiết
                        </Button>
                      </Link>
                      
                      {canCancel(auction) && (
                        <Button
                          variant="danger"
                          onClick={() => handleCancelAuction(auction.id)}
                          disabled={processingId === auction.id}
                          className="flex-1"
                        >
                          Hủy
                        </Button>
                      )}
                    </div>

                    {auction.status === 0 && (
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(auction.id)}
                        className="w-full text-sm"
                      >
                        🗑️ Xóa
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {auctions.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">
              Bạn chưa tạo đấu giá nào.
            </p>
            <div className="text-center">
              <Link to="/create-auction">
                <Button variant="primary">Tạo đấu giá đầu tiên</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyAuctions;
