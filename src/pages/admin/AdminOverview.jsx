// Mục đích tệp: Trien khai logic/chuc nang chinh cua file AdminOverview.
import { useState, useEffect } from 'react';
import { auctionService } from '../../services/auctionService';
import { bidService } from '../../services/bidService';
import { watchlistService } from '../../services/watchlistService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    auctions: null,
    bids: null,
    watchlists: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [auctionStats, bidStats, watchlistStats] = await Promise.all([
        auctionService.getAuctionStats(),
        bidService.getBidStats(),
        watchlistService.getWatchlistStats(),
      ]);
      setStats({ auctions: auctionStats, bids: bidStats, watchlists: watchlistStats });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Tổng quan Quản trị</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <h3 className="text-sm font-medium text-slate-400 mb-2">Tổng số đấu giá</h3>
            <p className="text-3xl font-bold text-amber-500">
              {stats.auctions?.totalAuctions || 0}
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-slate-400 mb-2">Đấu giá đang diễn ra</h3>
            <p className="text-3xl font-bold text-emerald-500">
              {stats.auctions?.activeAuctions || 0}
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-slate-400 mb-2">Tổng số lượt đấu giá</h3>
            <p className="text-3xl font-bold text-amber-500">
              {stats.bids?.totalBids || 0}
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-slate-400 mb-2">Tổng danh sách theo dõi</h3>
            <p className="text-3xl font-bold text-amber-500">
              {stats.watchlists?.totalWatchlists || 0}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">Thống kê Đấu giá</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Nháp:</span>
                <span className="text-white font-semibold">{stats.auctions?.draftAuctions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Đã lên lịch:</span>
                <span className="text-white font-semibold">{stats.auctions?.pendingAuctions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hoàn thành:</span>
                <span className="text-white font-semibold">{stats.auctions?.completedAuctions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Đã hủy:</span>
                <span className="text-white font-semibold">{stats.auctions?.cancelledAuctions || 0}</span>
              </div>
              {stats.auctions?.totalRevenue && (
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-400 font-semibold">Tổng doanh thu:</span>
                  <span className="text-amber-500 font-bold">{stats.auctions.totalRevenue.toLocaleString('vi-VN')} VND</span>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">Thống kê Đấu giá</h2>
            <div className="space-y-2">
              {stats.bids?.highestBid && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Giá đấu cao nhất:</span>
                  <span className="text-white font-semibold">{stats.bids.highestBid.toLocaleString('vi-VN')} VND</span>
                </div>
              )}
              {stats.bids?.averageBid && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Giá đấu trung bình:</span>
                  <span className="text-white font-semibold">{Math.round(stats.bids.averageBid).toLocaleString('vi-VN')} VND</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Đấu giá hôm nay:</span>
                <span className="text-white font-semibold">{stats.bids?.bidsToday || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Đấu giá tuần này:</span>
                <span className="text-white font-semibold">{stats.bids?.bidsThisWeek || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Đấu giá tháng này:</span>
                <span className="text-white font-semibold">{stats.bids?.bidsThisMonth || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
