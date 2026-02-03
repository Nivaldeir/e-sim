import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const createDocumentSchema = z.object({
  templateId: z.string(),
  organizationId: z.string(),
  companyId: z.string(),
  establishmentId: z.string(),
  responsibleId: z.string(),
  chiefId: z.string().optional(),
  issueDate: z.string().optional(),
  expirationDate: z.string().optional(),
  alertDate: z.string().optional(),
  classification: z.string().optional(),
  groupId: z.string().optional(),
  customData: z.record(z.string(), z.any()).optional().nullable(),
  observations: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "EXPIRED", "PENDING", "CANCELLED"]).default("ACTIVE"),
});

const updateDocumentSchema = createDocumentSchema.partial().extend({
  id: z.string(),
});

export const documentRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        search: z.string().optional(),
        status: z.enum(["ACTIVE", "EXPIRED", "PENDING", "CANCELLED"]).optional(),
        templateId: z.string().optional(),
        companyId: z.string().optional(),
        organizationId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status, templateId, companyId, organizationId } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        ...(search && {
          observations: { contains: search, mode: "insensitive" as const },
        }),
        ...(status && { status }),
        ...(templateId && { templateId }),
        ...(companyId && { companyId }),
        ...(organizationId && { organizationId }),
      };

      const [documents, total] = await Promise.all([
        ctx.prisma.document.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            template: {
              select: {
                id: true,
                name: true,
              },
            },
            organization: {
              select: {
                id: true,
                shortName: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            establishment: {
              select: {
                id: true,
                name: true,
              },
            },
            responsible: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            chief: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            group: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            _count: {
              select: {
                attachments: true,
              },
            },
          },
        }),
        ctx.prisma.document.count({ where }),
      ]);

      return {
        documents,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.prisma.document.findUnique({
        where: { id: input.id },
        include: {
          template: {
            include: {
              fields: {
                orderBy: { order: "asc" },
              },
            },
          },
          organization: true,
          company: true,
          establishment: true,
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: true,
        },
      });

      if (!document) {
        throw new Error("Documento não encontrado");
      }

      return document;
    }),

  getPublicById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.prisma.document.findUnique({
        where: { id: input.id },
        include: {
          template: {
            include: {
              fields: {
                orderBy: { order: "asc" },
              },
            },
          },
          organization: true,
          company: true,
          establishment: true,
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          chief: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attachments: true,
        },
      });

      if (!document) {
        throw new Error("Documento não encontrado");
      }

      return document;
    }),

  create: protectedProcedure
    .input(createDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const { expirationDate, alertDate, issueDate, ...data } = input;

      const document = await ctx.prisma.document.create({
        data: {
          ...data,
          issueDate: issueDate ? new Date(issueDate) : null,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          alertDate: alertDate ? new Date(alertDate) : null,
        },
        include: {
          template: true,
          organization: true,
          company: true,
          establishment: true,
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          chief: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return document;
    }),

  update: protectedProcedure
    .input(updateDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, expirationDate, alertDate, issueDate, ...data } = input;

      const document = await ctx.prisma.document.update({
        where: { id },
        data: {
          ...data,
          ...(issueDate && { issueDate: new Date(issueDate) }),
          ...(expirationDate && { expirationDate: new Date(expirationDate) }),
          ...(alertDate && { alertDate: new Date(alertDate) }),
        },
        include: {
          template: true,
          organization: true,
          company: true,
          establishment: true,
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          chief: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return document;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.document.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getExpiring: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + input.days);

      const documents = await ctx.prisma.document.findMany({
        where: {
          status: "ACTIVE",
          expirationDate: {
            gte: today,
            lte: futureDate,
          },
        },
        include: {
          template: {
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
            },
          },
          responsible: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          expirationDate: "asc",
        },
      });

      return documents;
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const [total, byStatus, expiringSoon] = await Promise.all([
      ctx.prisma.document.count(),
      ctx.prisma.document.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      ctx.prisma.document.count({
        where: {
          status: "ACTIVE",
          expirationDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      byStatus,
      expiringSoon,
    };
  }),
});






