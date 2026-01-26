import { useAuth } from '../contexts/AuthContext';
import { isAdmin, isUser, hasPermission, ROLES } from '../utils/roleUtils';

export const useRole = () => {
  const { user } = useAuth();

  const userRole = user?.role || 'User';

  return {
    role: userRole,
    isAdmin: isAdmin(userRole),
    isUser: isUser(userRole),
    hasPermission: (requiredRole) => hasPermission(userRole, requiredRole),
    ROLES,
  };
};
