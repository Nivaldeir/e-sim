"use client";

import { Building2 } from "lucide-react";
import { Button } from "@/src/shared/components/global/ui/button";
import type { CompanyListScope } from "@/src/shared/hook/use-company-scope-filter";

type CompanyScopeToggleProps = {
  value: CompanyListScope;
  onChange: (value: CompanyListScope) => void;
  selectedCompanyName?: string | null;
  className?: string;
};

export function CompanyScopeToggle({
  value,
  onChange,
  selectedCompanyName,
  className,
}: CompanyScopeToggleProps) {
  const hasMenuCompany = !!selectedCompanyName;

  return (
    <div className={`flex flex-wrap gap-2 print:hidden ${className ?? ""}`}>
      <Button
        type="button"
        variant={value === "my_companies" ? "default" : "outline"}
        size="sm"
        className="gap-1"
        onClick={() => onChange("my_companies")}
        title="Dados de todas as empresas às quais seu usuário está associado"
      >
        <Building2 className="h-4 w-4" />
        Minhas empresas
      </Button>
      <Button
        type="button"
        variant={value === "selected" ? "default" : "outline"}
        size="sm"
        className="gap-1"
        disabled={!hasMenuCompany}
        onClick={() => onChange("selected")}
        title={
          hasMenuCompany
            ? `Somente: ${selectedCompanyName}`
            : "Selecione uma empresa no menu lateral"
        }
      >
        <Building2 className="h-4 w-4" />
        Empresa do menu
      </Button>
    </div>
  );
}
