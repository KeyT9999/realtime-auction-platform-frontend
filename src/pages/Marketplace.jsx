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

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadAuctions(); }, [filters, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAuctions({ ...filters, page: currentPage, pageSize });
      if (Array.isArray(data)) {
        setAuctions(data);
        setTotalCount(data.length);
        setTotalPages(1);
      } else {
        setAuctions(data.items || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
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
    setFilters({ keyword: '', categoryId: '', minPrice: '', maxPrice: '', timeFilter: '', sortBy: 'startTime', sortOrder: 'desc' });
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

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">🏷️ Marketplace Đấu Giá</h1>
          <p className="text-blue-100">Tìm kiếm và tham gia các phiên đấu giá hấp dẫn</p>

          {/* Search */}
          <div className="mt-5 flex gap-2 max-w-xl">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm đấu giá..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-sm whitespace-nowrap"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700">🔧 Bộ lọc</h2>
                <button onClick={clearFilters} className="text-xs text-blue-500 hover:text-blue-700 font-semibold">
                  Xóa tất cả
                </button>
              </div>

              <div className="p-4 space-y-5">
                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Danh mục</label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Tất cả</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Khoảng giá (VND)</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Giá tối thiểu"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-[10px] text-gray-400 font-medium">đến</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <input
                      type="number"
                      placeholder="Giá tối đa"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Time Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Thời gian</label>
                  <div className="space-y-1">
                    {timeOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm ${filters.timeFilter === opt.value
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'hover:bg-gray-50 text-gray-600'
                          }`}
                      >
                        <input
                          type="radio"
                          name="timeFilter"
                          value={opt.value}
                          checked={filters.timeFilter === opt.value}
                          onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
                          className="accent-blue-600"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-3">
            {/* Sort bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                Tìm thấy <span className="font-bold text-gray-800">{totalCount}</span> đấu giá
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Sắp xếp:</span>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy, sortOrder });
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="startTime-desc">Mới nhất</option>
                  <option value="startTime-asc">Cũ nhất</option>
                  <option value="currentPrice-asc">Giá thấp → cao</option>
                  <option value="currentPrice-desc">Giá cao → thấp</option>
                  <option value="endTime-asc">Sắp kết thúc</option>
                  <option value="popular-desc">Phổ biến nhất</option>
                </select>
              </div>
            </div>

            {loading && <Loading />}
            {error && <Alert type="error" message={error} />}

            {!loading && !error && (
              <>
                {auctions.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
                    <div className="text-6xl mb-3">🔍</div>
                    <p className="text-gray-700 font-bold text-lg">Không tìm thấy đấu giá nào</p>
                    <p className="text-gray-400 text-sm mt-1 mb-4">Thử thay đổi bộ lọc hoặc từ khóa</p>
                    <button
                      onClick={clearFilters}
                      className="px-5 py-2 bg-blue-600 text-white text-sm rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {auctions.map((auction) => (
                      <AuctionCard key={auction.id} auction={auction} />
                    ))}
                  </div>
                )}

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
