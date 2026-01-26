import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import UserStats from '../components/admin/UserStats';
import Button from '../components/common/Button';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
          <Link to="/admin/users">
            <Button variant="primary">Manage Users</Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Statistics</h2>
          <UserStats />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  👥 Manage Users
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2">System Information</h3>
            <p className="text-sm text-text-secondary">
              Welcome to the Admin Dashboard. Use the navigation above to manage users and view system statistics.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
