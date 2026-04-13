import type { Context } from "../context";

export async function getUserCompanyIds(ctx: Context): Promise<string[]> {
  const userId = (ctx.session?.user as { id?: string } | undefined)?.id;
  if (!userId) return [];
  const rows = await ctx.prisma.userCompany.findMany({
    where: { userId },
    select: { companyId: true },
  });
  return rows.map((r) => r.companyId);
}
