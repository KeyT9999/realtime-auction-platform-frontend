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

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
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

    if (name === 'newPassword') {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const validate = () => {
    const newErrors = {};

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.message;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid reset token. Please request a new reset link.');
      return;
    }

    if (!validate()) return;

    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, formData.newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <Alert type="error">Invalid reset token. Please request a new reset link.</Alert>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Alert type="success">Password has been reset successfully. Redirecting to login...</Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}

      <div>
        <Input
          label="New Password"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          placeholder="Enter your new password"
          required
        />
        {passwordStrength && formData.newPassword && (
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
              Password strength: {passwordStrength.score}/5
            </p>
          </div>
        )}
      </div>

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Confirm your new password"
        required
      />

      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? <Loading size="sm" /> : 'Reset Password'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
