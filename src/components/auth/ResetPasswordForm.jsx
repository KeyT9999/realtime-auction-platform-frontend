import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import Loading from '../common/Loading';
import { validatePassword, validatePasswordStrength } from '../../utils/validators';

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
    if (name === 'newPassword') setPasswordStrength(validatePasswordStrength(value));
  };

  const validate = () => {
    const newErrors = {};
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) newErrors.newPassword = passwordValidation.message;
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { setError('Token đặt lại không hợp lệ. Vui lòng yêu cầu liên kết đặt lại mới.'); return; }
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, formData.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-400', 'bg-emerald-500'];

  if (!token) {
    return (
      <div className="space-y-4">
        <Alert type="error">Token đặt lại không hợp lệ. Vui lòng yêu cầu liên kết đặt lại mới.</Alert>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
        </div>
        <Alert type="success">Mật khẩu đã được đặt lại thành công. Đang chuyển đến trang đăng nhập...</Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert type="error">{error}</Alert>}

      <div>
        <Input label="Mật khẩu mới" type="password" name="newPassword" icon="lock" value={formData.newPassword} onChange={handleChange} error={errors.newPassword} placeholder="Nhập mật khẩu mới" required />
        {passwordStrength && formData.newPassword && (
          <div className="mt-2.5">
            <div className="flex gap-1 mb-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors ${level <= passwordStrength.score ? strengthColors[passwordStrength.score - 1] : 'bg-slate-200'}`} />
              ))}
            </div>
            <p className="text-xs text-slate-500">Độ mạnh mật khẩu: {passwordStrength.score}/5</p>
          </div>
        )}
      </div>

      <Input label="Xác nhận mật khẩu" type="password" name="confirmPassword" icon="lock" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Xác nhận mật khẩu mới" required />

      <Button type="submit" variant="primary" disabled={loading} className="w-full py-3.5">
        {loading ? <Loading size="sm" /> : (
          <>
            <span className="material-symbols-outlined text-lg">lock_reset</span>
            Đặt lại mật khẩu
          </>
        )}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
