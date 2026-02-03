import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

const createSocialReasonSchema = z.object({
  name: z.string().min(1).max(200),
  shortName: z.string().min(1).max(60),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

const updateSocialReasonSchema = createSocialReasonSchema.partial().extend({
  id: z.string(),
});

export const socialReasonRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        search: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { shortName: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(status && { status }),
      };

      const [socialReasons, total] = await Promise.all([
        ctx.prisma.socialReason.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        ctx.prisma.socialReason.count({ where }),
      ]);

      return {
        socialReasons,
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
      const socialReason = await ctx.prisma.socialReason.findUnique({
        where: { id: input.id },
      });

      if (!socialReason) {
        throw new Error("Razão social não encontrada");
      }

      return socialReason;
    }),

  create: protectedProcedure
    .input(createSocialReasonSchema)
    .mutation(async ({ ctx, input }) => {
      const socialReason = await ctx.prisma.socialReason.create({
        data: input,
      });

      return socialReason;
    }),

  update: protectedProcedure
    .input(updateSocialReasonSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const socialReason = await ctx.prisma.socialReason.update({
        where: { id },
        data,
      });

      return socialReason;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.socialReason.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

