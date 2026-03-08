import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import Loading from '../common/Loading';
import GoogleAuthButton from './GoogleAuthButton';
import { validateEmail } from '../../utils/validators';

const LoginForm = () => {
  const { login, googleLogin } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setLoading(true);
    setError('');
    try {
      await googleLogin(idToken);
    } catch (err) {
      setError(err.message || 'Đăng nhập Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    setError(err.message || 'Đăng nhập Google thất bại.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert type="error">{error}</Alert>}

      <Input
        label="Email"
        type="email"
        name="email"
        icon="mail"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Nhập email của bạn"
        required
      />

      <Input
        label="Mật khẩu"
        type="password"
        name="password"
        icon="lock"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Nhập mật khẩu của bạn"
        required
      />

      <div className="flex items-center justify-end">
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:text-primary-700 font-semibold transition-colors"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <Button type="submit" variant="primary" disabled={loading} className="w-full py-3.5">
        {loading ? <Loading size="sm" /> : (
          <>
            <span className="material-symbols-outlined text-lg">login</span>
            Đăng nhập
          </>
        )}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-400 font-medium">Hoặc tiếp tục với</span>
        </div>
      </div>

      <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
    </form>
  );
};

export default LoginForm;
