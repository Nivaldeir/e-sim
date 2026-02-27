import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/shared/config/auth";
import { prisma } from "@/src/shared/lib/prisma";
import { uploadToMinio } from "@/src/shared/lib/minio";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const documentId = formData.get("documentId") as string;

    if (!documentId) {
      return NextResponse.json({ error: "documentId é obrigatório" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const uploadedAttachments: Array<{
      id: string;
      fileName: string;
      filePath: string;
    }> = [];

    const bucket = process.env.MINIO_BUCKET_DOCUMENTS || "documents";

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded = await uploadToMinio({
        bucket,
        fileName: file.name,
        buffer,
        contentType: file.type,
        prefix: documentId ? `documents/${documentId}` : "documents",
      });

      const attachment = await prisma.documentAttachment.create({
        data: {
          documentId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "application/octet-stream",
          filePath: uploaded.url,
        },
      });

      uploadedAttachments.push({
        id: attachment.id,
        fileName: attachment.fileName,
        filePath: attachment.filePath,
      });
    }

    return NextResponse.json({
      success: true,
      attachments: uploadedAttachments,
      message: `${uploadedAttachments.length} anexo(s) enviado(s) com sucesso`,
    });
  } catch (error) {
    console.error("Erro no upload de anexos:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao fazer upload",
      },
      { status: 500 }
    );
  }
}











