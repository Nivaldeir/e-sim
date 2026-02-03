import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import * as bcryptjs from "bcryptjs";
import { prisma } from "../lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
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
              userCompanies: {
                include: {
                  company: {
                    select: {
                      id: true,
                      name: true,
                      cnpj: true,
                    },
                  },
                },
              },
            },
          });

          if (!user || !user.password) {
            throw new Error("Email ou senha inválidos");
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials!.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Email ou senha inválidos");
          }

          return {
            id: user.id,
            email: user.email ?? undefined,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            roles: user.userRoles.map((ur) => ur.role.name),
            permissions: user.userRoles.flatMap((ur) =>
              ur.role.rolePermissions.map((rp) => rp.permission.name)
            ),
            companies: user.userCompanies.map((uc) => ({
              id: uc.company.id,
              name: uc.company.name,
              cnpj: uc.company.cnpj,
              code: uc.code,
            })),
          };
        } catch (error) {
          console.error("Auth error:", error);

          if (error instanceof Error) {
            throw error;
          }

          throw new Error("Erro desconhecido ao fazer login");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    signOut: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.roles = (user as any).roles || [];
        token.permissions = (user as any).permissions || [];
        token.companies = (user as any).companies || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).roles = token.roles || [];
        (session.user as any).permissions = token.permissions || [];
        (session.user as any).companies = token.companies || [];
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
