import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';

const BulkActionsModal = ({ isOpen, onClose, selectedCount, action, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [role, setRole] = useState('User');

    const handleSubmit = () => {
        if (action === 'lock') {
            onConfirm(reason || null);
        } else if (action === 'role') {
            onConfirm(role);
        } else {
            onConfirm();
        }
        setReason('');
        setRole('User');
    };

    const getTitle = () => {
        switch (action) {
            case 'lock':
                return `Khóa ${selectedCount} người dùng`;
            case 'unlock':
                return `Mở khóa ${selectedCount} người dùng`;
            case 'delete':
                return `Xóa ${selectedCount} người dùng`;
            case 'role':
                return `Thay đổi vai trò ${selectedCount} người dùng`;
            default:
                return 'Xác nhận';
        }
    };

    const getMessage = () => {
        switch (action) {
            case 'lock':
                return 'Bạn có chắc chắn muốn khóa những người dùng đã chọn?';
            case 'unlock':
                return 'Bạn có chắc chắn muốn mở khóa những người dùng đã chọn?';
            case 'delete':
                return 'Bạn có chắc chắn muốn xóa những người dùng đã chọn? Hành động này không thể hoàn tác.';
            case 'role':
                return 'Chọn vai trò mới cho những người dùng đã chọn:';
            default:
                return '';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
            <div className="space-y-4">
                <p className="text-text-primary">{getMessage()}</p>

                {action === 'lock' && (
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                            Lý do khóa (tùy chọn)
                        </label>
                        <Input
                            id="reason"
                            type="text"
                            placeholder="Nhập lý do khóa..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                )}

                {action === 'role' && (
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                            Vai trò mới
                        </label>
                        <select
                            id="role"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="User">Người dùng</option>
                            <option value="Admin">Quản trị viên</option>
                        </select>
                    </div>
                )}

                <div className="flex gap-2 justify-end pt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        variant={action === 'delete' ? 'danger' : 'primary'}
                        onClick={handleSubmit}
                    >
                        Xác nhận
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

BulkActionsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedCount: PropTypes.number.isRequired,
    action: PropTypes.oneOf(['lock', 'unlock', 'delete', 'role']),
    onConfirm: PropTypes.func.isRequired,
};

export default BulkActionsModal;
