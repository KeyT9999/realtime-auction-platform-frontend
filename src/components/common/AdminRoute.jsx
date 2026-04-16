// Mục đích tệp: Trien khai logic/chuc nang chinh cua file AdminRoute.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';
import Loading from './Loading';

const AdminRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  const { isAdmin } = useRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
