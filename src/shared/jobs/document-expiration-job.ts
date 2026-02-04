import cron from "node-cron";
import { prisma } from "@/src/shared/lib/prisma";
import { sendDocumentExpirationEmail } from "@/src/shared/services/email-service";

/**
 * Job que roda diariamente às 08:00 para verificar documentos que vencem no dia
 * e enviar emails de alerta
 */
export function startDocumentExpirationJob() {
  // Roda todos os dias às 08:00
  cron.schedule("0 8 * * *", async () => {
    console.log("[Document Expiration Job] Iniciando verificação de documentos vencendo hoje...");

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Buscar documentos que vencem hoje (entre hoje 00:00 e amanhã 00:00)
      const expiringDocuments = await prisma.document.findMany({
        where: {
          status: "ACTIVE",
          expirationDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          template: {
            select: {
              name: true,
            },
          },
          organization: {
            select: {
              shortName: true,
            },
          },
          company: {
            select: {
              name: true,
            },
          },
          establishment: {
            select: {
              name: true,
            },
          },
          responsible: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      console.log(
        `[Document Expiration Job] Encontrados ${expiringDocuments.length} documento(s) vencendo hoje`
      );

      let sentCount = 0;
      let errorCount = 0;

      for (const document of expiringDocuments) {
        if (!document.expirationDate) continue;

        try {
          await sendDocumentExpirationEmail({
            templateName: document.template?.name || "Documento",
            organizationName: document.organization?.shortName || "",
            companyName: document.company?.name || "",
            establishmentName: document.establishment?.name || "",
            responsibleName: document.responsible?.name || "",
            responsibleEmail: document.responsible?.email || undefined,
            expirationDate: document.expirationDate.toISOString(),
            alertDate: document.alertDate?.toISOString() || null,
            status: document.status,
            customData: document.customData as Record<string, any> | null,
            observations: document.observations,
            documentId: document.id,
          });

          sentCount++;
          console.log(
            `[Document Expiration Job] Email enviado para documento ${document.id} (${document.template?.name})`
          );
        } catch (error) {
          errorCount++;
          console.error(
            `[Document Expiration Job] Erro ao enviar email para documento ${document.id}:`,
            error
          );
        }
      }

      console.log(
        `[Document Expiration Job] Concluído: ${sentCount} enviado(s), ${errorCount} erro(s)`
      );
    } catch (error) {
      console.error("[Document Expiration Job] Erro ao processar job:", error);
    }
  });

  console.log("[Document Expiration Job] Job agendado para rodar diariamente às 08:00");
}













