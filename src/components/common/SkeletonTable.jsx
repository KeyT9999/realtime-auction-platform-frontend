const SkeletonTable = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`overflow-hidden rounded-lg border border-gray-200 bg-white animate-pulse ${className}`}>
    <div className="flex border-b border-gray-200 bg-gray-50 p-3 gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
      ))}
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex p-3 gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 bg-gray-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonTable;
