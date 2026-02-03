"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/src/shared/components/global/ui";
import { DataTable } from "@/src/shared/components/global/datatable/data-table";
import { Shield, Plus, Loader2, AlertCircle } from "lucide-react";
import { useAccessesPage } from "./hooks/accesses.hook";

export default function AccessesPage() {
  const { 
    table, 
    isLoading, 
    error, 
    refetch, 
    handleOpenNewAccess, 
    handleEditAccess,
    roles 
  } = useAccessesPage();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-semibold">Acessos</h1>
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
            <h1 className="text-2xl font-semibold">Acessos</h1>
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
          <Shield className="h-5 w-5" />
        </div>
        <div className="flex flex-col flex-1">
          <h1 className="text-2xl font-semibold">Acessos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários e seus tipos de acesso ao sistema.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={handleOpenNewAccess}
        >
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6 pb-0">
          <CardTitle className="text-base">Usuários cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-4">
          <DataTable table={table} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-6 pb-0">
          <CardTitle className="text-base">Tipos de acesso</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-4 space-y-2 pb-4">
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <div key={role.id} className="flex items-start gap-2">
                <div className="w-32 text-sm font-medium shrink-0">{role.name}:</div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {role.description || `Função com ${role.permissions?.length || 0} permissão(ões)`}
                  </p>
                  {role.permissions && role.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {role.permissions.slice(0, 5).map((perm) => (
                        <Badge key={perm.id} variant="outline" className="text-[10px]">
                          {perm.action}:{perm.resource}
                        </Badge>
                      ))}
                      {role.permissions.length > 5 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{role.permissions.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Nenhum tipo de acesso configurado</p>
              <p className="text-xs mt-1">Os tipos de acesso serão exibidos aqui quando criados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
