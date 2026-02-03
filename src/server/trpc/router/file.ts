import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const fileRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        folderId: z.string().nullable().optional(),
        documentId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      const isAdmin = (ctx.session?.user as any)?.roles?.includes("ADMINISTRADOR");

      const files = await ctx.prisma.file.findMany({
        where: {
          ...(input?.folderId !== undefined && { folderId: input.folderId }),
          ...(input?.documentId && { documentId: input.documentId }),
          ...(isAdmin ? {} : { createdBy: userId }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          folder: {
            select: {
              id: true,
              name: true,
              path: true,
            },
          },
        },
      });

      return files;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.prisma.file.findUnique({
        where: { id: input.id },
        include: {
          folder: true,
          document: {
            select: {
              id: true,
              template: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!file) {
        throw new Error("Arquivo não encontrado");
      }

      return file;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        originalName: z.string().min(1),
        mimeType: z.string().min(1),
        size: z.number().min(0),
        path: z.string().min(1),
        url: z.string().optional(),
        folderId: z.string().nullable().optional(),
        documentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;

      const file = await ctx.prisma.file.create({
        data: {
          ...input,
          folderId: input.folderId || null,
          createdBy: userId,
        },
      });

      return file;
    }),

  createMany: protectedProcedure
    .input(
      z.array(
        z.object({
          name: z.string().min(1),
          originalName: z.string().min(1),
          mimeType: z.string().min(1),
          size: z.number().min(0),
          path: z.string().min(1),
          url: z.string().optional(),
          folderId: z.string().nullable().optional(),
          documentId: z.string().optional(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;

      const files = await ctx.prisma.file.createMany({
        data: input.map((file) => ({
          ...file,
          folderId: file.folderId || null,
          createdBy: userId,
        })),
      });

      return files;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        folderId: z.string().nullable().optional(),
        documentId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const file = await ctx.prisma.file.update({
        where: { id },
        data,
      });

      return file;
    }),

  move: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        folderId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.prisma.file.update({
        where: { id: input.id },
        data: { folderId: input.folderId },
      });

      return file;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Buscar arquivo para obter o path
      const file = await ctx.prisma.file.findUnique({
        where: { id: input.id },
      });

      if (!file) {
        throw new Error("Arquivo não encontrado");
      }

      // TODO: Deletar arquivo do storage (implementar quando tiver storage real)

      await ctx.prisma.file.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx.session?.user as any)?.id;
    const isAdmin = (ctx.session?.user as any)?.roles?.includes("ADMINISTRADOR");

    const where = isAdmin ? {} : { createdBy: userId };

    const [totalFiles, totalSize, byMimeType] = await Promise.all([
      ctx.prisma.file.count({ where }),
      ctx.prisma.file.aggregate({
        where,
        _sum: { size: true },
      }),
      ctx.prisma.file.groupBy({
        by: ["mimeType"],
        where,
        _count: { id: true },
        _sum: { size: true },
      }),
    ]);

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      byMimeType,
    };
  }),
});

