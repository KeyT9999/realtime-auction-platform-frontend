import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { auctionService } from '../services/auctionService';
import { bidService } from '../services/bidService';
import { productService } from '../services/productService';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import AuctionFilters from '../components/auction/AuctionFilters';

const MyAuctions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [auctionBids, setAuctionBids] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [keyword, setKeyword] = useState('');
  const [duplicatingId, setDuplicatingId] = useState(null);

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
          const data = await bidService.getBidsByAuction(auction.id);
          return { [auction.id]: data?.bids ?? [] };
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

  const handleSubmitForApproval = async (id) => {
    try {
      setProcessingId(id);
      await auctionService.submitForApproval(id);
      toast.success('Đã gửi yêu cầu duyệt!');
      loadAuctions();
    } catch (err) {
      toast.error(err.message || 'Gửi duyệt thất bại');
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

  const handleDuplicate = async (auctionId) => {
    try {
      setDuplicatingId(auctionId);
      const newAuction = await auctionService.duplicateAuction(auctionId, productService);
      toast.success('Đã tạo bản sao đấu giá (trạng thái Nháp)');
      if (newAuction?.id) {
        navigate(`/auctions/${newAuction.id}/edit`);
      } else {
        loadAuctions();
      }
    } catch (err) {
      toast.error(err.message || 'Nhân bản thất bại');
    } finally {
      setDuplicatingId(null);
    }
  };

  const stats = useMemo(() => {
    const active = auctions.filter((a) => a.status === 1).length;
    const completed = auctions.filter((a) => a.status === 3).length;
    const draft = auctions.filter((a) => a.status === 0).length;
    const totalBids = Object.values(auctionBids).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    const pending = auctions.filter((a) => a.status === 6).length;
    return { total: auctions.length, active, completed, draft, pending, totalBids };
  }, [auctions, auctionBids]);

  const filteredAndSortedAuctions = useMemo(() => {
    let list = [...auctions];
    if (statusFilter !== '') {
      const statusNum = parseInt(statusFilter, 10);
      list = list.filter((a) => a.status === statusNum);
    }
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter(
        (a) =>
          (a.title && a.title.toLowerCase().includes(k)) ||
          (a.description && a.description.toLowerCase().includes(k))
      );
    }
    const bidCount = (a) => auctionBids[a.id]?.length ?? a.bidCount ?? 0;
    switch (sortBy) {
      case 'oldest':
        list.sort((a, b) => new Date(a.startTime || a.createdAt) - new Date(b.startTime || b.createdAt));
        break;
      case 'priceDesc':
        list.sort((a, b) => (b.currentPrice ?? 0) - (a.currentPrice ?? 0));
        break;
      case 'priceAsc':
        list.sort((a, b) => (a.currentPrice ?? 0) - (b.currentPrice ?? 0));
        break;
      case 'bidsDesc':
        list.sort((a, b) => bidCount(b) - bidCount(a));
        break;
      case 'endSoon':
        list.sort((a, b) => new Date(a.endTime || 0) - new Date(b.endTime || 0));
        break;
      default:
        list.sort((a, b) => new Date(b.startTime || b.createdAt || 0) - new Date(a.startTime || a.createdAt || 0));
    }
    return list;
  }, [auctions, statusFilter, sortBy, keyword, auctionBids]);

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Đấu giá của tôi</h1>
          <Link to="/create-auction">
            <Button variant="primary">Tạo đấu giá mới</Button>
          </Link>
        </div>

        {auctions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card className="p-4">
              <p className="text-xs text-text-secondary uppercase">Tổng đấu giá</p>
              <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-text-secondary uppercase">Đang diễn ra</p>
              <p className="text-2xl font-bold text-primary">{stats.active}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-text-secondary uppercase">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-text-secondary uppercase">Tổng lượt đấu giá</p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalBids}</p>
            </Card>
          </div>
        )}

        <AuctionFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          keyword={keyword}
          onKeywordChange={setKeyword}
          totalCount={filteredAndSortedAuctions.length}
          showKeyword
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAuctions.map((auction) => (
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
                      auction.status === 6 ? 'bg-orange-100 text-orange-800' :
                      auction.status === 7 ? 'bg-rose-100 text-rose-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {{0:'Nháp',1:'Đang diễn ra',2:'Đã lên lịch',3:'Hoàn thành',4:'Đã hủy',5:'Thất bại',6:'Chờ duyệt',7:'Bị từ chối'}[auction.status] || 'Không rõ'}
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

                  {/* Rejection reason */}
                  {auction.status === 7 && auction.rejectionReason && (
                    <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                      <p className="text-xs font-bold text-rose-700 mb-1">❌ Lý do từ chối:</p>
                      <p className="text-sm text-rose-600">{auction.rejectionReason}</p>
                    </div>
                  )}

                  {/* Submit for approval button */}
                  {(auction.status === 0 || auction.status === 7) && (
                    <Button
                      variant="primary"
                      onClick={() => handleSubmitForApproval(auction.id)}
                      disabled={processingId === auction.id}
                      className="w-full mb-2 bg-orange-600 hover:bg-orange-700"
                    >
                      {auction.status === 7 ? '🔄 Sửa & Gửi duyệt lại' : '📤 Gửi duyệt'}
                    </Button>
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
                      <Link to={`/auctions/${auction.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Chỉnh sửa
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => { e.preventDefault(); handleDuplicate(auction.id); }}
                        disabled={duplicatingId === auction.id}
                      >
                        {duplicatingId === auction.id ? 'Đang tạo...' : 'Nhân bản'}
                      </Button>
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

        {filteredAndSortedAuctions.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">
              {auctions.length === 0
                ? 'Bạn chưa tạo đấu giá nào.'
                : 'Không có đấu giá nào phù hợp với bộ lọc.'}
            </p>
            <div className="text-center flex flex-col items-center gap-2">
              {auctions.length === 0 ? (
                <Link to="/create-auction">
                  <Button variant="primary">Tạo đấu giá đầu tiên</Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={() => { setStatusFilter(''); setKeyword(''); setSortBy('newest'); }}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyAuctions;
