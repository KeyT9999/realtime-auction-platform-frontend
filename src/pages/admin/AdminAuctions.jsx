import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionService } from '../../services/auctionService';
import { categoryService } from '../../services/categoryService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';

const AdminAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', categoryId: '' });

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await auctionService.updateAuctionStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đấu giá này?')) return;
    try {
      await auctionService.deleteAuction(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: '0', label: 'Nháp' },
    { value: '1', label: 'Đang diễn ra' },
    { value: '2', label: 'Chờ xử lý' },
    { value: '3', label: 'Hoàn thành' },
    { value: '4', label: 'Đã hủy' },
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Quản lý Đấu giá</h1>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Trạng thái</label>
              <select
                className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Danh mục</label>
              <select
                className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary"
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {auctions.map(auction => (
            <Card key={auction.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link to={`/auctions/${auction.id}`}>
                    <h3 className="text-xl font-semibold text-text-primary hover:text-primary mb-2">
                      {auction.title}
                    </h3>
                  </Link>
                  <p className="text-text-secondary text-sm mb-2">{auction.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-text-secondary">Người bán: {auction.sellerName || 'Không xác định'}</span>
                    <span className="text-text-secondary">Giá: {auction.currentPrice.toLocaleString('vi-VN')} VND</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      auction.status === 1 ? 'bg-green-100 text-green-800' :
                      auction.status === 3 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {['Nháp', 'Đang diễn ra', 'Chờ xử lý', 'Hoàn thành', 'Đã hủy'][auction.status]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary text-sm"
                    value={auction.status}
                    onChange={(e) => handleStatusChange(auction.id, parseInt(e.target.value))}
                  >
                    {statusOptions.slice(1).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <Button variant="danger" onClick={() => handleDelete(auction.id)}>
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {auctions.length === 0 && (
          <Card>
            <p className="text-center text-text-secondary py-8">Không tìm thấy đấu giá nào.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAuctions;
