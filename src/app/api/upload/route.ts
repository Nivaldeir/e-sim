import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/shared/config/auth";
import { prisma } from "@/src/shared/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "uploads");

// Garantir que o diretório de uploads existe
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
    const folderId = formData.get("folderId") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const userId = (session.user as any)?.id;
    const uploadedFiles = [];

    for (const file of files) {
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop() || "";
      const fileName = `${timestamp}-${randomStr}.${fileExtension}`;
      const filePath = join(UPLOAD_DIR, fileName);

      // Salvar arquivo no disco
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Criar registro no banco
      const dbFile = await prisma.file.create({
        data: {
          name: fileName,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          path: filePath,
          folderId: folderId || null,
          createdBy: userId,
        },
      });

      uploadedFiles.push({
        id: dbFile.id,
        name: dbFile.originalName,
        path: dbFile.path,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao fazer upload",
      },
      { status: 500 }
    );
  }
}
