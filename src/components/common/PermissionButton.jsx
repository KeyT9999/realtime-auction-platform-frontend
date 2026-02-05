import Button from './Button';
import RoleGuard from './RoleGuard';

const PermissionButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  allowedRoles = [],
  requireAdmin = false,
  requireUser = false,
  ...props 
}) => {
  return (
    <RoleGuard 
      allowedRoles={allowedRoles}
      requireAdmin={requireAdmin}
      requireUser={requireUser}
    >
      <Button variant={variant} onClick={onClick} {...props}>
        {children}
      </Button>
    </RoleGuard>
  );
};

export default PermissionButton;
