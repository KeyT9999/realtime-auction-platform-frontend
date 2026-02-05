import { useRole } from '../../hooks/useRole';

const RoleGuard = ({ children, allowedRoles = [], requireAdmin = false, requireUser = false }) => {
  const { role, isAdmin, isUser } = useRole();

  if (requireAdmin && !isAdmin) {
    return null;
  }

  if (requireUser && !isUser) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return null;
  }

  return children;
};

export default RoleGuard;
