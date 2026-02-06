import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Loading from '../common/Loading';
import LockUserModal from './LockUserModal';
import ChangeRoleModal from './ChangeRoleModal';
import BulkActionsModal from './BulkActionsModal';
import Modal from '../common/Modal';
import UserForm from './UserForm';

const UserTable = ({
  users,
  loading,
  onRefresh,
  onDelete,
  onLock,
  onUnlock,
  onChangeRole,
  onCreateUser,
  onUpdateUser,
  onBulkLock,
  onBulkUnlock,
  onBulkDelete,
  onBulkChangeRole,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [actionModal, setActionModal] = useState(null); // 'lock', 'changeRole', 'edit', 'create', 'delete'
  const [bulkModal, setBulkModal] = useState(null); // 'lock', 'unlock', 'delete', 'role'
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Bulk selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isSomeSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  // Bulk action handlers
  const handleBulkAction = async (action, data) => {
    try {
      if (action === 'lock') {
        await onBulkLock(selectedUsers, data);
      } else if (action === 'unlock') {
        await onBulkUnlock(selectedUsers);
      } else if (action === 'delete') {
        await onBulkDelete(selectedUsers);
      } else if (action === 'role') {
        await onBulkChangeRole(selectedUsers, data);
      }
      setSelectedUsers([]);
      setBulkModal(null);
      onRefresh();
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  // Single user handlers
  const handleLock = async (userId, reason) => {
    await onLock(userId, reason);
    setActionModal(null);
    setSelectedUser(null);
    onRefresh();
  };

  const handleUnlock = async (userId) => {
    await onUnlock(userId);
    onRefresh();
  };

  const handleChangeRole = async (userId, role) => {
    await onChangeRole(userId, role);
    setActionModal(null);
    setSelectedUser(null);
    onRefresh();
  };

  const handleDelete = async () => {
    if (selectedUser) {
      await onDelete(selectedUser.id);
      setDeleteConfirm(false);
      setSelectedUser(null);
      onRefresh();
    }
  };

  const handleCreateUser = async (userData) => {
    await onCreateUser(userData);
    setActionModal(null);
    onRefresh();
  };

  const handleUpdateUser = async (userData) => {
    if (selectedUser) {
      await onUpdateUser(selectedUser.id, userData);
      setActionModal(null);
      setSelectedUser(null);
      onRefresh();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="primary" onClick={() => setActionModal('create')}>
          + Tạo người dùng
        </Button>

        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedUsers.length} người dùng đã chọn
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-xs px-3 py-1"
                onClick={() => setBulkModal('lock')}
              >
                Khóa
              </Button>
              <Button
                variant="outline"
                className="text-xs px-3 py-1"
                onClick={() => setBulkModal('unlock')}
              >
                Mở khóa
              </Button>
              <Button
                variant="outline"
                className="text-xs px-3 py-1"
                onClick={() => setBulkModal('role')}
              >
                Đổi vai trò
              </Button>
              <Button
                variant="danger"
                className="text-xs px-3 py-1"
                onClick={() => setBulkModal('delete')}
              >
                Xóa
              </Button>
              <Button
                variant="secondary"
                className="text-xs px-3 py-1"
                onClick={() => setSelectedUsers([])}
              >
                Bỏ chọn
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-border rounded-lg">
          <thead className="bg-background-secondary">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Tên
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-text-secondary">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                    {user.fullName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${user.role === 'Admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {user.role === 'Admin' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.isLocked ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Đã khóa
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">
                        Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-xs px-2 py-1"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionModal('edit');
                        }}
                      >
                        Sửa
                      </Button>
                      {user.isLocked ? (
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1"
                          onClick={() => handleUnlock(user.id)}
                        >
                          Mở khóa
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1"
                          onClick={() => {
                            setSelectedUser(user);
                            setActionModal('lock');
                          }}
                        >
                          Khóa
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="text-xs px-2 py-1"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionModal('changeRole');
                        }}
                      >
                        Vai trò
                      </Button>
                      <Button
                        variant="danger"
                        className="text-xs px-2 py-1"
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteConfirm(true);
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Single user modals */}
      <LockUserModal
        isOpen={actionModal === 'lock'}
        onClose={() => {
          setActionModal(null);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onLock={handleLock}
      />

      <ChangeRoleModal
        isOpen={actionModal === 'changeRole'}
        onClose={() => {
          setActionModal(null);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onChangeRole={handleChangeRole}
      />

      <Modal
        isOpen={actionModal === 'create'}
        onClose={() => setActionModal(null)}
        title="Tạo Người dùng"
        size="lg"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setActionModal(null)}
          loading={false}
        />
      </Modal>

      <Modal
        isOpen={actionModal === 'edit'}
        onClose={() => {
          setActionModal(null);
          setSelectedUser(null);
        }}
        title="Sửa Người dùng"
        size="lg"
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleUpdateUser}
          onCancel={() => {
            setActionModal(null);
            setSelectedUser(null);
          }}
          loading={false}
        />
      </Modal>

      <Modal
        isOpen={deleteConfirm}
        onClose={() => {
          setDeleteConfirm(false);
          setSelectedUser(null);
        }}
        title="Xóa Người dùng"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text-primary">
            Bạn có chắc chắn muốn xóa <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email})?
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteConfirm(false);
                setSelectedUser(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk actions modal */}
      <BulkActionsModal
        isOpen={bulkModal !== null}
        onClose={() => setBulkModal(null)}
        selectedCount={selectedUsers.length}
        action={bulkModal}
        onConfirm={(data) => handleBulkAction(bulkModal, data)}
      />
    </>
  );
};

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onLock: PropTypes.func.isRequired,
  onUnlock: PropTypes.func.isRequired,
  onChangeRole: PropTypes.func.isRequired,
  onCreateUser: PropTypes.func.isRequired,
  onUpdateUser: PropTypes.func.isRequired,
  onBulkLock: PropTypes.func.isRequired,
  onBulkUnlock: PropTypes.func.isRequired,
  onBulkDelete: PropTypes.func.isRequired,
  onBulkChangeRole: PropTypes.func.isRequired,
};

export default UserTable;
