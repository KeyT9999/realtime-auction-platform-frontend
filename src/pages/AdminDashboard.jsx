import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import UserStats from '../components/admin/UserStats';
import Button from '../components/common/Button';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Bảng điều khiển Quản trị</h1>
          <Link to="/admin/users">
            <Button variant="primary">Quản lý Người dùng</Button>
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link to="/admin/users">
              <Button variant="primary">Manage Users</Button>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Thống kê</h2>
          <UserStats />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Thao tác nhanh</h3>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Marketplace Management</h3>
            <div className="space-y-2">
              <Link to="/admin/categories">
                <Button variant="outline" className="w-full justify-start">
                  📂 Manage Categories
                </Button>
              </Link>
              <Link to="/admin/products">
                <Button variant="outline" className="w-full justify-start">
                  📦 Product Approvals
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  👥 Quản lý Người dùng
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Thông tin Hệ thống</h3>
            <p className="text-sm text-text-secondary">
              Chào mừng đến Bảng điều khiển Quản trị. Sử dụng điều hướng ở trên để quản lý người dùng và xem thống kê hệ thống.
              Welcome to the Admin Dashboard. Manage categories, approve products, and oversee the platform.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
