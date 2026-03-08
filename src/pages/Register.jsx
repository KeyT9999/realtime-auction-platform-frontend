import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import Alert from '../components/common/Alert';

const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRegisterSuccess = (verificationMethod, email, emailSent = true, message = null) => {
    if (!emailSent) {
      setWarningMessage(message || 'Đăng ký thành công nhưng không thể gửi email xác thực. Vui lòng thử gửi lại sau.');
      setSuccessMessage('Tài khoản đã được tạo thành công!');
      return;
    }
    if (verificationMethod === 'otp') {
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } else {
      setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email và nhấp vào liên kết xác thực.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 right-10 w-80 h-80 bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-white text-2xl">gavel</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Vela</h2>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Bắt đầu hành trình
            <span className="text-primary-500"> đấu giá</span> của bạn
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Đăng ký miễn phí và khám phá hàng nghìn sản phẩm đấu giá độc đáo. Nhanh chóng, an toàn.
          </p>
          <div className="mt-12 space-y-4">
            {[
              { icon: 'verified', text: 'Xác thực tài khoản an toàn' },
              { icon: 'speed', text: 'Đấu giá realtime với độ trễ thấp' },
              { icon: 'lock', text: 'Giao dịch được bảo vệ bởi Escrow' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-500">{item.icon}</span>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="bg-primary p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-white text-xl">gavel</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Vela</h2>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Tạo tài khoản
            </h2>
            <p className="text-slate-500">Đăng ký để bắt đầu đấu giá ngay hôm nay</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
            {warningMessage && (
              <Alert type="warning" className="mb-4">{warningMessage}</Alert>
            )}
            {successMessage && (
              <Alert type="success" className="mb-4">{successMessage}</Alert>
            )}
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary hover:text-primary-700 font-bold">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
