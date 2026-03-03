import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { categoryService } from '../services/categoryService';
import AuctionCard from '../components/auction/AuctionCard';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';

// ============================
// Constants
// ============================
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: '1', label: '🟢 Đang diễn ra' },
  { value: '2', label: '🟡 Chờ xử lý' },
  { value: '3', label: '🔵 Hoàn thành' },
  { value: '4', label: '🔴 Đã hủy' },
];

const TIME_OPTIONS = [
  { value: '', label: 'Tất cả thời gian' },
  { value: 'upcoming', label: '📅 Sắp diễn ra' },
  { value: 'ending_soon', label: '⏰ Sắp kết thúc' },
  { value: 'new', label: '🆕 Mới đăng' },
];

const SORT_OPTIONS = [
  { value: 'startTime_desc', label: 'Mới nhất', sortBy: 'startTime', sortOrder: 'desc' },
  { value: 'startTime_asc', label: 'Cũ nhất', sortBy: 'startTime', sortOrder: 'asc' },
  { value: 'currentPrice_desc', label: 'Giá cao → thấp', sortBy: 'currentPrice', sortOrder: 'desc' },
  { value: 'currentPrice_asc', label: 'Giá thấp → cao', sortBy: 'currentPrice', sortOrder: 'asc' },
  { value: 'endTime_asc', label: 'Sắp kết thúc', sortBy: 'endTime', sortOrder: 'asc' },
  { value: 'popular_desc', label: 'Phổ biến nhất', sortBy: 'popular', sortOrder: 'desc' },
];

const DEFAULT_FILTERS = {
  keyword: '',
  categoryId: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  timeFilter: '',
  sortBy: 'startTime',
  sortOrder: 'desc',
};

const PAGE_SIZE = 12;

// ============================
// Helper: format VND
// ============================
const formatVND = (value) => {
  if (!value && value !== 0) return '';
  return Number(value).toLocaleString('vi-VN');
};

// ============================
// Component
// ============================
const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Advanced search panel visibility
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Actual applied filters (triggers API call)
  const [filters, setFilters] = useState(() => {
    // Initialize from URL search params if present
    return {
      keyword: searchParams.get('keyword') || '',
      categoryId: searchParams.get('categoryId') || '',
      status: searchParams.get('status') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      timeFilter: searchParams.get('timeFilter') || '',
      sortBy: searchParams.get('sortBy') || 'startTime',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };
  });

  // Draft filters (user edits these before clicking "Áp dụng")
  const [draftFilters, setDraftFilters] = useState({ ...filters });

  // Search input for keyword
  const [searchInput, setSearchInput] = useState(filters.keyword);
  const debounceRef = useRef(null);

  // ============================
  // Load categories on mount
  // ============================
  useEffect(() => {
    loadCategories();
  }, []);

  // ============================
  // Debounce: auto-search on typing (400ms)
  // ============================
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => {
        if (prev.keyword === searchInput) return prev;
        return { ...prev, keyword: searchInput };
      });
      setDraftFilters((prev) => ({ ...prev, keyword: searchInput }));
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ============================
  // Load auctions when filters or page change
  // ============================
  useEffect(() => {
    loadAuctions();
    // Sync URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key]) {
        params.set(key, value);
      }
    });
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params, { replace: true });
  }, [filters, currentPage]);

  // If URL has advanced filters on load, open the panel
  useEffect(() => {
    const hasAdvanced = filters.categoryId || filters.status || filters.minPrice ||
      filters.maxPrice || filters.timeFilter ||
      (filters.sortBy !== 'startTime' || filters.sortOrder !== 'desc');
    if (hasAdvanced) setShowAdvanced(true);
  }, []);

  // ============================
  // Load Categories
  // ============================
  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // ============================
  // Normalize Auction (API-safe)
  // ============================
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

  // ============================
  // Load Auctions
  // ============================
  const loadAuctions = async () => {
    try {
      setLoading(true);

      const data = await auctionService.getAuctions({
        ...filters,
        page: currentPage,
        pageSize: PAGE_SIZE,
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

  // ============================
  // Handlers
  // ============================
  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, keyword: searchInput }));
    setDraftFilters((prev) => ({ ...prev, keyword: searchInput }));
    setCurrentPage(1);
  }, [searchInput]);

  const handleApplyAdvancedFilters = () => {
    setFilters({ ...draftFilters, keyword: searchInput });
    setCurrentPage(1);
  };

  const handleDraftChange = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (combinedValue) => {
    const option = SORT_OPTIONS.find((o) => o.value === combinedValue);
    if (option) {
      setDraftFilters((prev) => ({
        ...prev,
        sortBy: option.sortBy,
        sortOrder: option.sortOrder,
      }));
      // Sort applies immediately
      setFilters((prev) => ({
        ...prev,
        sortBy: option.sortBy,
        sortOrder: option.sortOrder,
      }));
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    const clean = { ...DEFAULT_FILTERS };
    setFilters(clean);
    setDraftFilters(clean);
    setCurrentPage(1);
  };

  const removeFilter = (key) => {
    const defaultVal = DEFAULT_FILTERS[key] || '';
    if (key === 'keyword') setSearchInput('');
    // For sort, reset both sortBy and sortOrder
    if (key === 'sort') {
      setFilters((prev) => ({ ...prev, sortBy: 'startTime', sortOrder: 'desc' }));
      setDraftFilters((prev) => ({ ...prev, sortBy: 'startTime', sortOrder: 'desc' }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: defaultVal }));
      setDraftFilters((prev) => ({ ...prev, [key]: defaultVal }));
    }
    setCurrentPage(1);
  };

  // ============================
  // Active filter tags
  // ============================
  const getActiveFilterTags = () => {
    const tags = [];

    if (filters.keyword) {
      tags.push({ key: 'keyword', label: `Từ khóa: "${filters.keyword}"` });
    }
    if (filters.categoryId) {
      const cat = categories.find((c) => (c.id ?? c.Id) === filters.categoryId);
      const catName = cat?.name ?? cat?.Name ?? filters.categoryId;
      tags.push({ key: 'categoryId', label: `Danh mục: ${catName}` });
    }
    if (filters.status) {
      const st = STATUS_OPTIONS.find((o) => o.value === filters.status);
      tags.push({ key: 'status', label: `Trạng thái: ${st?.label?.replace(/^[^\s]+\s/, '') || filters.status}` });
    }
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? formatVND(filters.minPrice) + '₫' : '0₫';
      const max = filters.maxPrice ? formatVND(filters.maxPrice) + '₫' : '∞';
      tags.push({ key: 'minPrice', label: `Giá: ${min} - ${max}`, alsoRemove: 'maxPrice' });
    }
    if (filters.timeFilter) {
      const tf = TIME_OPTIONS.find((o) => o.value === filters.timeFilter);
      tags.push({ key: 'timeFilter', label: tf?.label?.replace(/^[^\s]+\s/, '') || filters.timeFilter });
    }
    if (filters.sortBy !== 'startTime' || filters.sortOrder !== 'desc') {
      const sortKey = `${filters.sortBy}_${filters.sortOrder}`;
      const so = SORT_OPTIONS.find((o) => o.value === sortKey);
      tags.push({ key: 'sort', label: `Sắp xếp: ${so?.label || sortKey}` });
    }

    return tags;
  };

  const activeTags = getActiveFilterTags();
  const currentSortValue = `${filters.sortBy}_${filters.sortOrder}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">

      {/* ================= HERO + SEARCH ================= */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            🏷️ Marketplace Đấu Giá
          </h1>
          <p className="text-blue-100">
            Tìm kiếm và tham gia các phiên đấu giá hấp dẫn
          </p>

          {/* Search bar */}
          <div className="mt-5 flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm đấu giá theo tên, mô tả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-sm whitespace-nowrap"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap border ${showAdvanced
                  ? 'bg-white text-blue-600 border-white'
                  : 'bg-blue-500/30 text-white border-white/30 hover:bg-blue-500/50'
                }`}
            >
              {showAdvanced ? '✕ Ẩn bộ lọc' : '⚙️ Bộ lọc nâng cao'}
            </button>
          </div>

          {/* ================= ADVANCED FILTERS PANEL ================= */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${showAdvanced ? 'max-h-[500px] opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'
              }`}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Danh mục */}
                <div>
                  <label className="block text-xs font-semibold text-blue-100 mb-1.5 uppercase tracking-wide">
                    📂 Danh mục
                  </label>
                  <select
                    value={draftFilters.categoryId}
                    onChange={(e) => handleDraftChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id ?? cat.Id} value={cat.id ?? cat.Id}>
                        {cat.name ?? cat.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-xs font-semibold text-blue-100 mb-1.5 uppercase tracking-wide">
                    📋 Trạng thái
                  </label>
                  <select
                    value={draftFilters.status}
                    onChange={(e) => handleDraftChange('status', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thời gian */}
                <div>
                  <label className="block text-xs font-semibold text-blue-100 mb-1.5 uppercase tracking-wide">
                    🕐 Thời gian
                  </label>
                  <select
                    value={draftFilters.timeFilter}
                    onChange={(e) => handleDraftChange('timeFilter', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {TIME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sắp xếp */}
                <div>
                  <label className="block text-xs font-semibold text-blue-100 mb-1.5 uppercase tracking-wide">
                    🔀 Sắp xếp
                  </label>
                  <select
                    value={`${draftFilters.sortBy}_${draftFilters.sortOrder}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Giá từ */}
                <div>
                  <label className="block text-xs font-semibold text-blue-100 mb-1.5 uppercase tracking-wide">
                    💰 Giá từ (₫)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 100000"
                    value={draftFilters.minPrice}
                    onChange={(e) => handleDraftChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                {/* Giá đến */}
                <div>
                  <label className="block text-xs font-semibold text-blue-100 mb-1.5 uppercase tracking-wide">
                    💰 Giá đến (₫)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 5000000"
                    value={draftFilters.maxPrice}
                    onChange={(e) => handleDraftChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                {/* Buttons */}
                <div className="sm:col-span-2 flex items-end gap-3">
                  <button
                    onClick={handleApplyAdvancedFilters}
                    className="flex-1 px-5 py-2.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors text-sm shadow-sm"
                  >
                    ✅ Áp dụng bộ lọc
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2.5 bg-red-500/80 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors text-sm"
                  >
                    🗑️ Xóa tất cả
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Active filter tags + result count */}
        {(activeTags.length > 0 || totalCount > 0) && !loading && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            {/* Filter tags */}
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-medium text-gray-400 mr-1">Đang lọc:</span>
                {activeTags.map((tag) => (
                  <span
                    key={tag.key}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium"
                  >
                    {tag.label}
                    <button
                      onClick={() => {
                        removeFilter(tag.key);
                        if (tag.alsoRemove) removeFilter(tag.alsoRemove);
                      }}
                      className="ml-0.5 w-4 h-4 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300 flex items-center justify-center text-[10px] font-bold leading-none"
                      title="Xóa bộ lọc này"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-700 font-medium underline ml-1"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Result count */}
            <div className="text-sm text-gray-500 whitespace-nowrap">
              Tìm thấy <span className="font-bold text-gray-800">{totalCount}</span> đấu giá
            </div>
          </div>
        )}

        {/* Quick sort bar (always visible) */}
        {!loading && !error && auctions.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {SORT_OPTIONS.slice(0, 4).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentSortValue === opt.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading & Error */}
        {loading && <Loading />}
        {error && <Alert type="error" message={error} />}

        {/* Results */}
        {!loading && !error && (
          <>
            {auctions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
                <div className="text-6xl mb-3">🔍</div>
                <p className="text-gray-700 font-bold text-lg">
                  Không tìm thấy đấu giá nào
                </p>
                <p className="text-gray-400 text-sm mt-1 mb-4">
                  Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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