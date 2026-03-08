import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-[150px]"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-white text-2xl">gavel</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Vela</h2>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Trải nghiệm đấu giá
            <span className="text-primary-500"> Realtime</span> chưa từng có
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Tham gia cùng hàng nghìn người dùng trong các đấu giá trực tiếp thú vị. An toàn, nhanh chóng và minh bạch.
          </p>
          <div className="flex items-center gap-8 mt-12">
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold">12.4k+</span>
              <span className="text-slate-400 text-xs uppercase tracking-widest">Người dùng</span>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold">150ms</span>
              <span className="text-slate-400 text-xs uppercase tracking-widest">Độ trễ</span>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold">100%</span>
              <span className="text-slate-400 text-xs uppercase tracking-widest">An toàn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
              Chào mừng trở lại
            </h2>
            <p className="text-slate-500">Đăng nhập vào tài khoản của bạn để tiếp tục</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
            <LoginForm />
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary hover:text-primary-700 font-bold">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
