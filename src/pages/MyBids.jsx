import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bidService } from '../services/bidService';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      setLoading(true);
      const data = await bidService.getMyBids();
      setBids(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Đấu giá của tôi</h1>

        <div className="space-y-4">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Link to={`/auctions/${bid.auctionId}`}>
                    <h3 className="text-lg font-semibold text-text-primary hover:text-primary">
                      {bid.auctionTitle || `Đấu giá ${bid.auctionId}`}
                    </h3>
                  </Link>
                  <p className="text-text-secondary text-sm mt-1">
                    Giá đấu: <span className="font-semibold text-primary">
                      {bid.amount.toLocaleString('vi-VN')} VND
                    </span>
                  </p>
                  <p className="text-text-secondary text-xs mt-1">
                    {new Date(bid.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  {bid.isWinningBid && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Đang thắng
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {bids.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">
              Bạn chưa đấu giá lần nào.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyBids;
