import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import StatCard from '../components/admin/Dashboard/StatCard';
import RevenueChart from '../components/admin/Dashboard/RevenueChart';
import UserGrowthChart from '../components/admin/Dashboard/UserGrowthChart';
import CategoryDistribution from '../components/admin/Dashboard/CategoryDistribution';
import RecentActivities from '../components/admin/Dashboard/RecentActivities';
import SystemAlerts from '../components/admin/Dashboard/SystemAlerts';
import SkeletonCard from '../components/common/SkeletonCard';
import SkeletonTable from '../components/common/SkeletonTable';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState(null);
  const [alerts, setAlerts] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, chartsData, activitiesData, alertsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getDashboardCharts(),
        adminService.getDashboardActivities(),
        adminService.getDashboardAlerts(),
      ]);

      setStats(statsData);
      setCharts(chartsData);
      setActivities(activitiesData);
      setAlerts(alertsData);
    } catch (_error) {
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="h-9 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-36 bg-gray-200 rounded" />
              <div className="h-10 w-36 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
          <SkeletonTable rows={4} cols={4} className="mb-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header + Quick actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Quản trị</h1>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/withdrawals">
              <Button variant="primary">Quản lý Rút tiền</Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="primary">Người dùng</Button>
            </Link>
            <Link to="/admin/auctions">
              <Button variant="outline">Đấu giá</Button>
            </Link>
            <Link to="/admin/bids">
              <Button variant="outline">Bid</Button>
            </Link>
            <Link to="/admin/categories">
              <Button variant="outline">Danh mục</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="👥"
            label="Tổng người dùng"
            value={stats?.totalUsers || 0}
            trend={stats?.trends?.userGrowthWeek}
            trendLabel="tuần này"
          />
          <StatCard
            icon="🏷️"
            label="Đấu giá đang hoạt động"
            value={stats?.activeAuctions || 0}
            trend={stats?.trends?.auctionGrowthDay}
            trendLabel="hôm nay"
          />
          <StatCard
            icon="💰"
            label="Doanh thu hôm nay"
            value={formatCurrency(stats?.todayRevenue || 0)}
            trend={stats?.trends?.revenueGrowthDay}
            trendLabel="so với hôm qua"
          />
          <StatCard
            icon="⚡"
            label="Bid trong giờ qua"
            value={stats?.bidsInLastHour || 0}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          {charts?.revenueChart && (
            <RevenueChart data={charts.revenueChart} />
          )}

          {/* Category Distribution */}
          {charts?.categoryDistribution && charts.categoryDistribution.length > 0 && (
            <CategoryDistribution data={charts.categoryDistribution} />
          )}

          {/* User Growth */}
          {charts?.userGrowthChart && (
            <UserGrowthChart data={charts.userGrowthChart} />
          )}

          {/* System Alerts */}
          {alerts && (
            <SystemAlerts alerts={alerts} />
          )}
        </div>

        {/* Recent Activities */}
        {activities && (
          <div className="mb-8">
            <RecentActivities activities={activities} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
