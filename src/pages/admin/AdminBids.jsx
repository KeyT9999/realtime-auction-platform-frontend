import { useState, useEffect } from 'react';
import { bidService } from '../../services/bidService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';

const AdminBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ auctionId: '', userId: '' });

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      setLoading(true);
      // Note: We'd need an admin endpoint to get all bids with filters
      // For now, we'll get bids from a specific auction if filter is set
      if (filters.auctionId) {
        const data = await bidService.getBidsByAuction(filters.auctionId);
        setBids(data);
      } else {
        // In a real app, we'd have an admin endpoint for all bids
        setBids([]);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lượt đấu giá này?')) return;
    try {
      await bidService.deleteBid(id);
      loadBids();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Quản lý Đấu giá</h1>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Lọc theo ID Đấu giá
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary"
                value={filters.auctionId}
                onChange={(e) => setFilters({ ...filters, auctionId: e.target.value })}
                placeholder="Nhập ID đấu giá"
              />
            </div>
            <div className="flex items-end">
              <Button variant="primary" onClick={loadBids}>
                Lọc
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {bids.map(bid => (
            <Card key={bid.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-text-primary">
                    {bid.amount.toLocaleString('vi-VN')} VND
                  </p>
                  <p className="text-text-secondary text-sm mt-1">
                    Đấu giá: {bid.auctionTitle || bid.auctionId}
                  </p>
                  <p className="text-text-secondary text-sm">
                    Người dùng: {bid.userName || bid.userId}
                  </p>
                  <p className="text-text-secondary text-xs mt-1">
                    {new Date(bid.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {bid.isWinningBid && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Đang thắng
                    </span>
                  )}
                  <Button variant="danger" onClick={() => handleDelete(bid.id)}>
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {bids.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">
              {filters.auctionId ? 'Không tìm thấy lượt đấu giá nào cho đấu giá này.' : 'Nhập ID đấu giá để xem các lượt đấu giá.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminBids;
