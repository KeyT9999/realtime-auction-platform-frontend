export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
};

export const isAdmin = (role) => {
  return role === ROLES.ADMIN;
};

export const isUser = (role) => {
  return role === ROLES.USER || !role;
};

export const hasPermission = (userRole, requiredRole) => {
  if (requiredRole === ROLES.ADMIN) {
    return isAdmin(userRole);
  }
  return true; // User permissions are default
};
