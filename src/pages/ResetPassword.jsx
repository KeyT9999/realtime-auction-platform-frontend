import { Link } from 'react-router-dom';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

const ResetPassword = () => {
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
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">password</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Đặt lại mật khẩu
          </h1>
          <p className="text-slate-500">Nhập mật khẩu mới của bạn</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
