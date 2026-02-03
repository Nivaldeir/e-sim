"use client";

import { useSession } from "next-auth/react";

export type UserCompany = {
  id: string;
  name: string;
  cnpj: string;
  code: string | null;
};

export function useUserCompanies() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const companies: UserCompany[] = (session?.user as any)?.companies || [];

  return {
    isAuthenticated,
    companies,
    hasCompanies: companies.length > 0,
    hasNoCompany: companies.length === 0,
  };
}

