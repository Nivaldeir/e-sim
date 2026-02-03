export type RouteConfig = {
  path: string;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean;
};

export const routePermissions: Record<string, RouteConfig> = {
  "/dashboard": {
    path: "/dashboard",
    // Rota principal não requer permissão específica, apenas autenticação
  },
  "/dashboard/accesses": {
    path: "/dashboard/accesses",
    permission: "accesses:read",
  },
  "/dashboard/companies": {
    path: "/dashboard/companies",
    permission: "companies:read",
  },
  "/dashboard/establishments": {
    path: "/dashboard/establishments",
    permission: "establishments:read",
  },
  "/dashboard/documents": {
    path: "/dashboard/documents",
    permission: "documents:read",
  },
  "/dashboard/document-types": {
    path: "/dashboard/document-types",
    permission: "documentTypes:read",
  },
  "/dashboard/orgao": {
    path: "/dashboard/orgao",
    permission: "organizations:read",
  },
  "/dashboard/social-reasons": {
    path: "/dashboard/social-reasons",
    permission: "socialReasons:read",
  },
  "/dashboard/files": {
    path: "/dashboard/files",
    permission: "files:read",
  },
};

export function getRouteConfig(pathname: string): RouteConfig | null {
  const exactMatch = routePermissions[pathname];
  if (exactMatch) {
    return exactMatch;
  }

  for (const [route, config] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }

  return null;
}

