import { Pencil, Trash2, ChevronRight, Users } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/shared/components/global/ui/card"
import { Badge } from "@/src/shared/components/global/ui"
import { getExpirationStatus } from "@/src/shared/utils/document-expiration"

export type DocumentStatus = "Ativo" | "Inativo"

export interface Document {
  id: string
  category: string
  title: string
  type: string
  organization: string
  expirationDate: string
  reminderDate?: string
  responsibleNames: string
  responsibleCount: number
  company: string
  establishment: string
  status: DocumentStatus
  cnpj: string
  stateRegistration: string
  municipalRegistration: string
}


interface DocumentCardProps {
  document: Document
}

export function DocumentCard({ document }: DocumentCardProps) {
  const expirationStatus = getExpirationStatus(
    document.expirationDate,
    document.reminderDate
  );

  return (
    <Card className={`border-border/80 bg-card p-0 gap-0 ${expirationStatus.borderColor} border-l-4`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 rounded-t-xl bg-muted px-6 py-3 text-sm text-foreground">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-transparent bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary"
            >
              {document.category}
            </Badge>
          </div>
          <CardTitle className="text-xs font-semibold leading-snug text-foreground">
            {document.title}
          </CardTitle>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 text-xs font-semibold">
            <span>{document.id}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 bg-card px-6 py-4 text-xs text-foreground">
        <div className="grid gap-6 border-b border-border pb-3 text-[11px] sm:grid-cols-5">
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Tipo do documento
            </p>
            <p className="text-xs font-medium">{document.type}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Órgão
            </p>
            <p className="text-xs font-medium">{document.organization}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Data expiração
            </p>
            <div className="flex items-center gap-2">
              <p className={`text-xs font-medium ${expirationStatus.color}`}>
                {document.expirationDate}
              </p>
              <Badge
                variant="outline"
                className={`${expirationStatus.bgColor} ${expirationStatus.borderColor} ${expirationStatus.color} text-[10px] px-2 py-0.5`}
              >
                {expirationStatus.text}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Data de aviso
            </p>
            <p className="text-xs font-medium">
              {document.reminderDate ?? "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Responsáveis
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
                <Users className="h-3 w-3" />
                {document.responsibleCount}
              </span>
            </p>
            <p className="text-xs font-medium">{document.responsibleNames}</p>
          </div>
        </div>

        <div className="grid gap-6 text-[11px] sm:grid-cols-5">
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Empresa
            </p>
            <p className="text-xs font-medium">{document.company}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Estabelecimento
            </p>
            <p className="text-xs font-medium">{document.establishment}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <p className="text-xs font-medium text-emerald-400">
              ✓ {document.status}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              CNPJ
            </p>
            <p className="text-xs font-medium">{document.cnpj}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Insc. estadual
            </p>
            <p className="text-xs font-medium">{document.stateRegistration}</p>
          </div>
          <div className="space-y-1 sm:col-start-5 sm:row-start-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Insc. municipal
            </p>
            <p className="text-xs font-medium">
              {document.municipalRegistration}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}