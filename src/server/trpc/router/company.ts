import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getUserCompanyIds } from "../utils/user-company-scope";

const createCompanySchema = z.object({
  name: z.string().min(1).max(120),
  cnpj: z.string().min(1),
  logoUrl: z.string().optional(),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

const updateCompanySchema = createCompanySchema.partial().extend({
  id: z.string(),
});

export const companyRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        companyId: z.string().optional(),
        search: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status, companyId } = input;
      const skip = (page - 1) * pageSize;

      const userCompanyIds = await getUserCompanyIds(ctx);
      if (userCompanyIds.length === 0) {
        return {
          companies: [],
          pagination: { page, pageSize, total: 0, totalPages: 0 },
        };
      }

      const idFilter = companyId
        ? userCompanyIds.includes(companyId)
          ? { id: companyId }
          : { id: "" }
        : { id: { in: userCompanyIds } };

      const where = {
        ...idFilter,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { cnpj: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(status && { status }),
      };

      const [companies, total] = await Promise.all([
        ctx.prisma.company.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            establishments: {
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
        ctx.prisma.company.count({ where }),
      ]);

      return {
        companies,
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
      const userCompanyIds = await getUserCompanyIds(ctx);
      if (!userCompanyIds.includes(input.id)) {
        throw new Error("Empresa não encontrada");
      }

      const company = await ctx.prisma.company.findUnique({
        where: { id: input.id },
        include: {
          establishments: true,
          documents: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!company) {
        throw new Error("Empresa não encontrada");
      }

      return company;
    }),

  create: protectedProcedure
    .input(createCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as { id?: string } | undefined)?.id;
      if (!userId) throw new Error("Usuário não autenticado");

      const company = await ctx.prisma.company.create({
        data: input,
      });

      // Associate the creator with the company
      await ctx.prisma.userCompany.create({
        data: { userId, companyId: company.id },
      });

      // Assign ADMINISTRADOR role to the creator if not already assigned
      const adminRole = await ctx.prisma.role.findUnique({
        where: { name: "ADMINISTRADOR" },
      });
      if (adminRole) {
        await ctx.prisma.userRole.upsert({
          where: { userId_roleId: { userId, roleId: adminRole.id } },
          create: { userId, roleId: adminRole.id },
          update: {},
        });
      }

      return company;
    }),

  update: protectedProcedure
    .input(updateCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const company = await ctx.prisma.company.update({
        where: { id },
        data,
      });

      return company;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.company.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

