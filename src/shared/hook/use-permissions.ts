"use client";

import { useSession } from "next-auth/react";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  type UserPermissions,
} from "@/src/shared/utils/permissions";

export function usePermissions() {
  const { data: session } = useSession();

  const userPermissions: UserPermissions = {
    roles: (session?.user as any)?.roles || [],
    permissions: (session?.user as any)?.permissions || [],
  };

  return {
    permissions: userPermissions.permissions,
    roles: userPermissions.roles,
    hasPermission: (permission: string) =>
      hasPermission(userPermissions, permission),
    hasAnyPermission: (permissions: string[]) =>
      hasAnyPermission(userPermissions, permissions),
    hasAllPermissions: (permissions: string[]) =>
      hasAllPermissions(userPermissions, permissions),
    hasRole: (role: string) => hasRole(userPermissions, role),
    hasAnyRole: (roles: string[]) => hasAnyRole(userPermissions, roles),
    isAdmin: () => hasPermission(userPermissions, "admin"),
  };
}

