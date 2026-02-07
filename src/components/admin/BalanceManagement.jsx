import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import { adminService } from '../../services/adminService';

const BalanceManagement = ({ userId, currentBalance, onBalanceUpdated }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddBalance = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await adminService.addBalance(userId, {
                amount: parseFloat(amount),
                reason: reason || undefined
            });

            setSuccess(`Đã nạp ${parseFloat(amount).toLocaleString('vi-VN')} ₫ vào tài khoản`);
            setAmount('');
            setReason('');

            if (onBalanceUpdated) {
                onBalanceUpdated(response);
            }
        } catch (err) {
            setError(err.message || 'Không thể nạp tiền');
        } finally {
            setLoading(false);
        }
    };

    const handleSubtractBalance = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (parseFloat(amount) > currentBalance) {
            setError('Số tiền trừ vượt quá số dư hiện tại');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await adminService.subtractBalance(userId, {
                amount: parseFloat(amount),
                reason: reason || undefined
            });

            setSuccess(`Đã trừ ${parseFloat(amount).toLocaleString('vi-VN')} ₫ từ tài khoản`);
            setAmount('');
            setReason('');

            if (onBalanceUpdated) {
                onBalanceUpdated(response);
            }
        } catch (err) {
            setError(err.message || 'Không thể trừ tiền');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quản lý số dư</h4>

            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    type="number"
                    label="Số tiền (₫)"
                    placeholder="Nhập số tiền..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="1000"
                />
                <Input
                    type="text"
                    label="Lý do (tùy chọn)"
                    placeholder="Nhập lý do..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <Button
                    variant="primary"
                    onClick={handleAddBalance}
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Nạp tiền'}
                </Button>
                <Button
                    variant="danger"
                    onClick={handleSubtractBalance}
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Trừ tiền'}
                </Button>
            </div>
        </div>
    );
};

BalanceManagement.propTypes = {
    userId: PropTypes.string.isRequired,
    currentBalance: PropTypes.number.isRequired,
    onBalanceUpdated: PropTypes.func
};

export default BalanceManagement;
