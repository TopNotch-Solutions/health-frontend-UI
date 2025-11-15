import { useSelector } from 'react-redux';

/**
 * Custom hook to check user permissions
 * @returns {Object} Permission check functions
 */
export const usePermissions = () => {
  const currentUser = useSelector((state) => state.auth.user);
  
  // Get permissions from current user, default to read-only if not available
  const permissions = currentUser?.permissions || {
    read: true,
    write: false,
    delete: false,
  };

  // Super admin has all permissions
  const isSuperAdmin = currentUser?.role === 'super admin';

  const canRead = () => {
    return isSuperAdmin || permissions.read === true;
  };

  const canWrite = () => {
    return isSuperAdmin || permissions.write === true;
  };

  const canDelete = () => {
    return isSuperAdmin || permissions.delete === true;
  };

  return {
    canRead: canRead(),
    canWrite: canWrite(),
    canDelete: canDelete(),
    permissions,
    isSuperAdmin,
  };
};

export default usePermissions;

