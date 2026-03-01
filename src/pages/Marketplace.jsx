import { useState, useEffect } from 'react';
import { auctionService } from '../services/auctionService';
import { categoryService } from '../services/categoryService';
import AuctionCard from '../components/auction/AuctionCard';
import Pagination from '../components/common/Pagination';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';

const Marketplace = () => {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  // Filters state
  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    timeFilter: '',
    sortBy: 'startTime',
    sortOrder: 'desc',
  });

  // Temporary search input (only apply on button click)
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [filters, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Normalize auction from API (PascalCase or camelCase) to camelCase for components
  const normalizeAuction = (a) => ({
    id: a?.id ?? a?.Id,
    title: a?.title ?? a?.Title,
    images: a?.images ?? a?.Images ?? (a?.product?.images ?? a?.Product?.Images) ?? [],
    currentPrice: Number(a?.currentPrice ?? a?.CurrentPrice ?? 0),
    bidCount: a?.bidCount ?? a?.BidCount ?? 0,
    endTime: a?.endTime ?? a?.EndTime,
    createdAt: a?.createdAt ?? a?.CreatedAt,
    status: a?.status ?? a?.Status ?? 0,
    categoryName: a?.categoryName ?? a?.CategoryName,
  });

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAuctions({
        ...filters,
        page: currentPage,
        pageSize,
      });

      // Handle both old format (array) and new format (object with items/Items)
      const rawItems = Array.isArray(data)
        ? data
        : (data?.items ?? data?.Items ?? []);
      const list = rawItems.map(normalizeAuction).filter((a) => a?.id && a?.title != null);

      if (Array.isArray(data)) {
        setAuctions(list);
        setTotalCount(list.length);
        setTotalPages(1);
      } else {
        setAuctions(list);
        setTotalCount(data?.totalCount ?? data?.TotalCount ?? list.length);
        setTotalPages(data?.totalPages ?? data?.TotalPages ?? 1);
      }

      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách đấu giá');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, keyword: searchInput });
    setCurrentPage(1); // Reset to first page
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1); // Reset to first page
  };

  const handleSortChange = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters({ ...filters, sortBy, sortOrder: newSortOrder });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      keyword: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      timeFilter: '',
      sortBy: 'startTime',
      sortOrder: 'desc',
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Marketplace - Đấu giá trực tuyến
          </h1>
          <p className="text-text-secondary">
            Tìm kiếm và tham gia các phiên đấu giá hấp dẫn
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm đấu giá..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border border-border-primary rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
            <Button onClick={handleSearch} variant="primary">
              🔍 Tìm kiếm
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">Bộ lọc</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-blue hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>

              <div className="space-y-4">
                {/* Category filter */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Danh mục
                  </label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-border-primary rounded-md bg-background text-text-primary"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price range filter */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Khoảng giá (VND)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Giá tối thiểu"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-border-primary rounded-md bg-background text-text-primary"
                    />
                    <input
                      type="number"
                      placeholder="Giá tối đa"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-border-primary rounded-md bg-background text-text-primary"
                    />
                  </div>
                </div>

                {/* Time filters */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Thời gian
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeFilter"
                        value=""
                        checked={filters.timeFilter === ''}
                        onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Tất cả</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeFilter"
                        value="upcoming"
                        checked={filters.timeFilter === 'upcoming'}
                        onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Sắp diễn ra</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeFilter"
                        value="ending_soon"
                        checked={filters.timeFilter === 'ending_soon'}
                        onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Sắp kết thúc</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="timeFilter"
                        value="new"
                        checked={filters.timeFilter === 'new'}
                        onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Mới đăng</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-3">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-text-secondary">
                Hiển thị {auctions.length} / {totalCount} đấu giá
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Sắp xếp:</span>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy, sortOrder });
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-border-primary rounded-md bg-background text-text-primary text-sm"
                >
                  <option value="startTime-desc">Mới nhất</option>
                  <option value="startTime-asc">Cũ nhất</option>
                  <option value="currentPrice-asc">Giá thấp đến cao</option>
                  <option value="currentPrice-desc">Giá cao đến thấp</option>
                  <option value="endTime-asc">Sắp kết thúc</option>
                  <option value="popular-desc">Phổ biến nhất</option>
                </select>
              </div>
            </div>

            {/* Loading state */}
            {loading && <Loading />}

            {/* Error state */}
            {error && <Alert type="error" message={error} />}

            {/* Auctions grid */}
            {!loading && !error && (
              <>
                {auctions.length === 0 ? (
                  <Card>
                    <p className="text-center text-text-secondary py-12">
                      Không tìm thấy đấu giá nào phù hợp.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {auctions.map((auction) => (
                      <AuctionCard key={auction.id} auction={auction} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
