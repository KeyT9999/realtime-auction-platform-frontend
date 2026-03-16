import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { captchaService } from '../../services/captchaService';
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
    if (!nameValidation.isValid) newErrors.fullName = nameValidation.message;
    if (!formData.email) newErrors.email = 'Email là bắt buộc';
    else if (!validateEmail(formData.email)) newErrors.email = 'Định dạng email không hợp lệ';
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.message;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      // Get CAPTCHA token
      const captchaToken = await captchaService.execute('register');

      const response = await register(formData.fullName, formData.email, formData.password, formData.verificationMethod, captchaToken);
      if (onRegisterSuccess) {
        onRegisterSuccess(formData.verificationMethod, formData.email, response.emailSent, response.message);
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
    try { await googleLogin(idToken); } catch (err) { setError(err.message || 'Đăng ký Google thất bại.'); } finally { setLoading(false); }
  };

  const handleGoogleError = (err) => {
    setError(err.message || 'Đăng nhập Google thất bại.');
  };

  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-400', 'bg-emerald-500'];
  const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert type="error">{error}</Alert>}

      <Input label="Họ và tên" type="text" name="fullName" icon="person" value={formData.fullName} onChange={handleChange} error={errors.fullName} placeholder="Nhập họ và tên" required />

      <Input label="Email" type="email" name="email" icon="mail" value={formData.email} onChange={handleChange} error={errors.email} placeholder="Nhập email của bạn" required />

      <div>
        <Input label="Mật khẩu" type="password" name="password" icon="lock" value={formData.password} onChange={handleChange} error={errors.password} placeholder="Nhập mật khẩu" required />
        {passwordStrength && formData.password && (
          <div className="mt-2.5">
            <div className="flex gap-1 mb-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    level <= passwordStrength.score ? strengthColors[passwordStrength.score - 1] : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Độ mạnh: <span className="font-semibold">{strengthLabels[passwordStrength.score - 1] || 'N/A'}</span>
            </p>
          </div>
        )}
      </div>

      <Input label="Xác nhận mật khẩu" type="password" name="confirmPassword" icon="lock" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Xác nhận mật khẩu" required />

      {/* Verification Method */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Phương thức xác thực
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.verificationMethod === 'link' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-slate-200 hover:border-slate-300'}`}>
            <input type="radio" name="verificationMethod" value="link" checked={formData.verificationMethod === 'link'} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary" />
            <div>
              <span className="text-sm font-semibold text-slate-700 block">Liên kết</span>
              <span className="text-xs text-slate-400">Qua email link</span>
            </div>
          </label>
          <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.verificationMethod === 'otp' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-slate-200 hover:border-slate-300'}`}>
            <input type="radio" name="verificationMethod" value="otp" checked={formData.verificationMethod === 'otp'} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary" />
            <div>
              <span className="text-sm font-semibold text-slate-700 block">Mã OTP</span>
              <span className="text-xs text-slate-400">6 chữ số</span>
            </div>
          </label>
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={loading} className="w-full py-3.5">
        {loading ? <Loading size="sm" /> : (
          <>
            <span className="material-symbols-outlined text-lg">person_add</span>
            Đăng ký
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

export default RegisterForm;
