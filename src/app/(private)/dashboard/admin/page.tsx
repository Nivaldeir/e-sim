"use client";

import { Suspense, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/global/ui";
import { Input } from "@/src/shared/components/global/ui/input";
import { Badge } from "@/src/shared/components/global/ui/badge";
import {
  ShieldCheck,
  Plus,
  Loader2,
  Search,
  Building2,
  Users,
  RefreshCw,
} from "lucide-react";
import { api } from "@/src/shared/context/trpc-context";
import { useModal } from "@/src/shared/context/modal-context";
import { CreateUserModal } from "./_components/create-user-modal";
import { CreateCompanyModal } from "./_components/create-company-modal";
import { Pagination } from "./_components/pagination";

type Tab = "users" | "companies";

const PAGE_SIZE = 10;

function AdminPageContent() {
  const [tab, setTab] = useState<Tab>("users");
  const [userSearch, setUserSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [companyPage, setCompanyPage] = useState(1);
  const { openModal } = useModal();
  const utils = api.useUtils();

  const { data: usersData, isLoading: loadingUsers, refetch: refetchUsers } =
    api.admin.listAllUsers.useQuery({
      page: userPage,
      pageSize: PAGE_SIZE,
      search: userSearch || undefined,
    });

  const { data: companiesData, isLoading: loadingCompanies, refetch: refetchCompanies } =
    api.admin.listAllCompanies.useQuery({
      page: companyPage,
      pageSize: PAGE_SIZE,
      search: companySearch || undefined,
    });

  const { data: rolesData } = api.admin.listRoles.useQuery();

  const handleUserSearch = (value: string) => {
    setUserSearch(value);
    setUserPage(1);
  };

  const handleCompanySearch = (value: string) => {
    setCompanySearch(value);
    setCompanyPage(1);
  };

  const handleCreateUser = () => {
    openModal(
      "admin-create-user",
      CreateUserModal,
      {
        roles: rolesData ?? [],
        companies: companiesData?.companies.map((c) => ({ id: c.id, name: c.name })) ?? [],
        onSuccess: () => utils.admin.listAllUsers.invalidate(),
      },
      { size: "md" }
    );
  };

  const handleCreateCompany = () => {
    openModal(
      "admin-create-company",
      CreateCompanyModal,
      {
        onSuccess: () => utils.admin.listAllCompanies.invalidate(),
      },
      { size: "md" }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex flex-col flex-1">
          <h1 className="text-2xl font-semibold">Painel SuperAdmin</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as empresas e usuários do sistema.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Usuários
          {usersData && (
            <Badge variant="secondary" className="text-xs">
              {usersData.pagination.total}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setTab("companies")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "companies"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Empresas
          {companiesData && (
            <Badge variant="secondary" className="text-xs">
              {companiesData.pagination.total}
            </Badge>
          )}
        </button>
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar usuário..."
                value={userSearch}
                onChange={(e) => handleUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchUsers()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" className="gap-1" onClick={handleCreateUser}>
              <Plus className="h-4 w-4" />
              Novo usuário
            </Button>
          </div>

          <Card>
            <CardHeader className="px-6 pb-0">
              <CardTitle className="text-base">Todos os usuários</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-4">
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {usersData?.users.map((user) => (
                      <div key={user.id} className="flex items-start justify-between py-3 gap-4">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{user.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex flex-wrap gap-1 justify-end">
                            {user.roles.map((r) => (
                              <Badge key={r.id} variant="secondary" className="text-xs">
                                {r.name}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {user.companies.map((c) => (
                              <Badge key={c.id} variant="outline" className="text-xs">
                                {c.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {usersData?.users.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum usuário encontrado.
                      </p>
                    )}
                  </div>
                  {usersData && usersData.pagination.totalPages > 1 && (
                    <Pagination
                      page={userPage}
                      totalPages={usersData.pagination.totalPages}
                      total={usersData.pagination.total}
                      pageSize={PAGE_SIZE}
                      onPageChange={setUserPage}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Companies Tab */}
      {tab === "companies" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar empresa..."
                value={companySearch}
                onChange={(e) => handleCompanySearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchCompanies()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" className="gap-1" onClick={handleCreateCompany}>
              <Plus className="h-4 w-4" />
              Nova empresa
            </Button>
          </div>

          <Card>
            <CardHeader className="px-6 pb-0">
              <CardTitle className="text-base">Todas as empresas</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-4">
              {loadingCompanies ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {companiesData?.companies.map((company) => (
                      <div key={company.id} className="flex items-start justify-between py-3 gap-4">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{company.name}</span>
                          <span className="text-xs text-muted-foreground">{company.cnpj}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge
                            variant={company.status === "ACTIVE" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {company.status === "ACTIVE" ? "Ativa" : "Inativa"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {company._count.userCompanies} usuário{company._count.userCompanies !== 1 ? "s" : ""}
                            {" · "}
                            {company._count.documents} doc{company._count.documents !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                    {companiesData?.companies.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma empresa encontrada.
                      </p>
                    )}
                  </div>
                  {companiesData && companiesData.pagination.totalPages > 1 && (
                    <Pagination
                      page={companyPage}
                      totalPages={companiesData.pagination.totalPages}
                      total={companiesData.pagination.total}
                      pageSize={PAGE_SIZE}
                      onPageChange={setCompanyPage}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
