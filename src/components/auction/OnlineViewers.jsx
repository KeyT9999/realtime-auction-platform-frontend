import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const OnlineViewers = ({ viewerCount }) => {
  const [prevCount, setPrevCount] = useState(viewerCount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (viewerCount !== prevCount) {
      setIsAnimating(true);
      setPrevCount(viewerCount);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [viewerCount, prevCount]);

  const getViewerText = (count) => {
    if (count === 0) return 'Không có người xem';
    if (count === 1) return '1 người đang xem';
    return `${count} người đang xem`;
  };

  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-4 py-2 shadow-sm">
      <div className="relative">
        {/* Eye icon */}
        <svg 
          className="w-5 h-5 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
          />
        </svg>

        {/* Pulse animation when online */}
        {viewerCount > 0 && (
          <span className="absolute top-0 right-0 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </div>

      {/* Viewer count with animation */}
      <span 
        className={`text-sm font-medium text-blue-900 transition-all duration-300 ${
          isAnimating ? 'scale-125 text-blue-600' : 'scale-100'
        }`}
      >
        {getViewerText(viewerCount)}
      </span>

      {/* Tooltip */}
      <div className="group relative">
        <svg 
          className="w-4 h-4 text-blue-400 cursor-help" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
            Số người đang xem đấu giá này
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

OnlineViewers.propTypes = {
  viewerCount: PropTypes.number.isRequired,
};

export default OnlineViewers;
