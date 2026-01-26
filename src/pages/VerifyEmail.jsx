import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Card from '../components/common/Card';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setError('Invalid verification token');
    }
  }, [token]);

  const verifyEmail = async () => {
    setLoading(true);
    try {
      await authService.verifyEmail(token);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Email verification failed. The token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // This would need email from somewhere - for now just show message
    setError('Please use the resend verification link from your email or contact support.');
  };

  if (status === 'verifying' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center py-8">
              <Loading size="lg" />
              <p className="mt-4 text-text-secondary">Verifying your email...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Email Verification
          </h1>
        </div>
        <Card>
          {status === 'success' ? (
            <div className="space-y-4">
              <Alert type="success">
                Email verified successfully! You can now sign in to your account.
              </Alert>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert type="error">{error}</Alert>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleResend}
                >
                  Resend Verification
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
