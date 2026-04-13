"use client";

import { useEffect, useState } from "react";
import { useSelectedCompany } from "@/src/shared/context/company-context";

export type CompanyListScope = "my_companies" | "selected";

export function useCompanyScopeFilter() {
  const { selectedCompanyId, selectedCompany } = useSelectedCompany();
  const [scope, setScope] = useState<CompanyListScope>("my_companies");

  useEffect(() => {
    if (scope === "selected" && !selectedCompanyId) {
      setScope("my_companies");
    }
  }, [selectedCompanyId, scope]);

  const companyIdForQuery =
    scope === "selected" && selectedCompanyId ? selectedCompanyId : undefined;

  return {
    scope,
    setScope,
    selectedCompany,
    selectedCompanyId,
    companyIdForQuery,
  };
}
