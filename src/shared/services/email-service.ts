import ejs from "ejs";
import { join } from "path";
import { sendEmail } from "@/src/shared/lib/email";

export interface DocumentExpirationData {
  templateName: string;
  organizationName: string;
  companyName: string;
  establishmentName: string;
  responsibleName: string;
  responsibleEmail?: string;
  expirationDate: string;
  alertDate?: string | null;
  status: string;
  customData?: Record<string, any> | null;
  observations?: string | null;
  documentId: string;
}

export async function sendDocumentExpirationEmail(
  document: DocumentExpirationData,
  recipientEmails?: string | string[]
) {
  const EMAIL_TO_RECEIVE = process.env.EMAIL_TO_RECEIVE;
  const SYSTEM_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const single = typeof recipientEmails === "string" ? recipientEmails : undefined;
  const list = Array.isArray(recipientEmails)
    ? recipientEmails
    : single
      ? [single]
      : [document.responsibleEmail, EMAIL_TO_RECEIVE].filter(Boolean) as string[];
  const to = list.length > 0 ? list : [document.responsibleEmail || EMAIL_TO_RECEIVE].filter(Boolean);

  if (to.length === 0 || !to[0]) {
    throw new Error("Email do destinatário não configurado");
  }

  const templatePath = join(
    process.cwd(),
    "src",
    "shared",
    "templates",
    "email",
    "document-expiration.ejs"
  );

  const statusLabels: Record<string, string> = {
    ACTIVE: "Ativo",
    EXPIRED: "Expirado",
    PENDING: "Pendente",
    CANCELLED: "Cancelado",
  };

  const html = await ejs.renderFile(templatePath, {
    templateName: document.templateName,
    organizationName: document.organizationName,
    companyName: document.companyName,
    establishmentName: document.establishmentName,
    responsibleName: document.responsibleName,
    expirationDate: new Date(document.expirationDate).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    alertDate: document.alertDate
      ? new Date(document.alertDate).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null,
    status: statusLabels[document.status] || document.status,
    customData: document.customData || {},
    observations: document.observations,
    systemUrl: SYSTEM_URL,
    documentId: document.documentId,
  });

  await sendEmail({
    to: to.length === 1 ? to[0]! : to,
    subject: `⚠️ Alerta: Documento "${document.templateName}" próximo do vencimento`,
    html,
  });
}

