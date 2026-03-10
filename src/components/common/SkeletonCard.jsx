const SkeletonCard = ({ className = '' }) => (
  <div className={`rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm animate-pulse ${className}`}>
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-1/3 mt-4" />
    </div>
  </div>
);

export default SkeletonCard;
