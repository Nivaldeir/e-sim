import { z } from "zod";
import { hash } from "bcryptjs";
import { router } from "../trpc";
import { superAdminProcedure } from "../trpc";

export const adminRouter = router({
  listAllCompanies: superAdminProcedure
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
            establishments: { select: { id: true, name: true } },
            _count: { select: { documents: true, userCompanies: true } },
          },
        }),
        ctx.prisma.company.count({ where }),
      ]);

      return {
        companies,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      };
    }),

  createCompany: superAdminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(120),
        cnpj: z.string().min(1),
        logoUrl: z.string().optional(),
        stateRegistration: z.string().optional(),
        municipalRegistration: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.create({ data: input });
      return company;
    }),

  listAllUsers: superAdminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const skip = (page - 1) * pageSize;

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            userRoles: { include: { role: true } },
            userCompanies: { include: { company: { select: { id: true, name: true } } } },
          },
        }),
        ctx.prisma.user.count({ where }),
      ]);

      return {
        users: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt,
          roles: u.userRoles.map((ur) => ur.role),
          companies: u.userCompanies.map((uc) => ({ ...uc.company, code: uc.code })),
        })),
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      };
    }),

  createUser: superAdminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        roleId: z.string().min(1),
        companyId: z.string().optional(),
        employeeCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, password, roleId, companyId, employeeCode } = input;

      const existing = await ctx.prisma.user.findUnique({ where: { email } });
      if (existing) throw new Error("E-mail já está em uso");

      const hashedPassword = await hash(password, 10);
      const user = await ctx.prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      await ctx.prisma.userRole.create({ data: { userId: user.id, roleId } });

      if (companyId) {
        await ctx.prisma.userCompany.create({
          data: { userId: user.id, companyId, code: employeeCode },
        });
      }

      return { id: user.id, name: user.name, email: user.email };
    }),

  listRoles: superAdminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.role.findMany({ orderBy: { name: "asc" } });
  }),
});
