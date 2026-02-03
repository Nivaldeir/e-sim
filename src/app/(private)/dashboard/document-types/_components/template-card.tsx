import { FileText, Edit, Trash2 } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/shared/components/global/ui/card"
import { Badge } from "@/src/shared/components/global/ui"

type TemplateField = {
  id: string
  label: string
  type: string
  required: boolean
}

type Template = {
  id: string
  name: string
  description: string | null
  isDefault: boolean
  createdAt: Date
  fields: TemplateField[]
  _count?: {
    documents: number
  }
}

interface TemplateCardProps {
  template: Template
  onEdit: () => void
  onDelete: () => void
}

const fieldTypeLabels: Record<string, string> = {
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  EMAIL: "email",
  CPF: "cpf",
  CNPJ: "cnpj",
  PHONE: "phone",
  TEXTAREA: "textarea",
  SELECT: "select",
  FILE: "file",
}

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const totalFields = template.fields.length
  const requiredFields = template.fields.filter((field) => field.required).length
  const visibleFields = template.fields.slice(0, 7)
  const extraFields = totalFields - visibleFields.length

  const createdAt =
    template.createdAt instanceof Date
      ? template.createdAt
      : new Date(template.createdAt)

  return (
    <Card className="border-border/80 bg-card p-0 gap-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 rounded-t-xl bg-muted px-6 py-4 text-sm text-foreground">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold leading-tight">
                {template.name}
              </CardTitle>
              {template.isDefault && (
                <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                  Padrão
                </Badge>
              )}
            </div>
            {template.description && (
              <p className="text-xs text-muted-foreground">
                {template.description}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              {totalFields} campo(s) configurado(s) • Criado em{" "}
              {createdAt.toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-destructive shadow-sm transition-colors hover:bg-muted"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 bg-card px-6 py-4 text-xs text-foreground">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span>
            Campos do template{" "}
            <span className="font-medium text-foreground">
              {requiredFields} obrigatório(s)
            </span>
          </span>
          {extraFields > 0 && (
            <span className="text-[11px] text-muted-foreground">
              +{extraFields} campo(s) a mais
            </span>
          )}
        </div>

        <div className="space-y-2">
          {visibleFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2"
            >
              <span className="text-xs font-medium">
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </span>
              <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground border border-border/60">
                {fieldTypeLabels[field.type] ?? field.type.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}










