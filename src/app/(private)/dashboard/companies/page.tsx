"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/global/ui";
import { Building2, Plus, Loader2, AlertCircle } from "lucide-react";
import { useModal } from "@/src/shared/context/modal-context";
import { CompanyModal } from "./_components/company-form";
import { api } from "@/src/shared/context/trpc-context";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const { openModal } = useModal();

  const { data, isLoading, error, refetch } = api.company.list.useQuery({
    page: 1,
    pageSize: 50,
    search: search || undefined,
  });

  const companies = data?.companies || [];

  const handleCreateCompany = () => {
    openModal(
      "create-company",
      CompanyModal,
      {
        onSuccess: () => {
          refetch();
        },
      },
      {
        size: "md",
      }
    );
  };

  const handleEditCompany = (company: typeof companies[0]) => {
    openModal(
      `edit-company-${company.id}`,
      CompanyModal,
      {
        company: {
          id: company.id,
          name: company.name,
          cnpj: company.cnpj,
          stateRegistration: company.stateRegistration || "",
          municipalRegistration: company.municipalRegistration || "",
          status: company.status,
        },
        onSuccess: () => {
          refetch();
        },
      },
      {
        size: "md",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-semibold">Empresas / Estabelecimentos</h1>
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-semibold">Empresas / Estabelecimentos</h1>
            <p className="text-sm text-red-600">Erro ao carregar dados</p>
          </div>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground">{error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col flex-1">
          <h1 className="text-2xl font-semibold">Empresas / Estabelecimentos</h1>
          <p className="text-sm text-muted-foreground">
            Empresa, estabelecimento, status e inscrições cadastrais.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={handleCreateCompany}
        >
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      {companies.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            Nenhuma empresa cadastrada
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEditCompany(company)}
            >
              <CardHeader className="px-6 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Empresa</span>
                    <CardTitle className="text-base">
                      {company.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {company.establishments.length} estabelecimento(s)
                    </CardDescription>
                  </div>
                  <Badge
                    variant={company.status === "ACTIVE" ? "default" : "secondary"}
                    className={
                      company.status === "ACTIVE"
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }
                  >
                    {company.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-0 pb-4 grid gap-4 md:grid-cols-3 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">CNPJ</span>
                  <span className="font-mono">{company.cnpj}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Insc. estadual
                  </span>
                  <span>{company.stateRegistration || "-"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Insc. municipal
                  </span>
                  <span>{company.municipalRegistration || "-"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
