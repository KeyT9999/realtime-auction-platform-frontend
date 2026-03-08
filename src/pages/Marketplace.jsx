import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { categoryService } from '../services/categoryService';
import AuctionCard from '../components/auction/AuctionCard';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';

// ============================
// Constants (preserved exactly)
// ============================
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: '1', label: 'Đang diễn ra' },
  { value: '2', label: 'Sắp diễn ra' },
  { value: '3', label: 'Hoàn thành' },
  { value: '4', label: 'Đã hủy' },
];

const TIME_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'ending_soon', label: 'Sắp kết thúc' },
  { value: 'new', label: 'Mới đăng' },
];

const SORT_OPTIONS = [
  { value: 'startTime_desc', label: 'Mới nhất', sortBy: 'startTime', sortOrder: 'desc' },
  { value: 'startTime_asc', label: 'Cũ nhất', sortBy: 'startTime', sortOrder: 'asc' },
  { value: 'currentPrice_desc', label: 'Giá cao → thấp', sortBy: 'currentPrice', sortOrder: 'desc' },
  { value: 'currentPrice_asc', label: 'Giá thấp → cao', sortBy: 'currentPrice', sortOrder: 'asc' },
  { value: 'endTime_asc', label: 'Kết thúc sớm nhất', sortBy: 'endTime', sortOrder: 'asc' },
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

const formatVND = (value) => {
  if (!value && value !== 0) return '';
  return Number(value).toLocaleString('vi-VN');
};

// ============================
// Sidebar Filter Panel (extracted for stable identity across renders)
// ============================
const SidebarPanel = ({ draftFilters, handleDraftChange, categories, currentSortValue, handleSortChange, handleApplyFilters, clearFilters }) => (
  <div className="flex flex-col gap-7">

    {/* Categories */}
    <div>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Categories</h3>
      <ul className="flex flex-col gap-0.5">
        <li>
          <button
            onClick={() => { handleDraftChange('categoryId', ''); }}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              !draftFilters.categoryId ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-xl">apps</span>
            All Items
          </button>
        </li>
        {categories.map((cat) => {
          const catId = cat.id ?? cat.Id;
          const catName = cat.name ?? cat.Name;
          const isActive = draftFilters.categoryId === catId;
          return (
            <li key={catId}>
              <button
                onClick={() => handleDraftChange('categoryId', catId)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-xl">label</span>
                {catName}
              </button>
            </li>
          );
        })}
      </ul>
    </div>

    {/* Divider */}
    <div className="h-px bg-slate-100"></div>

    {/* Auction Status */}
    <div>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Auction Status</h3>
      <div className="flex flex-col gap-2.5">
        {STATUS_OPTIONS.filter(o => o.value).map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={draftFilters.status === opt.value}
              onChange={() => handleDraftChange('status', draftFilters.status === opt.value ? '' : opt.value)}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className={`text-sm font-medium transition-colors ${draftFilters.status === opt.value ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900'}`}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* Divider */}
    <div className="h-px bg-slate-100"></div>

    {/* Price Range */}
    <div>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Price Range</h3>
      <div className="flex flex-col gap-2">
        <input
          type="number" min="0" placeholder="Giá tối thiểu (₫)"
          value={draftFilters.minPrice}
          onChange={(e) => handleDraftChange('minPrice', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="number" min="0" placeholder="Giá tối đa (₫)"
          value={draftFilters.maxPrice}
          onChange={(e) => handleDraftChange('maxPrice', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>

    {/* Divider */}
    <div className="h-px bg-slate-100"></div>

    {/* Sort By */}
    <div>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Sort By</h3>
      <select
        value={currentSortValue}
        onChange={(e) => handleSortChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 py-2 px-3"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>

    {/* Buttons */}
    <div className="flex flex-col gap-2">
      <button onClick={handleApplyFilters} className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-700 transition-colors">
        Áp dụng
      </button>
      <button onClick={clearFilters} className="w-full py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors">
        Xóa bộ lọc
      </button>
    </div>
  </div>
);

// ============================
// Main Marketplace Component
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

  const [gridView, setGridView] = useState(true); // true = grid, false = list
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [filters, setFilters] = useState(() => ({
    keyword: searchParams.get('keyword') || '',
    categoryId: searchParams.get('categoryId') || '',
    status: searchParams.get('status') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    timeFilter: searchParams.get('timeFilter') || '',
    sortBy: searchParams.get('sortBy') || 'startTime',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  }));

  const [draftFilters, setDraftFilters] = useState({ ...filters });
  const [searchInput, setSearchInput] = useState(filters.keyword);
  const debounceRef = useRef(null);
  const categoriesLoaded = useRef(false);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const [, auctionData] = await Promise.all([
          !categoriesLoaded.current ? loadCategories() : Promise.resolve(),
          auctionService.getAuctions({ ...filters, page: currentPage, pageSize: PAGE_SIZE })
        ]);
        categoriesLoaded.current = true;
        processAuctionData(auctionData);
        setError(null);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải danh sách đấu giá');
      } finally {
        setLoading(false);
      }
    };
    loadInitial();

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key]) params.set(key, value);
    });
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params, { replace: true });
  }, [filters, currentPage]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => prev.keyword === searchInput ? prev : { ...prev, keyword: searchInput });
      setDraftFilters((prev) => ({ ...prev, keyword: searchInput }));
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) { console.error('Error loading categories:', err); }
  };

  const normalizeAuction = (a) => ({
    id: a?.id ?? a?.Id,
    title: a?.title ?? a?.Title,
    images: a?.images ?? a?.Images ?? a?.product?.images ?? a?.Product?.Images ?? [],
    currentPrice: Number(a?.currentPrice ?? a?.CurrentPrice ?? 0),
    bidCount: a?.bidCount ?? a?.BidCount ?? 0,
    endTime: a?.endTime ?? a?.EndTime,
    createdAt: a?.createdAt ?? a?.CreatedAt,
    status: a?.status ?? a?.Status ?? 0,
    categoryName: a?.categoryName ?? a?.CategoryName,
  });

  const processAuctionData = (data) => {
    const rawItems = Array.isArray(data) ? data : data?.items ?? data?.Items ?? [];
    const list = rawItems.map(normalizeAuction).filter((a) => a?.id && a?.title);
    setAuctions(list);
    if (Array.isArray(data)) { setTotalCount(list.length); setTotalPages(1); }
    else {
      setTotalCount(data?.totalCount ?? data?.TotalCount ?? list.length);
      setTotalPages(data?.totalPages ?? data?.TotalPages ?? 1);
    }
  };

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, keyword: searchInput }));
    setDraftFilters((prev) => ({ ...prev, keyword: searchInput }));
    setCurrentPage(1);
  }, [searchInput]);

  const handleApplyFilters = () => {
    setFilters({ ...draftFilters, keyword: searchInput });
    setCurrentPage(1);
    setMobileSidebarOpen(false);
  };

  const handleDraftChange = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (combinedValue) => {
    const option = SORT_OPTIONS.find((o) => o.value === combinedValue);
    if (option) {
      setDraftFilters((prev) => ({ ...prev, sortBy: option.sortBy, sortOrder: option.sortOrder }));
      setFilters((prev) => ({ ...prev, sortBy: option.sortBy, sortOrder: option.sortOrder }));
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ ...DEFAULT_FILTERS });
    setDraftFilters({ ...DEFAULT_FILTERS });
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

  const getActiveFilterTags = () => {
    const tags = [];
    if (filters.keyword) tags.push({ key: 'keyword', label: filters.keyword });
    if (filters.categoryId) {
      const cat = categories.find((c) => (c.id ?? c.Id) === filters.categoryId);
      tags.push({ key: 'categoryId', label: cat?.name ?? cat?.Name ?? filters.categoryId });
    }
    if (filters.status) {
      const st = STATUS_OPTIONS.find((o) => o.value === filters.status);
      tags.push({ key: 'status', label: st?.label || filters.status });
    }
    if (filters.minPrice || filters.maxPrice) {
      tags.push({ key: 'minPrice', label: `${formatVND(filters.minPrice || 0)}₫ – ${filters.maxPrice ? formatVND(filters.maxPrice) + '₫' : '∞'}`, alsoRemove: 'maxPrice' });
    }
    if (filters.timeFilter) {
      const tf = TIME_OPTIONS.find((o) => o.value === filters.timeFilter);
      tags.push({ key: 'timeFilter', label: tf?.label || filters.timeFilter });
    }
    if (filters.sortBy !== 'startTime' || filters.sortOrder !== 'desc') {
      const so = SORT_OPTIONS.find((o) => o.value === `${filters.sortBy}_${filters.sortOrder}`);
      tags.push({ key: 'sort', label: so?.label || filters.sortBy });
    }
    return tags;
  };

  const activeTags = useMemo(() => getActiveFilterTags(), [filters, categories]);
  const currentSortValue = `${filters.sortBy}_${filters.sortOrder}`;

  const sidebarProps = { draftFilters, handleDraftChange, categories, currentSortValue, handleSortChange, handleApplyFilters, clearFilters };

  return (
    <div className="min-h-screen bg-slate-50/60">

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900">Bộ lọc</h2>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <SidebarPanel {...sidebarProps} />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex gap-8 px-6 py-8">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <SidebarPanel {...sidebarProps} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">

          {/* Top bar: count + tags + view toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Result count */}
              {!loading && (
                <span className="text-sm font-bold text-slate-900">
                  {totalCount.toLocaleString()} Results
                </span>
              )}

              {/* Active filter tags */}
              {activeTags.map((tag) => (
                <span
                  key={tag.key}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm"
                >
                  {tag.label}
                  <button
                    onClick={() => { removeFilter(tag.key); if (tag.alsoRemove) removeFilter(tag.alsoRemove); }}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              ))}
              {activeTags.length > 0 && (
                <button onClick={clearFilters} className="text-xs font-semibold text-primary hover:text-primary-700">
                  Clear all
                </button>
              )}
            </div>

            {/* Right: search + filter toggle + grid/list */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-52 pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold hover:border-primary/40 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filters
              </button>

              {/* Grid/List toggle */}
              <div className="flex items-center border border-slate-200 rounded-full bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setGridView(true)}
                  className={`flex items-center justify-center px-3 py-2 transition-colors ${gridView ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="material-symbols-outlined text-xl">grid_view</span>
                </button>
                <button
                  onClick={() => setGridView(false)}
                  className={`flex items-center justify-center px-3 py-2 transition-colors ${!gridView ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="material-symbols-outlined text-xl">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loading size="lg" />
            </div>
          )}

          {/* Error */}
          {error && <Alert type="error">{error}</Alert>}

          {/* Auction Grid / List */}
          {!loading && !error && (
            <>
              {auctions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-24 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 block mb-4">search_off</span>
                  <p className="text-slate-800 font-bold text-lg mb-2">No auctions found</p>
                  <p className="text-slate-400 text-sm mb-6">Try adjusting your filters or search term</p>
                  <button onClick={clearFilters} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-700 text-sm transition-colors">
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  {gridView ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {auctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {auctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>

                      {(() => {
                        const pages = [];
                        const total = totalPages;
                        const cur = currentPage;
                        let start = Math.max(1, cur - 2);
                        let end = Math.min(total, cur + 2);
                        if (cur <= 3) end = Math.min(total, 5);
                        if (cur >= total - 2) start = Math.max(1, total - 4);

                        if (start > 1) {
                          pages.push(<button key={1} onClick={() => handlePageChange(1)} className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 shadow-sm">1</button>);
                          if (start > 2) pages.push(<span key="e1" className="px-2 text-slate-400">...</span>);
                        }

                        for (let p = start; p <= end; p++) {
                          pages.push(
                            <button
                              key={p}
                              onClick={() => handlePageChange(p)}
                              className={`h-10 w-10 rounded-lg text-sm font-bold transition-all shadow-sm ${p === cur ? 'bg-primary text-white' : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                            >
                              {p}
                            </button>
                          );
                        }

                        if (end < total) {
                          if (end < total - 1) pages.push(<span key="e2" className="px-2 text-slate-400">...</span>);
                          pages.push(<button key={total} onClick={() => handlePageChange(total)} className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 shadow-sm">{total}</button>);
                        }

                        return pages;
                      })()}

                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;