import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="bg-primary p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-white text-xl">gavel</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Vela</h2>
          </Link>
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-amber-600 text-3xl">lock_reset</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Quên mật khẩu
          </h1>
          <p className="text-slate-500">Nhập email để nhận mã đặt lại mật khẩu</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
