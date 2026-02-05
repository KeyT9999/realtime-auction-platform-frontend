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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">🛒 Buyer Actions</h2>
            <div className="space-y-3">
              <p className="text-text-secondary">Find items you love and start bidding.</p>
              <a href="/marketplace" className="block w-full">
                <div className="bg-primary text-white text-center py-2 rounded hover:bg-primary-dark transition-colors">
                  Browse Marketplace
                </div>
              </a>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">🏷️ Seller Actions</h2>
            <div className="space-y-3">
              <p className="text-text-secondary">Turn your items into cash. List them now.</p>
              <a href="/sell" className="block w-full">
                <div className="border border-primary text-primary text-center py-2 rounded hover:bg-blue-50 transition-colors">
                  Post New Product
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
