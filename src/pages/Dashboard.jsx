import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          Bảng điều khiển
        </h1>
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Chào mừng, {user?.fullName || 'Người dùng'}!
            </h2>
            <p className="text-text-secondary">
              Đây là bảng điều khiển của bạn. Các tính năng đấu giá sẽ có sẵn ở đây sớm.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
