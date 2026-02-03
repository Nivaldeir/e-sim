"use client";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/global/ui"
import { Building2, FileSpreadsheet, FileText, Folder, StickyNote, ChevronRight } from "lucide-react"
import { api } from "@/src/shared/context/trpc-context"
import Link from "next/link"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = api.dashboard.getStats.useQuery();
  const { data: latestFiles, isLoading: filesLoading } = api.dashboard.getLatestDocuments.useQuery({ limit: 5 });
  const { data: establishments, isLoading: establishmentsLoading } = api.dashboard.getEstablishmentsStats.useQuery();

  const summaryCards = [
    {
      title: "Total de Arquivos",
      value: stats?.totalDocuments?.toString() || "0",
      icon: FileText,
    },
    {
      title: "Categorias Ativas",
      value: stats?.totalTemplates?.toString() || "0",
      icon: Folder,
    },
    {
      title: "Estabelecimentos",
      value: stats?.totalEstablishments?.toString() || "0",
      icon: Building2,
    },
    {
      title: "Notas",
      value: stats?.totalNotes?.toString() || "0",
      icon: StickyNote,
    },
  ] as const

  const isLoading = statsLoading || filesLoading || establishmentsLoading;
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="flex-row items-center gap-4 px-6 py-4 animate-pulse">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted" />
              <div className="flex flex-1 flex-col gap-1">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="flex-row items-center gap-4 px-6 py-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <card.icon className="size-6" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
              <span className="text-2xl font-semibold leading-none tracking-tight">{card.value}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 px-6 pb-0">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Últimos Arquivos</CardTitle>
              <CardDescription>Arquivos mais recentes enviados para o sistema.</CardDescription>
            </div>
            <Link href="/dashboard/documents">
              <Button variant="ghost" size="sm" className="gap-1 px-2 text-xs">
                Ver todos
                <ChevronRight className="size-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="mt-4 space-y-2 pb-4">
            {latestFiles && latestFiles.length > 0 ? (
              latestFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-3 py-2 hover:bg-muted/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700">
                      {file.id.slice(0, 2)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium leading-tight">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.type === "Excel" ? (
                      <FileSpreadsheet className="size-4 text-emerald-600" />
                    ) : (
                      <FileText className="size-4 text-amber-600" />
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {file.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum arquivo encontrado
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-6 pb-0">
            <CardTitle className="text-base">Por Estabelecimento</CardTitle>
            <CardDescription>Distribuição de arquivos por unidade.</CardDescription>
          </CardHeader>
          <CardContent className="mt-4 space-y-2 pb-4">
            {establishments && establishments.length > 0 ? (
              establishments.map((establishment) => (
                <div
                  key={establishment.code || establishment.name}
                  className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Building2 className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium leading-tight">{establishment.name}</span>
                      {establishment.code && (
                        <span className="text-xs text-muted-foreground">{establishment.code}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {establishment.files}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum estabelecimento encontrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-6 pb-0">
          <CardTitle className="text-base">Notas Abaixo</CardTitle>
        </CardHeader>
        <CardContent className="mt-4 space-y-1 pb-4">
          <p className="text-xs text-muted-foreground">
            Use o Menu SIM (1-31) para navegar pelas categorias de arquivos.
          </p>
          <p className="text-xs text-muted-foreground">
            Acesse Estabelecimentos para visualizar arquivos por unidade.
          </p>
          <p className="text-xs text-muted-foreground">
            Cada categoria e arquivo pode receber notas e observações.
          </p>
        </CardContent>
      </Card>
    </div >
  )
}