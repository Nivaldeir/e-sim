"use client";

import { usePermissions } from "@/src/shared/hook/use-permissions";
import { ReactNode } from "react";

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
  } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = checkPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? checkAllPermissions(permissions)
      : checkAnyPermission(permissions);
  } else if (role) {
    hasAccess = checkRole(role);
  } else if (roles) {
    hasAccess = checkAnyRole(roles);
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

