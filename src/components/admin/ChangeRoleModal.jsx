import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ROLES } from '../../utils/roleUtils';

const ChangeRoleModal = ({ isOpen, onClose, user, onChangeRole }) => {
  const [role, setRole] = useState(user?.role || 'User');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setRole(user.role || 'User');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onChangeRole(user.id, role);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to change role');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change User Role" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            {error}
          </div>
        )}

        <div>
          <p className="text-sm text-text-secondary mb-4">
            Change role for <strong>{user?.fullName}</strong> ({user?.email})
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field"
          >
            <option value={ROLES.USER}>User</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Changing...' : 'Change Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeRoleModal;
