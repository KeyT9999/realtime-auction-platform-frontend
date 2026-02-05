import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import Loading from '../common/Loading';
import { validateEmail } from '../../utils/validators';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email là bắt buộc');
      return;
    }

    if (!validateEmail(email)) {
      setError('Định dạng email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Không thể gửi email đặt lại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <Alert type="success">
          Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi đến email của bạn.
        </Alert>
        <div className="text-center">
          <Link to="/login" className="text-primary-blue hover:underline">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}

      <p className="text-sm text-text-secondary">
        Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
      </p>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Nhập email của bạn"
        required
      />

      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? <Loading size="sm" /> : 'Gửi liên kết đặt lại'}
      </Button>

      <div className="text-center text-sm text-text-secondary">
        Nhớ mật khẩu của bạn?{' '}
        <Link to="/login" className="text-primary-blue hover:underline font-medium">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
