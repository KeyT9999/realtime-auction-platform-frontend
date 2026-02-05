import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../common/Card';
import Loading from '../common/Loading';

const UserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getUserStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Tổng số người dùng',
      value: stats.totalUsers,
      color: 'bg-primary-blue',
      icon: '👥',
    },
    {
      title: 'Người dùng hoạt động',
      value: stats.activeUsers,
      color: 'bg-emerald-500',
      icon: '✅',
    },
    {
      title: 'Người dùng bị khóa',
      value: stats.lockedUsers,
      color: 'bg-red-500',
      icon: '🔒',
    },
    {
      title: 'Người dùng quản trị',
      value: stats.adminUsers,
      color: 'bg-purple-500',
      icon: '👑',
    },
    {
      title: 'Người dùng thường',
      value: stats.regularUsers,
      color: 'bg-blue-500',
      icon: '👤',
    },
    {
      title: 'Người dùng đã xác thực',
      value: stats.verifiedUsers,
      color: 'bg-green-500',
      icon: '✓',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{stat.title}</p>
              <p className={`text-3xl font-bold ${stat.color.replace('bg-', 'text-')}`}>
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} text-white rounded-full p-4 text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UserStats;
