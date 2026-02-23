const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: '0', label: 'Nháp' },
  { value: '1', label: 'Đang diễn ra' },
  { value: '2', label: 'Chờ xử lý' },
  { value: '3', label: 'Hoàn thành' },
  { value: '4', label: 'Đã hủy' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'priceDesc', label: 'Giá cao → thấp' },
  { value: 'priceAsc', label: 'Giá thấp → cao' },
  { value: 'bidsDesc', label: 'Nhiều lượt đấu giá nhất' },
  { value: 'endSoon', label: 'Sắp kết thúc' },
];

const AuctionFilters = ({
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  keyword,
  onKeywordChange,
  totalCount,
  showKeyword = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-stretch sm:items-center mb-6 p-4 bg-background-primary rounded-lg border border-border-primary">
      <div className="flex flex-wrap gap-4 items-center flex-1">
        <div className="min-w-[160px]">
          <label className="block text-xs font-medium text-text-secondary mb-1">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs font-medium text-text-secondary mb-1">Sắp xếp</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {showKeyword && (
          <div className="min-w-[200px] flex-1">
            <label className="block text-xs font-medium text-text-secondary mb-1">Tìm theo tên</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="Tìm trong đấu giá của tôi..."
              className="w-full px-3 py-2 border border-border-primary rounded-md bg-background-primary text-text-primary text-sm"
            />
          </div>
        )}
      </div>
      {totalCount !== undefined && (
        <div className="text-sm text-text-secondary self-center">
          <span className="font-medium text-text-primary">{totalCount}</span> đấu giá
        </div>
      )}
    </div>
  );
};

export default AuctionFilters;
export { STATUS_OPTIONS, SORT_OPTIONS };
