import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { watchlistService } from '../services/watchlistService';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';

const MyWatchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const data = await watchlistService.getMyWatchlist();
      setWatchlist(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await watchlistService.removeFromWatchlist(id);
      loadWatchlist();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Danh sách theo dõi</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              {item.auction && (
                <div className="space-y-4">
                  {item.auction.imageUrl && (
                    <img
                      src={item.auction.imageUrl}
                      alt={item.auction.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <Link to={`/auctions/${item.auctionId}`}>
                      <h3 className="text-xl font-semibold text-text-primary mb-2 hover:text-primary">
                        {item.auction.title}
                      </h3>
                    </Link>
                    <p className="text-text-secondary text-sm mb-4">
                      Giá hiện tại: <span className="font-semibold text-primary">
                        {item.auction.currentPrice.toLocaleString('vi-VN')} VND
                      </span>
                    </p>
                    <p className="text-text-secondary text-xs mb-4">
                      Kết thúc: {new Date(item.auction.endTime).toLocaleString('vi-VN')}
                    </p>
                    <Button
                      variant="danger"
                      onClick={() => handleRemove(item.id)}
                      className="w-full"
                    >
                      Xóa khỏi danh sách
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {watchlist.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">
              Danh sách theo dõi của bạn đang trống.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyWatchlist;
