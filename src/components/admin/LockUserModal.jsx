import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const LockUserModal = ({ isOpen, onClose, user, onLock }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLock(user.id, reason || null);
      setReason('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to lock user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Lock User" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            {error}
          </div>
        )}

        <div>
          <p className="text-sm text-text-secondary mb-2">
            Are you sure you want to lock <strong>{user?.fullName}</strong> ({user?.email})?
          </p>
        </div>

        <Input
          label="Reason (optional)"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for locking this user"
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={loading}>
            {loading ? 'Locking...' : 'Lock User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LockUserModal;
