import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Create Account
          </h1>
          <p className="text-text-secondary">Sign up to get started</p>
        </div>
        <Card>
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
};

export default Register;
