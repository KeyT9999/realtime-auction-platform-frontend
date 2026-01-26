import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          Dashboard
        </h1>
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Welcome, {user?.fullName || 'User'}!
            </h2>
            <p className="text-text-secondary">
              This is your dashboard. Auction features will be available here soon.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
