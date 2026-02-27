"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/src/shared/components/global/ui";
import {
  FileText,
  Loader2,
  AlertCircle,
  File as FileIcon,
  ArrowLeft,
  Building2,
  Calendar,
  User,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import { api } from "@/src/shared/context/trpc-context";

interface DocumentPublic {
  template?: { name?: string | null } | null;
  company?: { name?: string | null } | null;
  establishment?: { name?: string | null } | null;
  responsible?: { name?: string | null } | null;
  expirationDate?: Date | string | null;
  attachments: Array<{ id: string; fileName: string; fileType?: string | null }>;
}

// --- Helpers ---
function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getAttachmentUrl(attachmentId: string): string {
  return `/api/document-attachments/${attachmentId}`;
}

// --- Subviews ---
function LoadingView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">Carregando documento...</p>
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
    </div>
  );
}

function ErrorView({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
          </div>
          <CardTitle className="text-lg">Documento não encontrado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentInfo({ document }: { document: DocumentPublic }) {
  const templateName = document.template?.name ?? "Documento";
  const companyName = document.company?.name;
  const establishmentName = document.establishment?.name;
  const responsibleName = document.responsible?.name;
  const expiration = document.expirationDate;

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h1 className="text-xl font-semibold text-foreground truncate px-2" title={templateName}>
        {templateName}
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
        {(companyName || establishmentName) && (
          <span className="flex items-center gap-1.5 shrink-0">
            <Building2 className="h-3.5 w-3.5 opacity-80" aria-hidden />
            {[companyName, establishmentName].filter(Boolean).join(" · ")}
          </span>
        )}
        {responsibleName && (
          <span className="flex items-center gap-1.5 shrink-0">
            <User className="h-3.5 w-3.5 opacity-80" aria-hidden />
            {responsibleName}
          </span>
        )}
        {expiration && (
          <span className="flex items-center gap-1.5 shrink-0">
            <Calendar className="h-3.5 w-3.5 opacity-80" aria-hidden />
            Vencimento: {formatDate(expiration)}
          </span>
        )}
      </div>
    </div>
  );
}

/** Link que abre o anexo em nova aba (navegador à parte) */
function AttachmentLink({
  attachment,
}: {
  attachment: DocumentPublic["attachments"][number];
}) {
  const url = getAttachmentUrl(attachment.id);
  const isPdf = (attachment.fileType ?? "").toLowerCase().includes("pdf");
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-xl border bg-card px-4 py-3.5 text-left shadow-sm transition-all hover:border-primary/30 hover:bg-card hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <FileText className="h-6 w-6" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{attachment.fileName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isPdf ? "PDF" : "Arquivo"} · Abrir em nova aba
        </p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
    </a>
  );
}

function NoAttachmentsView() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
      <FileIcon className="h-14 w-14 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">Nenhum anexo disponível para este documento.</p>
    </div>
  );
}

// --- Main page ---
export default function PublicDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const { data: document, isLoading, error } = api.document.getPublicById.useQuery(
    { id: id ?? "" },
    { enabled: !!id }
  );

  const attachments = useMemo(
    () => (document?.attachments && document.attachments.length > 0 ? document.attachments : []),
    [document?.attachments]
  );

  if (!id) {
    return <ErrorView message="Identificador do documento não informado." onBack={() => router.back()} />;
  }

  if (isLoading) {
    return <LoadingView onBack={() => router.back()} />;
  }

  if (error || !document) {
    return (
      <ErrorView
        message={error?.message ?? "O documento solicitado não existe ou não está mais disponível."}
        onBack={() => router.back()}
      />
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <header className="shrink-0 border-b bg-card py-6 px-4">
          <DocumentInfo document={document} />
        </header>
        <main className="flex-1 container max-w-2xl py-8">
          <Card>
            <CardContent className="py-12">
              <NoAttachmentsView />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="shrink-0 border-b bg-card py-6 px-4">
        <DocumentInfo document={document} />
      </header>
      <Card className="m-4">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-muted-foreground" aria-hidden />
              Anexos
            </CardTitle>
            <Badge variant="secondary" className="font-normal">
              {attachments.length} {attachments.length === 1 ? "arquivo" : "arquivos"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em um anexo para abri-lo em uma nova aba do navegador.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-3" role="list">
            {attachments.map((att) => (
              <li key={att.id}>
                <AttachmentLink attachment={att} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
