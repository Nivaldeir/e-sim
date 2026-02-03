"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, Badge, Button } from "@/src/shared/components/global/ui";
import { FileText, Download, Calendar, Building2, User, Mail, Loader2, Folder } from "lucide-react";
import { getExpirationStatus } from "@/src/shared/utils/document-expiration";
import { QRCodeViewer } from "@/src/shared/components/global/qr-code-viewer";
import { GroupQRCodeViewer } from "./group-qr-code-viewer";

export type SavedDocument = {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  orgaoId: string;
  orgaoName: string;
  expirationDate: string;
  alertDate: string;
  responsibleName: string;
  responsibleEmail?: string;
  companyName: string;
  establishmentName: string;
  observations?: string;
  attachments: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  groupId?: string;
  groupName?: string;
  createdAt: string;
};

interface DocumentListProps {
  documents: SavedDocument[];
  groupBy?: "group" | "none";
}

export function DocumentList({ documents, groupBy = "none" }: DocumentListProps) {
  const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});

  const groupedDocuments = useMemo(() => {
    if (groupBy !== "group") {
      return { grouped: {}, ungrouped: documents };
    }

    const grouped: Record<string, SavedDocument[]> = {};
    const ungrouped: SavedDocument[] = [];

    documents.forEach((doc) => {
      if (doc.groupId && doc.groupName) {
        if (!grouped[doc.groupId]) {
          grouped[doc.groupId] = [];
        }
        grouped[doc.groupId].push(doc);
      } else {
        ungrouped.push(doc);
      }
    });

    return { grouped, ungrouped };
  }, [documents, groupBy]);

  const handleDownloadAttachment = (attachmentName: string) => {
    alert(`Download iniciado: ${attachmentName}`);
  };

  const handleSendExpirationAlert = async (documentId: string) => {
    setSendingEmails((prev) => ({ ...prev, [documentId]: true }));

    try {
      const response = await fetch("/api/email/send-expiration-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar email");
      }

      alert("Email de alerta enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      alert(
        `Erro ao enviar email: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    } finally {
      setSendingEmails((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  const renderDocumentCard = (doc: SavedDocument) => {
        const expirationStatus = getExpirationStatus(
          doc.expirationDate,
          doc.alertDate
        );
        
        return (
        <Card key={doc.id} className={`hover:shadow-md transition-shadow ${expirationStatus.borderColor} border-l-4`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{doc.documentTypeName}</h3>
                  <p className="text-sm text-muted-foreground">{doc.orgaoName}</p>
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
                    {new Date(doc.expirationDate).toLocaleDateString("pt-BR")}
                  </span>
                  <Badge
                    variant="outline"
                    className={`${expirationStatus.bgColor} ${expirationStatus.borderColor} ${expirationStatus.color} text-[10px] px-2 py-0.5`}
                  >
                    {expirationStatus.text}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Aviso em
                </span>
                <span className="text-sm font-medium">
                  {new Date(doc.alertDate).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Responsável
                </span>
                <span className="text-sm font-medium truncate" title={doc.responsibleEmail}>
                  {doc.responsibleName}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Empresa
                </span>
                <span className="text-sm font-medium truncate" title={doc.establishmentName}>
                  {doc.companyName}
                </span>
              </div>
            </div>

            {doc.observations && (
              <div className="mb-4 p-3 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Observações:</p>
                <p className="text-sm">{doc.observations}</p>
              </div>
            )}

            {doc.attachments && doc.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Anexos:</p>
                <div className="flex flex-wrap gap-2">
                  {doc.attachments.map((attachment, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDownloadAttachment(attachment.name)}
                      className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-sm transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">{attachment.name}</span>
                      <Download className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendExpirationAlert(doc.id)}
                disabled={sendingEmails[doc.id]}
                className="gap-2"
              >
                {sendingEmails[doc.id] ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Enviar Alerta por Email
                  </>
                )}
              </Button>
              <QRCodeViewer
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/document/${doc.id}`}
                fileName={`${doc.documentTypeName} - ${doc.orgaoName}`}
              />
            </div>
          </CardContent>
        </Card>
    );
  };

  if (groupBy === "group") {
    return (
      <div className="grid gap-6">
        {Object.entries(groupedDocuments.grouped).map(([groupId, groupDocs]) => {
          const groupName = groupDocs[0]?.groupName || "Sem nome";
          return (
            <div key={groupId} className="space-y-4">
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{groupName}</h2>
                        <p className="text-sm text-muted-foreground">
                          {groupDocs.length} documento{groupDocs.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <GroupQRCodeViewer groupId={groupId} groupName={groupName} />
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 pl-4 border-l-2 border-purple-200">
                {groupDocs.map((doc) => renderDocumentCard(doc))}
              </div>
            </div>
          );
        })}
        {groupedDocuments.ungrouped.length > 0 && (
          <div className="space-y-4">
            <Card className="border-2 border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Documentos sem grupo</h2>
                    <p className="text-sm text-muted-foreground">
                      {groupedDocuments.ungrouped.length} documento{groupedDocuments.ungrouped.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4 pl-4 border-l-2 border-gray-200">
              {groupedDocuments.ungrouped.map((doc) => renderDocumentCard(doc))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {documents?.map((doc) => renderDocumentCard(doc))}
    </div>
  );
}













