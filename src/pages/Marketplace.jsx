import { useState, useEffect } from 'react';
import { auctionService } from '../services/auctionService';
import { categoryService } from '../services/categoryService';
import AuctionCard from '../components/auction/AuctionCard';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';

const Marketplace = () => {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    timeFilter: '',
    sortBy: 'startTime',
    sortOrder: 'desc',
  });

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [filters, currentPage]);

  // ===============================
  // Load Categories
  // ===============================
  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // ===============================
  // Normalize Auction (API-safe)
  // ===============================
  const normalizeAuction = (a) => ({
    id: a?.id ?? a?.Id,
    title: a?.title ?? a?.Title,
    images:
      a?.images ??
      a?.Images ??
      a?.product?.images ??
      a?.Product?.Images ??
      [],
    currentPrice: Number(a?.currentPrice ?? a?.CurrentPrice ?? 0),
    bidCount: a?.bidCount ?? a?.BidCount ?? 0,
    endTime: a?.endTime ?? a?.EndTime,
    createdAt: a?.createdAt ?? a?.CreatedAt,
    status: a?.status ?? a?.Status ?? 0,
    categoryName: a?.categoryName ?? a?.CategoryName,
  });

  // ===============================
  // Load Auctions
  // ===============================
  const loadAuctions = async () => {
    try {
      setLoading(true);

      const data = await auctionService.getAuctions({
        ...filters,
        page: currentPage,
        pageSize,
      });

      const rawItems = Array.isArray(data)
        ? data
        : data?.items ?? data?.Items ?? [];

      const list = rawItems
        .map(normalizeAuction)
        .filter((a) => a?.id && a?.title);

      setAuctions(list);

      if (Array.isArray(data)) {
        setTotalCount(list.length);
        setTotalPages(1);
      } else {
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

  // ===============================
  // Handlers
  // ===============================
  const handleSearch = () => {
    setFilters({ ...filters, keyword: searchInput });
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
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

  const timeOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Sắp diễn ra', value: 'upcoming' },
    { label: 'Sắp kết thúc', value: 'ending_soon' },
    { label: 'Mới đăng', value: 'new' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">

      {/* ================= HERO ================= */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            🏷️ Marketplace Đấu Giá
          </h1>
          <p className="text-blue-100">
            Tìm kiếm và tham gia các phiên đấu giá hấp dẫn
          </p>

          {/* Search */}
          <div className="mt-5 flex gap-2 max-w-xl">
            <input
              type="text"
              placeholder="Tìm kiếm đấu giá..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2.5 rounded-xl text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm text-sm"
            />
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-sm"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {loading && <Loading />}
        {error && <Alert type="error" message={error} />}

        {!loading && !error && (
          <>
            {auctions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
                <div className="text-6xl mb-3">🔍</div>
                <p className="text-gray-700 font-bold text-lg">
                  Không tìm thấy đấu giá nào
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {auctions.map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;