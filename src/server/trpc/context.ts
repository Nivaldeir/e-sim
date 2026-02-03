import { getServerSession } from "next-auth";
import { authOptions } from "@/src/shared/config/auth";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { prisma } from "@/src/shared/lib/prisma";

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const session = await getServerSession(authOptions);

  return {
    session: session,
    headers: opts.req.headers,
    req: opts.req,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;