import { useState } from 'react';
import Button from '../common/Button';
import Loading from '../common/Loading';
import LockUserModal from './LockUserModal';
import ChangeRoleModal from './ChangeRoleModal';
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
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'lock', 'changeRole', 'edit', 'create', 'delete'
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
      <div className="mb-4">
        <Button variant="primary" onClick={() => setActionModal('create')}>
          + Create User
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-border rounded-lg">
          <thead className="bg-background-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-text-secondary">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                    {user.fullName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.isLocked ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Locked
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
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
                        Edit
                      </Button>
                      {user.isLocked ? (
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1"
                          onClick={() => handleUnlock(user.id)}
                        >
                          Unlock
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
                          Lock
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
                        Role
                      </Button>
                      <Button
                        variant="danger"
                        className="text-xs px-2 py-1"
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteConfirm(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
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
        title="Create User"
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
        title="Edit User"
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
        title="Delete User"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text-primary">
            Are you sure you want to delete <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email})?
            This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteConfirm(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserTable;
