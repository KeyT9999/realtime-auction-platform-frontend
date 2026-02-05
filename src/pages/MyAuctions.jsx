import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auctionService } from '../services/auctionService';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';

const MyAuctions = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAuctions({ sellerId: user?.id });
      setAuctions(data);
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
      loadAuctions();
    } catch (err) {
      alert(err.message);
    }
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
                  <div className="flex gap-2">
                    <Link to={`/auctions/${auction.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Xem
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(auction.id)}
                      className="flex-1"
                    >
                      Xóa
                    </Button>
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
