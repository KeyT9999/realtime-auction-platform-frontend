import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import Loading from '../common/Loading';
import GoogleAuthButton from './GoogleAuthButton';
import { validateEmail, validatePassword, validateFullName, validatePasswordStrength } from '../../utils/validators';

const RegisterForm = ({ onRegisterSuccess }) => {
  const { register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationMethod: 'link',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');

    if (name === 'password') {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameValidation = validateFullName(formData.fullName);
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.message;
    }

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
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
      await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.verificationMethod
      );
      // Call callback with verification method and email for redirect logic
      if (onRegisterSuccess) {
        onRegisterSuccess(formData.verificationMethod, formData.email);
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
      setError(err.message || 'Đăng ký Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (err) => {
      setError(err.message || 'Đăng nhập Google thất bại.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}

      <Input
        label="Họ và tên"
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        placeholder="Nhập họ và tên của bạn"
        required
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Nhập email của bạn"
        required
      />

      <div>
        <Input
          label="Mật khẩu"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Nhập mật khẩu của bạn"
          required
        />
        {passwordStrength && formData.password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    level <= passwordStrength.score
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-text-secondary">
              Độ mạnh mật khẩu: {passwordStrength.score}/5
            </p>
          </div>
        )}
      </div>

      <Input
        label="Xác nhận mật khẩu"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Xác nhận mật khẩu của bạn"
        required
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Phương thức xác thực
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="verificationMethod"
              value="link"
              checked={formData.verificationMethod === 'link'}
              onChange={handleChange}
              className="w-4 h-4 text-primary-blue focus:ring-primary-blue"
            />
            <span className="text-sm text-text-secondary">
              Liên kết xác thực email (nhấp vào liên kết trong email)
            </span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="verificationMethod"
              value="otp"
              checked={formData.verificationMethod === 'otp'}
              onChange={handleChange}
              className="w-4 h-4 text-primary-blue focus:ring-primary-blue"
            />
            <span className="text-sm text-text-secondary">
              Mã xác thực (OTP) - Mã 6 chữ số gửi đến email
            </span>
          </label>
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? <Loading size="sm" /> : 'Đăng ký'}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-text-secondary">Hoặc tiếp tục với</span>
        </div>
      </div>

      <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

      <div className="text-center text-sm text-text-secondary">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary-blue hover:underline font-medium">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
