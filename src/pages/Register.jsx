import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import RegisterForm from '../components/auth/RegisterForm';
import Alert from '../components/common/Alert';

const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRegisterSuccess = (verificationMethod, email) => {
    if (verificationMethod === 'otp') {
      // Redirect to OTP verification page
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } else {
      // Show success message for link verification
      setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email và nhấp vào liên kết xác thực.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Tạo tài khoản
          </h1>
          <p className="text-text-secondary">Đăng ký để bắt đầu</p>
        </div>
        <Card>
          {successMessage && (
            <Alert type="success" className="mb-4">
              {successMessage}
            </Alert>
          )}
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        </Card>
      </div>
    </div>
  );
};

export default Register;
