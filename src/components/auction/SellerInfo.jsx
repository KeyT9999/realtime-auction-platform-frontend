import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { userService } from '../../services/userService';
import Card from '../common/Card';

const SellerInfo = ({ sellerId, sellerName }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await userService.getSellerStats(sellerId);
        setStats(data);
      } catch (error) {
        console.error('Error fetching seller stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchStats();
    }
  }, [sellerId]);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const getAvatarInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinedDate = (date) => {
    const joinDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} ngày`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} năm`;
    }
  };

  const getRatingStars = (rating) => {
    // Default to 5 stars if no rating system yet
    const stars = rating || 5;
    return '⭐'.repeat(stars);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-border-primary">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {getAvatarInitials(sellerName)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary text-lg">{sellerName || 'Người bán'}</h3>
            <p className="text-xs text-text-secondary">Người bán</p>
          </div>
        </div>

        {/* Rating (placeholder for future) */}
        {stats.averageRating !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xl">{getRatingStars(stats.averageRating)}</span>
            <span className="text-sm text-text-secondary">
              ({stats.averageRating?.toFixed(1) || 'N/A'})
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">📦</span>
              <span className="text-sm text-text-secondary">Tổng đấu giá</span>
            </div>
            <span className="font-semibold text-text-primary">{stats.totalAuctions}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-text-secondary">Đã hoàn thành</span>
            </div>
            <span className="font-semibold text-green-600">{stats.completedAuctions}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">🔥</span>
              <span className="text-sm text-text-secondary">Đang hoạt động</span>
            </div>
            <span className="font-semibold text-orange-600">{stats.activeAuctions}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-purple-500">📊</span>
              <span className="text-sm text-text-secondary">Tỷ lệ hoàn thành</span>
            </div>
            <span className="font-semibold text-purple-600">{stats.completionRate}%</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📅</span>
              <span className="text-sm text-text-secondary">Tham gia</span>
            </div>
            <span className="font-semibold text-text-primary">
              {formatJoinedDate(stats.joinedDate)}
            </span>
          </div>
        </div>

        {/* Trust Badge */}
        {stats.completionRate >= 80 && stats.totalAuctions >= 10 && (
          <div className="mt-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-xs font-semibold text-green-800">Người bán uy tín</p>
          </div>
        )}

        {stats.totalAuctions === 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🆕</div>
            <p className="text-xs font-semibold text-blue-700">Người bán mới</p>
          </div>
        )}
      </div>
    </Card>
  );
};

SellerInfo.propTypes = {
  sellerId: PropTypes.string.isRequired,
  sellerName: PropTypes.string,
};

export default SellerInfo;
