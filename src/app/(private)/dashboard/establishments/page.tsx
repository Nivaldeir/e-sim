"use client";

import { Suspense } from "react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/global/ui";
import { DataTable } from "@/src/shared/components/global/datatable/data-table";
import { Building2, FileText, Folder, Plus, Loader2, AlertCircle } from "lucide-react";
import { useEstablishmentsPage } from "./hooks/establishments.hook";

function EstablishmentsPageContent() {
  const { establishments, table, isLoading, error, refetch, handleOpenNewEstablishment, handleEditEstablishment } = useEstablishmentsPage();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-semibold">Estabelecimentos / Filiais</h1>
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
            <h1 className="text-2xl font-semibold">Estabelecimentos / Filiais</h1>
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
          <h1 className="text-2xl font-semibold">Estabelecimentos / Filiais</h1>
          <p className="text-sm text-muted-foreground">Visualize arquivos por unidade</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={handleOpenNewEstablishment}
        >
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      {establishments.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            Nenhum estabelecimento cadastrado
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {establishments.map((establishment) => (
            <Card
              key={establishment.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEditEstablishment(establishment)}
            >
              <CardHeader className="px-6 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <CardTitle className="text-base">{establishment.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {establishment.code ? `Código: ${establishment.code}` : establishment.company}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={establishment.status === "active" ? "default" : "secondary"}
                    className={establishment.status === "active" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    {establishment.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-0 pb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{establishment.address || "-"}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {establishment.filesCount} arquivo(s)
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="px-6 pb-0">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base">Visão Consolidada</CardTitle>
          </div>
          <CardDescription>Visualize todos os estabelecimentos em uma tabela</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pt-4">
          <DataTable table={table} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-6 pb-0">
          <CardTitle className="text-base">Notas Abaixo</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-4 space-y-1 pb-4">
          <p className="text-xs text-muted-foreground">
            Clique em um estabelecimento para ver seus arquivos
          </p>
          <p className="text-xs text-muted-foreground">
            Use o Menu SIM (1-31) para navegar por categoria de arquivo
          </p>
          <p className="text-xs text-muted-foreground">
            Arquivos podem ser filtrados por estabelecimento ou categoria
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EstablishmentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <EstablishmentsPageContent />
    </Suspense>
  );
}

