import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Card from '../components/common/Card';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setError('Email là bắt buộc');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtpCode(newOtp);
      setError('');
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerify = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã 6 chữ số');
      return;
    }

    setLoading(true);
    setStatus('verifying');
    setError('');

    try {
      await authService.verifyOtp(email, code);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.');
      // Clear OTP on error
      setOtpCode(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      await authService.resendVerification(email, 'otp');
      setTimeLeft(600); // Reset timer to 10 minutes
      setOtpCode(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
      setError(''); // Clear any previous errors
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Email đã được xác thực
            </h1>
          </div>
          <Card>
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
            Xác thực Email của bạn
          </h1>
          <p className="text-text-secondary">
            Nhập mã 6 chữ số đã được gửi đến {email}
          </p>
        </div>
        <Card>
          <div className="space-y-6">
            {error && <Alert type="error">{error}</Alert>}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3 text-center">
                Mã xác thực
              </label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-border rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 outline-none transition-colors"
                  />
                ))}
              </div>
              {timeLeft > 0 && (
                <p className="text-center text-sm text-text-secondary mt-3">
                  Mã hết hạn sau: <span className="font-medium">{formatTime(timeLeft)}</span>
                </p>
              )}
              {timeLeft === 0 && (
                <p className="text-center text-sm text-red-600 mt-3">
                  Mã đã hết hạn. Vui lòng yêu cầu mã mới.
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleVerify}
              disabled={loading || otpCode.join('').length !== 6 || timeLeft === 0}
            >
              {loading ? <Loading size="sm" /> : 'Xác thực mã'}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/login')}
              >
                Quay lại Đăng nhập
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleResend}
                disabled={resendLoading || timeLeft > 0}
              >
                {resendLoading ? <Loading size="sm" /> : 'Gửi lại mã'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOtp;
