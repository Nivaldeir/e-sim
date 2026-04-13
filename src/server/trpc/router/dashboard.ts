import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { Context } from "../context";
import { protectedProcedure, router } from "../trpc";
import { getUserCompanyIds } from "../utils/user-company-scope";

function hasPermission(userPermissions: string[], permission: string): boolean {
  return userPermissions.includes(permission) || userPermissions.includes("admin");
}

type ScopedCompanyFilters = {
  document: Prisma.DocumentWhereInput;
  establishment: Pick<Prisma.EstablishmentWhereInput, "companyId">;
};

async function resolveScopedCompanyFilters(
  ctx: Context,
  companyId?: string
): Promise<ScopedCompanyFilters | null> {
  if (companyId) {
    return {
      document: { companyId },
      establishment: { companyId },
    };
  }
  const ids = await getUserCompanyIds(ctx);
  if (ids.length === 0) {
    return null;
  }
  const establishment: Pick<Prisma.EstablishmentWhereInput, "companyId"> = {
    companyId: { in: ids },
  };
  return {
    document: { companyId: { in: ids } },
    establishment,
  };
}

export const dashboardRouter = router({
  getStats: protectedProcedure.input(z.object({ companyId: z.string().optional() })).query(async ({ ctx, input }) => {
    const sessionUser = ctx.session?.user as any;
    const userId = sessionUser?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Extrair todas as permissões do usuário
    const allPermissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name)
    );

    const canReadDocuments = hasPermission(allPermissions, "documents:read");

    const stats = {
      totalDocuments: 0,
      totalTemplates: 0,
      totalEstablishments: 0,
      totalNotes: 0,
    };

    if (canReadDocuments) {
      const isAdmin = allPermissions.includes("admin") || user.userRoles.some((ur) => ur.role.name === "ADMINISTRADOR");

      const scoped = await resolveScopedCompanyFilters(ctx, input.companyId);
      if (!scoped) {
        return stats;
      }

      const documentWhere: Prisma.DocumentWhereInput = {
        ...scoped.document,
        ...(!isAdmin ? { responsibleId: userId } : {}),
      };

      stats.totalDocuments = await ctx.prisma.document.count({
        where: documentWhere,
      });

      stats.totalTemplates = await ctx.prisma.documentTemplate.count({
        where: { documents: { some: scoped.document } },
      });

      stats.totalEstablishments = await ctx.prisma.establishment.count({
        where: {
          status: "ACTIVE",
          ...scoped.establishment,
        },
      });

      stats.totalNotes = await ctx.prisma.document.count({
        where: {
          ...documentWhere,
          observations: { not: null },
        },
      });
    }

    return stats;
  }),

  getLatestDocuments: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(5),
        companyId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const sessionUser = ctx.session?.user as any;
      const userId = sessionUser?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado");
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      const allPermissions = user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.name)
      );

      const canReadDocuments = hasPermission(allPermissions, "documents:read");

      if (!canReadDocuments) {
        return [];
      }

      const isAdmin = allPermissions.includes("admin") || user.userRoles.some((ur) => ur.role.name === "ADMINISTRADOR");

    const scoped = await resolveScopedCompanyFilters(ctx, input.companyId);
    if (!scoped) {
      return [];
    }

    const documentWhere: Prisma.DocumentWhereInput = {
      ...scoped.document,
      ...(!isAdmin ? { responsibleId: userId } : {}),
    };

    const documents = await ctx.prisma.document.findMany({
      where: documentWhere,
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          template: {
            select: {
              name: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
          company: {
            select: {
              name: true,
            },
          },
          establishment: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      });

      return documents.map((doc) => ({
        id: doc.id,
        name: doc.template?.name || "Documento",
        date: doc.createdAt.toISOString().split("T")[0],
        type: "PDF",
        observations: doc.observations,
      }));
    }),

  getEstablishmentsStats: protectedProcedure.input(z.object({ companyId: z.string().optional() })).query(async ({ ctx, input }) => {
    const sessionUser = ctx.session?.user as any;
    const userId = sessionUser?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const allPermissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name)
    );

    const canReadDocuments = hasPermission(allPermissions, "documents:read");

    if (!canReadDocuments) {
      return [];
    }

    const isAdmin = allPermissions.includes("admin") || user.userRoles.some((ur) => ur.role.name === "ADMINISTRADOR");

    const scoped = await resolveScopedCompanyFilters(ctx, input.companyId);
    if (!scoped) {
      return [];
    }

    const documentWhere: Prisma.DocumentWhereInput = {
      ...scoped.document,
      ...(!isAdmin ? { responsibleId: userId } : {}),
    };

    const establishments = await ctx.prisma.establishment.findMany({
      where: {
        status: "ACTIVE",
        ...scoped.establishment,
      },
      include: {
        _count: {
          select: {
            documents: {
              where: documentWhere,
            },
          },
        },
      },
    });

    return establishments.map((est) => ({
      id: est.id,
      name: est.name,
      code: est.code || "",
      count: est._count.documents,
    }));
  }),
});

