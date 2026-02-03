"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/src/shared/components/global/ui";
import { FileText, Calendar, Building2, User, Mail, Loader2, AlertCircle, ArrowLeft, Folder } from "lucide-react";
import { api } from "@/src/shared/context/trpc-context";
import { getExpirationStatus } from "@/src/shared/utils/document-expiration";

export default function PublicDocumentGroupPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: group, isLoading, error } = api.documentGroup.getPublicById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando grupo de documentos...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Grupo não encontrado</h2>
                <p className="text-sm text-muted-foreground">
                  {error?.message || "O grupo solicitado não existe ou não está mais disponível."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Folder className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{group.name}</CardTitle>
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {group.documents.length} documento{group.documents.length !== 1 ? "s" : ""} no grupo
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {group.documents.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum documento ativo neste grupo.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {group.documents.map((doc) => {
              const expirationStatus = getExpirationStatus(
                doc.expirationDate,
                doc.alertDate
              );

              return (
                <Card
                  key={doc.id}
                  className={`hover:shadow-md transition-shadow ${expirationStatus.borderColor} border-l-4`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{doc.template?.name || "Documento"}</h3>
                          <p className="text-sm text-muted-foreground">{doc.organization?.shortName || ""}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expira em
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${expirationStatus.color}`}>
                            {doc.expirationDate
                              ? new Date(doc.expirationDate).toLocaleDateString("pt-BR")
                              : "-"}
                          </span>
                          {doc.expirationDate && (
                            <Badge
                              variant="outline"
                              className={`${expirationStatus.bgColor} ${expirationStatus.borderColor} ${expirationStatus.color} text-[10px] px-2 py-0.5`}
                            >
                              {expirationStatus.text}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {doc.alertDate && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Aviso em
                          </span>
                          <span className="text-sm font-medium">
                            {new Date(doc.alertDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Responsável
                        </span>
                        <span className="text-sm font-medium truncate" title={doc.responsible?.email || undefined}>
                          {doc.responsible?.name || "-"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Empresa
                        </span>
                        <span className="text-sm font-medium truncate" title={doc.establishment?.name}>
                          {doc.company?.name || "-"}
                        </span>
                      </div>
                    </div>

                    {doc.observations && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Observações:</p>
                        <p className="text-sm">{doc.observations}</p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t">
                      <a
                        href={`/document/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Ver Detalhes do Documento
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

