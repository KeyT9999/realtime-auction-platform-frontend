import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import Loading from '../common/Loading';
import GoogleAuthButton from './GoogleAuthButton';
import { validateEmail, validatePassword, validateFullName, validatePasswordStrength } from '../../utils/validators';

const RegisterForm = () => {
  const { register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register(formData.fullName, formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
      setError(err.message || 'Google registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    setError(err.message || 'Google sign-in failed.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}

      <Input
        label="Full Name"
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        placeholder="Enter your full name"
        required
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Enter your email"
        required
      />

      <div>
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
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
        placeholder="Confirm your password"
        required
      />

      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? <Loading size="sm" /> : 'Sign Up'}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-text-secondary">Or continue with</span>
        </div>
      </div>

      <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

      <div className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-blue hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
