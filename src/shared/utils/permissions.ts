export type Permission = string;
export type Role = string;

export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
}

export function hasPermission(
  userPermissions: UserPermissions,
  requiredPermission: Permission
): boolean {
  if (!userPermissions || !userPermissions.permissions) {
    return false;
  }

  if (userPermissions.permissions.includes("admin")) {
    return true;
  }

  return userPermissions.permissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userPermissions: UserPermissions,
  requiredPermissions: Permission[]
): boolean {
  if (!userPermissions || !userPermissions.permissions) {
    return false;
  }

  if (userPermissions.permissions.includes("admin")) {
    return true;
  }

  return requiredPermissions.some((perm) =>
    userPermissions.permissions.includes(perm)
  );
}

export function hasAllPermissions(
  userPermissions: UserPermissions,
  requiredPermissions: Permission[]
): boolean {
  if (!userPermissions || !userPermissions.permissions) {
    return false;
  }

  if (userPermissions.permissions.includes("admin")) {
    return true;
  }

  return requiredPermissions.every((perm) =>
    userPermissions.permissions.includes(perm)
  );
}

export function hasRole(
  userPermissions: UserPermissions,
  requiredRole: Role
): boolean {
  if (!userPermissions || !userPermissions.roles) {
    return false;
  }

  return userPermissions.roles.includes(requiredRole);
}

export function hasAnyRole(
  userPermissions: UserPermissions,
  requiredRoles: Role[]
): boolean {
  if (!userPermissions || !userPermissions.roles) {
    return false;
  }

  return requiredRoles.some((role) => userPermissions.roles.includes(role));
}

