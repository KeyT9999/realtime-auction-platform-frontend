import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Card from '../components/common/Card';
import UserTable from '../components/admin/UserTable';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import { ROLES } from '../utils/roleUtils';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const isLocked = statusFilter === 'locked' ? true : statusFilter === 'active' ? false : null;
      const response = await adminService.getUsers(
        page,
        pageSize,
        search || null,
        roleFilter || null,
        isLocked
      );
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      setSuccess('Xóa người dùng thành công');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Không thể xóa người dùng');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLock = async (userId, reason) => {
    try {
      await adminService.lockUser(userId, reason);
      setSuccess('Khóa người dùng thành công');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Không thể khóa người dùng');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUnlock = async (userId) => {
    try {
      await adminService.unlockUser(userId);
      setSuccess('Mở khóa người dùng thành công');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Không thể mở khóa người dùng');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await adminService.changeUserRole(userId, role);
      setSuccess('Thay đổi vai trò người dùng thành công');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Không thể thay đổi vai trò');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await adminService.createUser(userData);
      setSuccess('Tạo người dùng thành công');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Không thể tạo người dùng');
      setTimeout(() => setError(''), 3000);
      throw err;
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await adminService.updateUser(userId, userData);
      setSuccess('Cập nhật người dùng thành công');
      setTimeout(() => setSuccess(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật người dùng');
      setTimeout(() => setError(''), 3000);
      throw err;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Quản lý Người dùng</h1>

        {error && (
          <div className="mb-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        {success && (
          <div className="mb-4">
            <Alert type="success">{success}</Alert>
          </div>
        )}

        <Card className="mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Tìm kiếm"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tên hoặc email..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Vai trò
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="">Tất cả vai trò</option>
                  <option value={ROLES.ADMIN}>Quản trị viên</option>
                  <option value={ROLES.USER}>Người dùng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="locked">Đã khóa</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                Tìm kiếm
              </Button>
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <UserTable
            users={users}
            loading={loading}
            onRefresh={loadUsers}
            onDelete={handleDelete}
            onLock={handleLock}
            onUnlock={handleUnlock}
            onChangeRole={handleChangeRole}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
          />

          {!loading && users.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Trang {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
