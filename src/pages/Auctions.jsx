import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { categoryService } from '../services/categoryService';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    categoryId: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [auctionsData, categoriesData] = await Promise.all([
        auctionService.getAuctions(filters),
        categoryService.getCategories(),
      ]);
      setAuctions(auctionsData);
      setCategories(categoriesData);
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Tất cả đấu giá</h1>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Trạng thái
              </label>
              <select
                className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">Tất cả</option>
                <option value="0">Nháp</option>
                <option value="1">Đang diễn ra</option>
                <option value="2">Chờ xử lý</option>
                <option value="3">Hoàn thành</option>
                <option value="4">Đã hủy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Danh mục
              </label>
              <select
                className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary"
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

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
                  <Link to={`/auctions/${auction.id}`}>
                    <Button variant="primary" className="w-full">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {auctions.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">
              Không tìm thấy đấu giá nào.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auctions;
