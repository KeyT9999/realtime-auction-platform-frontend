import Card from '../components/common/Card';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

const ResetPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Reset Password
          </h1>
          <p className="text-text-secondary">Enter your new password</p>
        </div>
        <Card>
          <ResetPasswordForm />
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
