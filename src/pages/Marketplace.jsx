import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { categoryService } from '../services/categoryService';
import { searchService } from '../services/searchService';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import AuctionCard from '../components/auction/AuctionCard';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';

// ============================
// Constants
// ============================
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: '1', label: 'Đang diễn ra' },
  { value: '2', label: 'Chờ xử lý' },
  { value: '3', label: 'Hoàn thành' },
  { value: '4', label: 'Đã hủy' },
];

const TIME_OPTIONS = [
  { value: '', label: 'Tất cả thời gian' },
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'ending_soon', label: 'Sắp kết thúc' },
  { value: 'new', label: 'Mới đăng' },
];

const SORT_OPTIONS = [
  { value: 'startTime_desc', label: 'Mới nhất', sortBy: 'startTime', sortOrder: 'desc', icon: 'schedule' },
  { value: 'startTime_asc', label: 'Cũ nhất', sortBy: 'startTime', sortOrder: 'asc', icon: 'history' },
  { value: 'currentPrice_desc', label: 'Giá cao → thấp', sortBy: 'currentPrice', sortOrder: 'desc', icon: 'trending_up' },
  { value: 'currentPrice_asc', label: 'Giá thấp → cao', sortBy: 'currentPrice', sortOrder: 'asc', icon: 'trending_down' },
  { value: 'endTime_asc', label: 'Sắp kết thúc', sortBy: 'endTime', sortOrder: 'asc', icon: 'timer' },
  { value: 'popular_desc', label: 'Phổ biến nhất', sortBy: 'popular', sortOrder: 'desc', icon: 'local_fire_department' },
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

  // Search input for keyword (debounced)
  const [searchInput, setSearchInput] = useState(filters.keyword);
  const debouncedKeyword = useDebouncedValue(searchInput, 400);

  // Suggestions / popular keywords (best-effort)
  const [suggestions, setSuggestions] = useState([]);
  const [popularKeywords, setPopularKeywords] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const suggestionsSeqRef = useRef(0);

  // ============================
  // Load categories on mount
  // ============================
  useEffect(() => {
    loadCategories();
  }, []);

  // ============================
  // Debounce: auto-search on typing
  // ============================
  useEffect(() => {
    const k = (debouncedKeyword || '').trim();
    setFilters((prev) => {
      if ((prev.keyword || '') === k) return prev;
      return { ...prev, keyword: k };
    });
    setDraftFilters((prev) => ({ ...prev, keyword: k }));
    setCurrentPage(1);
  }, [debouncedKeyword]);

  // Popular keywords (best-effort)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await searchService.getPopularKeywords();
        if (mounted) setPopularKeywords(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch {
        if (mounted) setPopularKeywords([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Suggestions (best-effort, ignore stale results)
  useEffect(() => {
    const keyword = (searchInput || '').trim();
    if (!suggestionsOpen || keyword.length < 2) {
      setSuggestions([]);
      return;
    }

    const seq = ++suggestionsSeqRef.current;
    (async () => {
      try {
        const data = await searchService.getSuggestions(keyword);
        if (suggestionsSeqRef.current !== seq) return;
        setSuggestions(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch {
        if (suggestionsSeqRef.current !== seq) return;
        setSuggestions([]);
      }
    })();
  }, [searchInput, suggestionsOpen]);

  // ============================
  // Load auctions when filters or page change
  // ============================
  useEffect(() => {
    loadAuctions();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key]) {
        params.set(key, value);
      }
    });
    if (currentPage > 1) params.set('page', currentPage);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      setSearchParams(params, { replace: true });
    }
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
    const k = (searchInput || '').trim();
    if (k !== searchInput) setSearchInput(k);
    setFilters((prev) => ({ ...prev, keyword: k }));
    setDraftFilters((prev) => ({ ...prev, keyword: k }));
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
      tags.push({ key: 'keyword', label: `"${filters.keyword}"` });
    }
    if (filters.categoryId) {
      const cat = categories.find((c) => (c.id ?? c.Id) === filters.categoryId);
      const catName = cat?.name ?? cat?.Name ?? filters.categoryId;
      tags.push({ key: 'categoryId', label: catName });
    }
    if (filters.status) {
      const st = STATUS_OPTIONS.find((o) => o.value === filters.status);
      tags.push({ key: 'status', label: st?.label || filters.status });
    }
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? formatVND(filters.minPrice) + '₫' : '0₫';
      const max = filters.maxPrice ? formatVND(filters.maxPrice) + '₫' : '∞';
      tags.push({ key: 'minPrice', label: `${min} – ${max}`, alsoRemove: 'maxPrice' });
    }
    if (filters.timeFilter) {
      const tf = TIME_OPTIONS.find((o) => o.value === filters.timeFilter);
      tags.push({ key: 'timeFilter', label: tf?.label || filters.timeFilter });
    }
    if (filters.sortBy !== 'startTime' || filters.sortOrder !== 'desc') {
      const sortKey = `${filters.sortBy}_${filters.sortOrder}`;
      const so = SORT_OPTIONS.find((o) => o.value === sortKey);
      tags.push({ key: 'sort', label: so?.label || sortKey });
    }

    return tags;
  };

  const activeTags = getActiveFilterTags();
  const currentSortValue = `${filters.sortBy}_${filters.sortOrder}`;

  return (
    <div className="min-h-screen bg-stone-50">
      <Helmet>
        <title>Khám phá đấu giá — Vela Auctions</title>
        <meta name="description" content="Khám phá các phiên đấu giá đang diễn ra, lọc theo danh mục và tìm sản phẩm bạn yêu thích." />
      </Helmet>

      {/* ================= HERO + SEARCH (Luxury Dark + Gold) ================= */}
      <div className="gradient-luxury relative overflow-hidden">
        {/* Decorative gold line at top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212,175,55,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-500 mb-3">
              Khám phá bộ sưu tập
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-50 tracking-tight text-balance">
              Phiên Đấu Giá
            </h1>
            <p className="mt-3 text-stone-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Tìm kiếm và tham gia các phiên đấu giá hấp dẫn với sản phẩm độc quyền
            </p>
          </div>

          {/* Search bar */}
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'wght' 300" }}>search</span>
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mô tả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 120)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input-luxury-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              />

              {suggestionsOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-luxury border border-stone-200 overflow-hidden z-20">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSearchInput(s);
                        setSuggestionsOpen(false);
                        setFilters((prev) => ({ ...prev, keyword: s }));
                        setDraftFilters((prev) => ({ ...prev, keyword: s }));
                        setCurrentPage(1);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-white font-semibold rounded-xl hover:shadow-luxury-glow transition-all duration-300 text-sm whitespace-nowrap cursor-pointer"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap border cursor-pointer ${showAdvanced
                  ? 'bg-white/10 text-gold-400 border-gold-500/30'
                  : 'bg-white/5 text-stone-400 border-white/10 hover:border-white/20 hover:text-stone-300'
                }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'wght' 300" }}>
                  {showAdvanced ? 'close' : 'tune'}
                </span>
                {showAdvanced ? 'Ẩn bộ lọc' : 'Bộ lọc'}
              </span>
            </button>
          </div>

          {/* Popular keywords */}
          {!searchInput.trim() && popularKeywords.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 max-w-2xl">
              {popularKeywords.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setSearchInput(k);
                    setFilters((prev) => ({ ...prev, keyword: k }));
                    setDraftFilters((prev) => ({ ...prev, keyword: k }));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-stone-400 text-xs font-medium hover:bg-white/10 hover:text-stone-300 transition-colors cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>
          )}

          {/* ================= ADVANCED FILTERS PANEL ================= */}
          <div
            className={`overflow-hidden transition-all duration-400 ease-in-out ${showAdvanced ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'
              }`}
          >
            <div className="glass-dark rounded-2xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Danh mục */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-2 uppercase tracking-wider">
                    Danh mục
                  </label>
                  <select
                    value={draftFilters.categoryId}
                    onChange={(e) => handleDraftChange('categoryId', e.target.value)}
                    className="input-luxury-dark w-full py-2.5 rounded-lg"
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
                  <label className="block text-[11px] font-semibold text-stone-400 mb-2 uppercase tracking-wider">
                    Trạng thái
                  </label>
                  <select
                    value={draftFilters.status}
                    onChange={(e) => handleDraftChange('status', e.target.value)}
                    className="input-luxury-dark w-full py-2.5 rounded-lg"
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
                  <label className="block text-[11px] font-semibold text-stone-400 mb-2 uppercase tracking-wider">
                    Thời gian
                  </label>
                  <select
                    value={draftFilters.timeFilter}
                    onChange={(e) => handleDraftChange('timeFilter', e.target.value)}
                    className="input-luxury-dark w-full py-2.5 rounded-lg"
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
                  <label className="block text-[11px] font-semibold text-stone-400 mb-2 uppercase tracking-wider">
                    Sắp xếp
                  </label>
                  <select
                    value={`${draftFilters.sortBy}_${draftFilters.sortOrder}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="input-luxury-dark w-full py-2.5 rounded-lg"
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
                  <label className="block text-[11px] font-semibold text-stone-400 mb-2 uppercase tracking-wider">
                    Giá từ (₫)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 100,000"
                    value={draftFilters.minPrice}
                    onChange={(e) => handleDraftChange('minPrice', e.target.value)}
                    className="input-luxury-dark w-full py-2.5 rounded-lg"
                  />
                </div>

                {/* Giá đến */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-2 uppercase tracking-wider">
                    Giá đến (₫)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 5,000,000"
                    value={draftFilters.maxPrice}
                    onChange={(e) => handleDraftChange('maxPrice', e.target.value)}
                    className="input-luxury-dark w-full py-2.5 rounded-lg"
                  />
                </div>

                {/* Buttons */}
                <div className="sm:col-span-2 flex items-end gap-3">
                  <button
                    onClick={handleApplyAdvancedFilters}
                    className="flex-1 px-5 py-2.5 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-white font-semibold rounded-lg hover:shadow-luxury-glow transition-all duration-300 text-sm cursor-pointer"
                  >
                    Áp dụng bộ lọc
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 text-stone-400 font-medium rounded-lg hover:bg-white/10 hover:text-stone-300 transition-all text-sm cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gold line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Active filter tags + result count */}
        {(activeTags.length > 0 || totalCount > 0) && !loading && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            {/* Filter tags */}
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[11px] font-medium text-stone-400 mr-1 uppercase tracking-wider">Đang lọc</span>
                {activeTags.map((tag) => (
                  <span
                    key={tag.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-medium"
                  >
                    {tag.label}
                    <button
                      onClick={() => {
                        removeFilter(tag.key);
                        if (tag.alsoRemove) removeFilter(tag.alsoRemove);
                      }}
                      className="ml-0.5 w-4 h-4 rounded-full bg-stone-200 text-stone-500 hover:bg-stone-300 flex items-center justify-center text-[10px] font-bold leading-none cursor-pointer transition-colors"
                      title="Xóa bộ lọc"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gold-600 hover:text-gold-700 font-medium ml-1 cursor-pointer transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Result count */}
            <div className="text-sm text-stone-500 whitespace-nowrap">
              Tìm thấy <span className="font-semibold text-stone-900 tabular-nums">{totalCount}</span> phiên đấu giá
            </div>
          </div>
        )}

        {/* Quick sort bar */}
        {!loading && !error && auctions.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {SORT_OPTIONS.slice(0, 4).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${currentSortValue === opt.value
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300 hover:text-stone-700'
                    }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'wght' 300" }}>{opt.icon}</span>
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
              <div className="card-luxury rounded-2xl py-24 text-center">
                <span className="material-symbols-outlined text-6xl text-stone-300 mb-4 block" style={{ fontVariationSettings: "'wght' 200" }}>search_off</span>
                <p className="font-display text-xl font-semibold text-stone-700 mb-2">
                  Không tìm thấy phiên đấu giá nào
                </p>
                <p className="text-stone-400 text-sm mb-6 max-w-md mx-auto">
                  Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm thấy sản phẩm phù hợp
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors cursor-pointer text-sm"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {auctions.map((auction) => (
                    <div key={auction.id} className="stagger-item">
                      <AuctionCard auction={auction} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10">
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