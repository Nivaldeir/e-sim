"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/global/ui";
import { DataTable } from "@/src/shared/components/global/datatable/data-table";
import { Building2, Plus, Loader2, AlertCircle } from "lucide-react";
import { useSocialReasonsPage } from "./hooks/social-reasons.hook";

export default function SocialReasonsPage() {
  const { table, isLoading, error, refetch, handleOpenNewReason } = useSocialReasonsPage();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-semibold">Razão social</h1>
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
            <h1 className="text-2xl font-semibold">Razão social</h1>
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
          <h1 className="text-2xl font-semibold">Razão social</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre o nome das empresas e filiais (razão social completa e curta).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={handleOpenNewReason}
        >
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6 pb-0">
          <CardTitle className="text-base">Cadastro de razão social</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-4">
          <DataTable table={table} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-6 pb-0">
          <CardTitle className="text-base">Próximo passo</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-4 space-y-1 pb-4">
          <p className="text-xs text-muted-foreground">
            Após cadastrar todas as razões sociais, acesse a tela de <strong>Tipos de documentos</strong> para cadastrar os tipos de documento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}











