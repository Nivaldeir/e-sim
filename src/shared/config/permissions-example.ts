/**
 * EXEMPLO DE USO DO MIDDLEWARE DE PERMISSÕES
 * 
 * Este arquivo serve como referência de como usar o sistema de permissões.
 */

// ============================================
// 1. USO NO MIDDLEWARE DO NEXT.JS (src/middleware.ts)
// ============================================
// O middleware já está configurado e protege automaticamente as rotas
// definidas em src/shared/config/routes.ts

// ============================================
// 2. USO NO tRPC (Backend)
// ============================================
/*
import { 
  protectedProcedure, 
  createPermissionMiddleware,
  createPermissionsMiddleware,
  createRoleMiddleware,
  router,
} from "@/src/server/trpc/trpc";
import { z } from "zod";

// Exemplo 1: Proteger com uma permissão específica
export const exampleRouter1 = router({
  createDocument: protectedProcedure
    .use(createPermissionMiddleware("documents:create"))
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Apenas usuários com "documents:create" podem executar
      return ctx.prisma.document.create({ data: input });
    }),
});

// Exemplo 2: Proteger com múltiplas permissões (qualquer uma)
export const exampleRouter2 = router({
  listDocuments: protectedProcedure
    .use(createPermissionsMiddleware(["documents:read", "documents:list"]))
    .query(async ({ ctx }) => {
      // Usuários com "documents:read" OU "documents:list" podem executar
      return ctx.prisma.document.findMany();
    }),
});

// Exemplo 3: Proteger com múltiplas permissões (todas necessárias)
export const exampleRouter3 = router({
  deleteDocument: protectedProcedure
    .use(createPermissionsMiddleware(["documents:delete", "documents:manage"], true))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Usuários precisam ter AMBAS as permissões
      return ctx.prisma.document.delete({ where: { id: input.id } });
    }),
});

// Exemplo 4: Proteger com role específica
export const exampleRouter4 = router({
  adminOnly: protectedProcedure
    .use(createRoleMiddleware("ADMINISTRADOR"))
    .query(async ({ ctx }) => {
      // Apenas usuários com role "ADMINISTRADOR" podem executar
      return { message: "Acesso admin" };
    }),
});
*/

// ============================================
// 3. USO NO FRONTEND (React Components)
// ============================================

import { usePermissions } from "@/src/shared/hook/use-permissions";
import { PermissionGuard } from "@/src/shared/components/permissions/permission-guard";

// Exemplo 1: Hook de permissões
function MyComponent() {
  const { hasPermission, isAdmin } = usePermissions();

  if (!hasPermission("documents:create")) {
    return <div>Você não tem permissão para criar documentos</div>;
  }

  return <button>Criar Documento</button>;
}

// Exemplo 2: Componente PermissionGuard
function MyPage() {
  return (
    <div>
      <PermissionGuard permission="documents:read">
        <DocumentList />
      </PermissionGuard>

      <PermissionGuard 
        permission="documents:create"
        fallback={<p>Sem permissão para criar</p>}
      >
        <CreateDocumentButton />
      </PermissionGuard>

      <PermissionGuard 
        permissions={["documents:update", "documents:delete"]}
        requireAll={false}
      >
        <DocumentActions />
      </PermissionGuard>
    </div>
  );
}

// ============================================
// 4. CONFIGURAÇÃO DE ROTAS
// ============================================
// Edite src/shared/config/routes.ts para adicionar novas rotas protegidas

export const routePermissions = {
  "/dashboard/documents": {
    path: "/dashboard/documents",
    permission: "documents:read", // Requer esta permissão
  },
  "/dashboard/admin": {
    path: "/dashboard/admin",
    role: "ADMINISTRADOR", // Requer esta role
  },
  "/dashboard/settings": {
    path: "/dashboard/settings",
    permissions: ["settings:read", "settings:write"], // Requer qualquer uma
    requireAll: false,
  },
};

// ============================================
// 5. PERMISSÕES RECOMENDADAS
// ============================================
// Padrão: resource:action

// Documents
// - documents:read
// - documents:create
// - documents:update
// - documents:delete
// - documents:manage (todas as ações)

// Companies
// - companies:read
// - companies:create
// - companies:update
// - companies:delete

// Access Management
// - accesses:read
// - accesses:manage

// Dashboard
// - dashboard:read

