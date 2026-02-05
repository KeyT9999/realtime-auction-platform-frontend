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
      setError('Token xác thực không hợp lệ');
    }
  }, [token]);

  const verifyEmail = async () => {
    setLoading(true);
    try {
      await authService.verifyEmail(token);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Xác thực email thất bại. Token có thể đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // This would need email from somewhere - for now just show message
      setError('Vui lòng sử dụng liên kết gửi lại xác thực từ email của bạn hoặc liên hệ hỗ trợ.');
  };

  if (status === 'verifying' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center py-8">
              <Loading size="lg" />
              <p className="mt-4 text-text-secondary">Đang xác thực email của bạn...</p>
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
            Xác thực Email
          </h1>
        </div>
        <Card>
          {status === 'success' ? (
            <div className="space-y-4">
              <Alert type="success">
                Email đã được xác thực thành công! Bạn có thể đăng nhập vào tài khoản của mình.
              </Alert>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Đến trang Đăng nhập
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
                  Quay lại Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleResend}
                >
                  Gửi lại xác thực
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
