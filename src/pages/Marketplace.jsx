// Mục đích tệp: Trien khai logic/chuc nang chinh cua file Marketplace.
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
  { value: '2', label: 'Đã lên lịch' },
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

const formatVND = (value) => {
  if (!value && value !== 0) return '';
  return Number(value).toLocaleString('vi-VN');
};

// Material icon helper
const MI = ({ name, size = 18, weight = 300 }) => (
  <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, fontVariationSettings: `'wght' ${weight}` }}>{name}</span>
);

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

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
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
  const debouncedKeyword = useDebouncedValue(searchInput, 400);

  const [suggestions, setSuggestions] = useState([]);
  const [popularKeywords, setPopularKeywords] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const suggestionsSeqRef = useRef(0);

  // ============================
  // Effects
  // ============================
  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    const k = (debouncedKeyword || '').trim();
    setFilters((prev) => {
      if ((prev.keyword || '') === k) return prev;
      return { ...prev, keyword: k };
    });
    setDraftFilters((prev) => ({ ...prev, keyword: k }));
    setCurrentPage(1);
  }, [debouncedKeyword]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await searchService.getPopularKeywords();
        if (mounted) setPopularKeywords(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch { if (mounted) setPopularKeywords([]); }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const keyword = (searchInput || '').trim();
    if (!suggestionsOpen || keyword.length < 2) { setSuggestions([]); return; }
    const seq = ++suggestionsSeqRef.current;
    (async () => {
      try {
        const data = await searchService.getSuggestions(keyword);
        if (suggestionsSeqRef.current !== seq) return;
        setSuggestions(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch { if (suggestionsSeqRef.current !== seq) return; setSuggestions([]); }
    })();
  }, [searchInput, suggestionsOpen]);

  useEffect(() => {
    loadAuctions();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key]) params.set(key, value);
    });
    if (currentPage > 1) params.set('page', currentPage);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) setSearchParams(params, { replace: true });
  }, [filters, currentPage]);

  // ============================
  // Data loaders
  // ============================
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

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAuctions({ ...filters, page: currentPage, pageSize: PAGE_SIZE });
      const rawItems = Array.isArray(data) ? data : data?.items ?? data?.Items ?? [];
      const list = rawItems.map(normalizeAuction).filter((a) => a?.id && a?.title);
      setAuctions(list);
      if (Array.isArray(data)) { setTotalCount(list.length); setTotalPages(1); }
      else { setTotalCount(data?.totalCount ?? data?.TotalCount ?? list.length); setTotalPages(data?.totalPages ?? data?.TotalPages ?? 1); }
      setError(null);
    } catch (err) { setError(err.message || 'Lỗi khi tải danh sách đấu giá'); }
    finally { setLoading(false); }
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

  const handleDraftChange = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFilters({ ...draftFilters, keyword: searchInput });
    setCurrentPage(1);
    setSidebarOpen(false);
  };

  const handleSortChange = (combinedValue) => {
    const option = SORT_OPTIONS.find((o) => o.value === combinedValue);
    if (option) {
      setDraftFilters((prev) => ({ ...prev, sortBy: option.sortBy, sortOrder: option.sortOrder }));
      setFilters((prev) => ({ ...prev, sortBy: option.sortBy, sortOrder: option.sortOrder }));
      setCurrentPage(1);
    }
  };

  const handleCategoryClick = (catId) => {
    const newCatId = catId === draftFilters.categoryId ? '' : catId;
    setDraftFilters((prev) => ({ ...prev, categoryId: newCatId }));
    setFilters((prev) => ({ ...prev, categoryId: newCatId }));
    setCurrentPage(1);
  };

  const handleStatusClick = (statusVal) => {
    const newVal = statusVal === draftFilters.status ? '' : statusVal;
    setDraftFilters((prev) => ({ ...prev, status: newVal }));
    setFilters((prev) => ({ ...prev, status: newVal }));
    setCurrentPage(1);
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
    if (filters.keyword) tags.push({ key: 'keyword', label: `"${filters.keyword}"` });
    if (filters.categoryId) {
      const cat = categories.find((c) => (c.id ?? c.Id) === filters.categoryId);
      tags.push({ key: 'categoryId', label: cat?.name ?? cat?.Name ?? filters.categoryId });
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
    return tags;
  };

  const activeTags = getActiveFilterTags();
  const currentSortValue = `${filters.sortBy}_${filters.sortOrder}`;
  const hasActiveFilters = activeTags.length > 0 || filters.sortBy !== 'startTime' || filters.sortOrder !== 'desc';

  // ============================
  // RENDER
  // ============================
  return (
    <div className="min-h-screen bg-slate-950">
      <Helmet>
        <title>Khám phá đấu giá — F-Bid</title>
        <meta name="description" content="Khám phá các phiên đấu giá đang diễn ra, lọc theo danh mục và tìm sản phẩm bạn yêu thích." />
      </Helmet>

      {/* ============ COMPACT HERO + SEARCH ============ */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Phiên Đấu Giá
              </h1>
              <p className="mt-1 text-slate-400 text-sm max-w-lg">
                Tìm kiếm và tham gia các phiên đấu giá hấp dẫn với sản phẩm độc quyền
              </p>
            </div>

            {/* Search bar */}
            <div className="flex gap-2 max-w-xl w-full lg:w-auto">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <MI name="search" size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, mô tả..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setSuggestionsOpen(true)}
                  onBlur={() => setTimeout(() => setSuggestionsOpen(false), 120)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
                {suggestionsOpen && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden z-20">
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
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="px-5 py-2.5 bg-amber-500 text-slate-900 font-semibold rounded-xl hover:bg-amber-400 transition-all duration-200 text-sm whitespace-nowrap cursor-pointer shadow-sm"
              >
                Tìm kiếm
              </button>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <MI name="tune" size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT: SIDEBAR + GRID ============ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-6">

          {/* ── SIDEBAR FILTER ── */}
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside className={`mp-sidebar ${sidebarOpen ? 'mp-sidebar-open' : ''}`}>
            {/* Mobile close button */}
            <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-700">
              <span className="font-semibold text-slate-100">Bộ lọc</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-300 cursor-pointer">
                <MI name="close" size={20} />
              </button>
            </div>

            {/* Danh mục — cuộn, không kéo dài sidebar */}
            <div className="mp-filter-group">
              <h3 className="mp-filter-title">
                <MI name="category" size={16} weight={400} />
                Danh mục
              </h3>
              <div className="mp-category-list">
                {categories.map((cat) => {
                  const catId = cat.id ?? cat.Id;
                  const catName = cat.name ?? cat.Name;
                  const isSelected = filters.categoryId === catId;
                  return (
                    <button
                      key={catId}
                      onClick={() => handleCategoryClick(catId)}
                      className={`mp-filter-option ${isSelected ? 'active' : ''}`}
                    >
                      <span className={`mp-radio ${isSelected ? 'active' : ''}`} />
                      <span className="truncate">{catName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trạng thái */}
            <div className="mp-filter-group">
              <h3 className="mp-filter-title">
                <MI name="flag" size={16} weight={400} />
                Trạng thái
              </h3>
              <div className="flex flex-col gap-0.5">
                {STATUS_OPTIONS.filter(o => o.value !== '').map((opt) => {
                  const isSelected = filters.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusClick(opt.value)}
                      className={`mp-filter-option ${isSelected ? 'active' : ''}`}
                    >
                      <span className={`mp-radio ${isSelected ? 'active' : ''}`} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Khoảng giá */}
            <div className="mp-filter-group">
              <h3 className="mp-filter-title">
                <MI name="payments" size={16} weight={400} />
                Khoảng giá
              </h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="Từ"
                  value={draftFilters.minPrice}
                  onChange={(e) => handleDraftChange('minPrice', e.target.value)}
                  className="mp-price-input"
                />
                <span className="text-slate-500 text-xs">—</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Đến"
                  value={draftFilters.maxPrice}
                  onChange={(e) => handleDraftChange('maxPrice', e.target.value)}
                  className="mp-price-input"
                />
              </div>
              <button
                onClick={handleApplyFilters}
                className="mt-2 w-full py-2 text-xs font-semibold text-slate-900 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Áp dụng giá
              </button>
            </div>

            {/* Thời gian */}
            <div className="mp-filter-group">
              <h3 className="mp-filter-title">
                <MI name="schedule" size={16} weight={400} />
                Thời gian
              </h3>
              <select
                value={draftFilters.timeFilter}
                onChange={(e) => {
                  handleDraftChange('timeFilter', e.target.value);
                  setFilters((prev) => ({ ...prev, timeFilter: e.target.value }));
                  setCurrentPage(1);
                }}
                className="mp-select"
              >
                {TIME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-red-400 rounded-lg hover:bg-red-500 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MI name="delete_sweep" size={14} weight={400} />
                Xóa tất cả bộ lọc
              </button>
            )}
          </aside>

          {/* ── CONTENT ── */}
          <div className="flex-1 min-w-0">
            {/* Top bar: result count + sort pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div className="text-sm text-slate-400">
                {!loading && (
                  <>Tìm thấy <span className="font-semibold text-white tabular-nums">{totalCount}</span> phiên đấu giá</>
                )}
              </div>
              {!loading && !error && auctions.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {SORT_OPTIONS.slice(0, 4).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`mp-sort-pill ${currentSortValue === opt.value ? 'active' : ''}`}
                    >
                      <MI name={opt.icon} size={14} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active filter tags */}
            {activeTags.length > 0 && !loading && (
              <div className="flex flex-wrap gap-2 items-center mb-5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Đang lọc</span>
                {activeTags.map((tag) => (
                  <span key={tag.key} className="mp-filter-tag">
                    {tag.label}
                    <button
                      onClick={() => { removeFilter(tag.key); if (tag.alsoRemove) removeFilter(tag.alsoRemove); }}
                      className="ml-1 w-4 h-4 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors"
                    >✕</button>
                  </span>
                ))}
                <button onClick={clearFilters} className="text-xs text-amber-400 hover:text-amber-300 font-medium ml-1 cursor-pointer transition-colors">
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Loading & Error */}
            {loading && <Loading />}
            {error && <Alert type="error" message={error} />}

            {/* Results */}
            {!loading && !error && (
              <>
                {auctions.length === 0 ? (
                  <div className="card-luxury rounded-2xl py-20 text-center bg-slate-900 border border-slate-800">
                    <MI name="search_off" size={56} weight={200} />
                    <p className="font-display text-lg font-semibold text-white mt-4 mb-2">
                      Không tìm thấy phiên đấu giá nào
                    </p>
                    <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                      Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                    <button onClick={clearFilters} className="px-6 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors cursor-pointer text-sm">
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {auctions.map((auction) => (
                        <div key={auction.id} className="stagger-item">
                          <AuctionCard auction={auction} />
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-10">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============ STYLES ============ */}
      <style>{`
        /* ── Sidebar ── */
        .mp-sidebar {
          width: 260px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: sticky;
          top: 80px;
          height: fit-content;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          padding: 1.25rem;
          background: #0f172a; /* bg-slate-900 */
          border-radius: 1rem;
          border: 1px solid #1e293b; /* border-slate-800 */
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .mp-sidebar::-webkit-scrollbar { width: 3px; }
        .mp-sidebar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

        @media (max-width: 1023px) {
          .mp-sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            z-index: 40;
            border-radius: 0 1rem 1rem 0;
            width: 300px;
            max-height: 100vh;
            padding: 1.25rem;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .mp-sidebar-open {
            transform: translateX(0);
            box-shadow: 4px 0 24px rgba(0,0,0,0.15);
          }
        }

        /* ── Filter group ── */
        .mp-filter-group {
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #1e293b;
        }
        .mp-category-list {
          max-height: 11rem;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          padding-right: 2px;
        }
        .mp-category-list::-webkit-scrollbar { width: 4px; }
        .mp-category-list::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .mp-category-list::-webkit-scrollbar-track { background: transparent; }
        .mp-filter-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8; /* text-slate-400 */
          margin-bottom: 0.5rem;
        }
        .mp-filter-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          text-align: left;
          padding: 0.4rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: #cbd5e1; /* text-slate-300 */
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .mp-filter-option:hover { background: #1e293b; color: #f8fafc; }
        .mp-filter-option.active { background: #1e293b; border: 1px solid #334155; color: #f8fafc; font-weight: 600; }

        .mp-radio {
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 2px solid #475569;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .mp-radio.active {
          border-color: #f59e0b; /* amber-500 */
          background: #f59e0b;
          box-shadow: inset 0 0 0 2.5px #1e293b;
        }

        /* ── Price input ── */
        .mp-price-input {
          width: 100%;
          padding: 0.4rem 0.5rem;
          border: 1px solid #334155;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          color: #f8fafc;
          background: #1e293b;
          outline: none;
          transition: border-color 0.15s;
        }
        .mp-price-input:focus { border-color: #f59e0b; }
        .mp-price-input::placeholder { color: #64748b; }

        /* ── Select ── */
        .mp-select {
          width: 100%;
          padding: 0.4rem 0.5rem;
          border: 1px solid #334155;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          color: #f8fafc;
          background: #1e293b;
          outline: none;
          cursor: pointer;
        }
        .mp-select:focus { border-color: #f59e0b; }

        /* ── Sort pills ── */
        .mp-sort-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border-radius: 0.625rem;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
          border: 1px solid #334155;
          background: #1e293b;
          color: #94a3b8;
        }
        .mp-sort-pill:hover {
          border-color: #475569;
          color: #f8fafc;
        }
        .mp-sort-pill.active {
          background: #334155;
          border-color: #475569;
          color: #f8fafc;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }

        /* ── Filter tag ── */
        .mp-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          background: #1e293b;
          border: 1px solid #334155;
          color: #cbd5e1;
          font-size: 0.75rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default Marketplace;