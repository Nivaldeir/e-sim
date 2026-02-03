import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const folderRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        parentId: z.string().nullable().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;
      const isAdmin = ctx.session?.user?.roles?.includes("ADMINISTRADOR");

      const folders = await ctx.prisma.folder.findMany({
        where: {
          parentId: input?.parentId ?? null,
          ...(isAdmin ? {} : { createdBy: userId }),
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              children: true,
              files: true,
            },
          },
        },
      });

      return folders;
    }),

  getTree: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx.session?.user as any)?.id;
    const isAdmin = ctx.session?.user?.roles?.includes("ADMINISTRADOR");

    // Buscar todas as pastas
    const folders = await ctx.prisma.folder.findMany({
      where: isAdmin ? {} : { createdBy: userId },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        files: {
          select: {
            id: true,
            name: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
            path: true,
            createdAt: true,
          },
        },
      },
    });

    // Buscar arquivos na raiz (sem pasta)
    const rootFiles = await ctx.prisma.file.findMany({
      where: {
        folderId: null,
        ...(isAdmin ? {} : { createdBy: userId }),
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        mimeType: true,
        size: true,
        url: true,
        path: true,
        createdAt: true,
      },
    });

    // Construir árvore hierárquica
    type TreeNode = {
      id: string;
      name: string;
      type: "folder" | "file";
      children?: TreeNode[];
      mimeType?: string;
      size?: number;
      url?: string;
      path?: string;
    };

    const buildTree = (parentId: string | null): TreeNode[] => {
      const result: TreeNode[] = [];

      // Adicionar pastas
      const childFolders = folders.filter((f) => f.parentId === parentId);
      for (const folder of childFolders) {
        const children = buildTree(folder.id);
        
        // Adicionar arquivos da pasta
        for (const file of folder.files) {
          children.push({
            id: file.id,
            name: file.originalName,
            type: "file",
            mimeType: file.mimeType,
            size: file.size,
            url: file.url || undefined,
            path: file.path || undefined,
          });
        }

        result.push({
          id: folder.id,
          name: folder.name,
          type: "folder",
          children,
        });
      }

      return result;
    };

    const tree = buildTree(null);

    // Adicionar arquivos da raiz
    for (const file of rootFiles) {
      tree.push({
        id: file.id,
        name: file.originalName,
        type: "file",
        mimeType: file.mimeType,
        size: file.size,
        url: file.url || undefined,
        path: file.path || undefined,
      });
    }

    return tree;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const folder = await ctx.prisma.folder.findUnique({
        where: { id: input.id },
        include: {
          parent: true,
          children: {
            orderBy: [{ order: "asc" }, { name: "asc" }],
          },
          files: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!folder) {
        throw new Error("Pasta não encontrada");
      }

      return folder;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        parentId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id;

      // Calcular path
      let path = `/${input.name}`;
      if (input.parentId) {
        const parent = await ctx.prisma.folder.findUnique({
          where: { id: input.parentId },
        });
        if (parent) {
          path = `${parent.path || ""}/${input.name}`;
        }
      }

      const folder = await ctx.prisma.folder.create({
        data: {
          name: input.name,
          parentId: input.parentId || null,
          path,
          createdBy: userId,
        },
      });

      return folder;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(255).optional(),
        parentId: z.string().nullable().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Recalcular path se mudar de pasta pai
      let updateData: any = { ...data };
      
      if (data.parentId !== undefined || data.name) {
        const current = await ctx.prisma.folder.findUnique({ where: { id } });
        if (current) {
          const parentId = data.parentId !== undefined ? data.parentId : current.parentId;
          const name = data.name || current.name;
          
          if (parentId) {
            const parent = await ctx.prisma.folder.findUnique({ where: { id: parentId } });
            updateData.path = `${parent?.path || ""}/${name}`;
          } else {
            updateData.path = `/${name}`;
          }
        }
      }

      const folder = await ctx.prisma.folder.update({
        where: { id },
        data: updateData,
      });

      return folder;
    }),

  move: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        parentId: z.string().nullable(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, parentId, order } = input;

      // Calcular novo path
      const current = await ctx.prisma.folder.findUnique({ where: { id } });
      if (!current) throw new Error("Pasta não encontrada");

      let newPath = `/${current.name}`;
      if (parentId) {
        const parent = await ctx.prisma.folder.findUnique({ where: { id: parentId } });
        if (parent) {
          newPath = `${parent.path || ""}/${current.name}`;
        }
      }

      const folder = await ctx.prisma.folder.update({
        where: { id },
        data: {
          parentId,
          path: newPath,
          ...(order !== undefined && { order }),
        },
      });

      return folder;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.folder.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

