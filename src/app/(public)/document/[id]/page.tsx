"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, Button } from "@/src/shared/components/global/ui";
import { FileText, Loader2, AlertCircle, File as FileIcon, ArrowLeft } from "lucide-react";
import { api } from "@/src/shared/context/trpc-context";

export default function PublicDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: document, isLoading, error } = api.document.getPublicById.useQuery({ id });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando documento...</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mt-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Documento não encontrado</h2>
                <p className="text-sm text-muted-foreground">
                  {error?.message || "O documento solicitado não existe ou não está mais disponível."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mt-2 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasAttachments = document.attachments && document.attachments.length > 0;
  const firstAttachment = hasAttachments ? document.attachments[0] : null;
  const fileType = firstAttachment?.fileType?.toLowerCase() || "";
  const isPdf = fileType.includes("pdf");
  const attachmentUrl = firstAttachment ? `/api/document-attachments/${firstAttachment.id}?preview=true` : null;

  return (
    <div className="min-h-screen bg-background relative">
      {hasAttachments && isPdf && attachmentUrl && firstAttachment ? (
        <div className="h-screen w-full">
          <iframe
            src={`${attachmentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={firstAttachment.fileName}
          />
        </div>
      ) : hasAttachments && firstAttachment && attachmentUrl ? (
        <div className="h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-4">
            {fileType.startsWith("image/") && attachmentUrl ? (
              <div className="flex items-center justify-center">
                <img
                  src={attachmentUrl}
                  alt={firstAttachment.fileName}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full text-center p-8">
                          <FileIcon class="h-16 w-16 text-muted-foreground mb-4" />
                          <p class="text-muted-foreground text-sm mb-2">
                            Erro ao carregar imagem
                          </p>
                          <a
                            href="${attachmentUrl.replace('?preview=true', '')}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-sm text-primary hover:underline mt-2"
                          >
                            Clique para abrir o arquivo
                          </a>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm mb-2 font-medium">
                  Preview não disponível para este tipo de arquivo
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Tipo: {fileType || "desconhecido"}
                </p>
                <a
                  href={attachmentUrl?.replace('?preview=true', '') || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Abrir arquivo
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <FileIcon className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Nenhum anexo disponível</p>
          </div>
        </div>
      )}
    </div>
  );
}

