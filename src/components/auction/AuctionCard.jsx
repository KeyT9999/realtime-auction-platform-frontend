import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Button from '../common/Button';

const AuctionCard = ({ auction }) => {
  if (!auction) return null;
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isEndingSoon, setIsEndingSoon] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const endTime = new Date(auction.endTime);
      const createdAt = new Date(auction.createdAt);
      const diffMs = endTime - now;

      // Check if new (created within 24h)
      const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
      setIsNew(hoursSinceCreated < 24);

      if (diffMs <= 0) {
        setTimeRemaining('Đã kết thúc');
        setIsEndingSoon(false);
        return;
      }

      // Check if ending soon (< 1 hour)
      const hoursRemaining = diffMs / (1000 * 60 * 60);
      setIsEndingSoon(hoursRemaining < 1);

      // Calculate days, hours, minutes, seconds
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days} ngày ${hours} giờ`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} giờ ${minutes} phút`);
      } else {
        setTimeRemaining(`${minutes} phút ${seconds} giây`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime, auction.createdAt]);

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Nháp',
      1: 'Đang diễn ra',
      2: 'Chờ xử lý',
      3: 'Hoàn thành',
      4: 'Đã hủy',
    };
    return statusMap[status] || 'Không xác định';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: 'bg-gray-100 text-gray-800',
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 -m-6 mb-4">
        {auction.images && auction.images.length > 0 ? (
          <img
            src={auction.images[0]}
            alt={auction.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary">
            Không có ảnh
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(auction.status)}`}>
            {getStatusText(auction.status)}
          </span>
          {isEndingSoon && auction.status === 1 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white animate-pulse">
              Sắp kết thúc!
            </span>
          )}
          {isNew && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
              Mới
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-text-primary line-clamp-2 min-h-[3.5rem]">
          {auction.title}
        </h3>

        {auction.categoryName && (
          <p className="text-xs text-text-secondary">
            📂 {auction.categoryName}
          </p>
        )}

        {/* Price info */}
        <div className="border-t border-border-primary pt-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-text-secondary">Giá hiện tại</span>
            <span className="text-2xl font-bold text-primary-blue">
              {auction.currentPrice.toLocaleString('vi-VN')} ₫
            </span>
          </div>
          
          {auction.bidCount > 0 && (
            <p className="text-xs text-text-secondary">
              🔨 {auction.bidCount} lượt đặt giá
            </p>
          )}
        </div>

        {/* Countdown */}
        <div className={`text-center py-2 rounded-md ${
          isEndingSoon ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-text-secondary'
        }`}>
          <div className="text-xs mb-1">
            {auction.status === 1 ? '⏱️ Còn lại' : '📅 Thời gian'}
          </div>
          <div className={`font-semibold ${isEndingSoon ? 'text-red-600' : ''}`}>
            {timeRemaining}
          </div>
        </div>

        {/* Action button */}
        <Link to={`/auctions/${auction.id}`}>
          <Button variant="primary" className="w-full">
            {auction.status === 1 ? 'Đặt giá ngay' : 'Xem chi tiết'}
          </Button>
        </Link>
      </div>
    </Card>
  );
};

AuctionCard.propTypes = {
  auction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    images: PropTypes.array,
    currentPrice: PropTypes.number.isRequired,
    bidCount: PropTypes.number,
    endTime: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,
    categoryName: PropTypes.string,
  }).isRequired,
};

export default AuctionCard;
