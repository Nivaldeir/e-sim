import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/shared/config/auth";
import { prisma } from "@/src/shared/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "uploads", "documents");

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const documentId = formData.get("documentId") as string;

    if (!documentId) {
      return NextResponse.json({ error: "documentId é obrigatório" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const uploadedAttachments = [];

    for (const file of files) {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop() || "";
      const fileName = `${timestamp}-${randomStr}.${fileExtension}`;
      const filePath = join(UPLOAD_DIR, fileName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      const attachment = await prisma.documentAttachment.create({
        data: {
          documentId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "application/octet-stream",
          filePath: filePath,
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




