import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/shared/config/auth";
import { prisma } from "@/src/shared/lib/prisma";
import { sendDocumentExpirationEmail } from "@/src/shared/services/email-service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { documentId, recipientEmail, extraEmails } = body;
    const extraList = Array.isArray(extraEmails)
      ? extraEmails.filter((e: unknown) => typeof e === "string" && e.trim().length > 0)
      : [];
    const recipients = [
      recipientEmail && typeof recipientEmail === "string" ? recipientEmail.trim() : null,
      ...extraList.map((e: string) => e.trim()),
    ].filter(Boolean) as string[];

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar documento completo
    const document = await prisma.document.findUnique({
      where: { id: documentId },
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

    if (!document) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    if (!document.expirationDate) {
      return NextResponse.json(
        { error: "Documento não possui data de expiração" },
        { status: 400 }
      );
    }

    const payload = {
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
    };
    const toEmails =
      recipients.length > 0
        ? recipients
        : document.responsible?.email
          ? [document.responsible.email]
          : [];
    if (toEmails.length === 0) {
      return NextResponse.json(
        { error: "Nenhum destinatário informado e documento sem e-mail do responsável." },
        { status: 400 }
      );
    }
    await sendDocumentExpirationEmail(payload, toEmails);

    return NextResponse.json({
      success: true,
      message: "Email de alerta enviado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao enviar email de alerta:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao enviar email",
      },
      { status: 500 }
    );
  }
}














