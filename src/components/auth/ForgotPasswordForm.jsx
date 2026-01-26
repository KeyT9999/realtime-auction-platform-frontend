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
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <Alert type="success">
          If the email exists, a password reset link has been sent to your email.
        </Alert>
        <div className="text-center">
          <Link to="/login" className="text-primary-blue hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error">{error}</Alert>}

      <p className="text-sm text-text-secondary">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />

      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? <Loading size="sm" /> : 'Send Reset Link'}
      </Button>

      <div className="text-center text-sm text-text-secondary">
        Remember your password?{' '}
        <Link to="/login" className="text-primary-blue hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
