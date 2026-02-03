import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

const createEstablishmentSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1).max(120),
  code: z.string().max(20).optional(),
  cnpj: z.string().optional(),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  address: z.string().max(180).optional(),
  complement: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().max(10).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

const updateEstablishmentSchema = createEstablishmentSchema.partial().extend({
  id: z.string(),
});

export const establishmentRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        search: z.string().optional(),
        companyId: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, companyId, status } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(companyId && { companyId }),
        ...(status && { status }),
      };

      const [establishments, total] = await Promise.all([
        ctx.prisma.establishment.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                documents: true,
              },
            },
          },
        }),
        ctx.prisma.establishment.count({ where }),
      ]);

      return {
        establishments,
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
      const establishment = await ctx.prisma.establishment.findUnique({
        where: { id: input.id },
        include: {
          company: true,
          documents: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!establishment) {
        throw new Error("Estabelecimento não encontrado");
      }

      return establishment;
    }),

  create: protectedProcedure
    .input(createEstablishmentSchema)
    .mutation(async ({ ctx, input }) => {
      const establishment = await ctx.prisma.establishment.create({
        data: input,
        include: {
          company: true,
        },
      });

      return establishment;
    }),

  update: protectedProcedure
    .input(updateEstablishmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const establishment = await ctx.prisma.establishment.update({
        where: { id },
        data,
        include: {
          company: true,
        },
      });

      return establishment;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.establishment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

