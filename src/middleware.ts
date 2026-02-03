import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getRouteConfig } from "@/src/shared/config/routes";
import {
  hasPermission,
  hasAnyPermission,
  hasRole,
  hasAnyRole,
  type UserPermissions,
} from "@/src/shared/utils/permissions";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rotas públicas e APIs do NextAuth
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth") ||
    pathname === "/" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/document/") ||
    pathname.startsWith("/api/document-attachments/")
  ) {
    return NextResponse.next();
  }

  // Apenas verificar rotas do dashboard
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Verificar autenticação
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Verificar permissões da rota
  const routeConfig = getRouteConfig(pathname);

  if (routeConfig) {
    const userPermissions: UserPermissions = {
      roles: (token.roles as string[]) || [],
      permissions: (token.permissions as string[]) || [],
    };

    let hasAccess = false;

    if (routeConfig.permission) {
      hasAccess = hasPermission(userPermissions, routeConfig.permission);
    } else if (routeConfig.permissions) {
      hasAccess = routeConfig.requireAll
        ? routeConfig.permissions.every((perm) =>
            hasPermission(userPermissions, perm)
          )
        : hasAnyPermission(userPermissions, routeConfig.permissions);
    } else if (routeConfig.role) {
      hasAccess = hasRole(userPermissions, routeConfig.role);
    } else if (routeConfig.roles) {
      hasAccess = hasAnyRole(userPermissions, routeConfig.roles);
    } else {
      hasAccess = true;
    }

    if (!hasAccess) {
      // Se já está na rota /dashboard, não redirecionar novamente para evitar loop
      if (pathname === "/dashboard") {
        return NextResponse.next();
      }
      const url = new URL("/dashboard", request.url);
      url.searchParams.set("error", "access_denied");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

