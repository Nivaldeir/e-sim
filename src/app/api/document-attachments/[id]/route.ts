import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/lib/prisma";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import {
  parseMinioUrl,
  getObjectFromMinio,
} from "@/src/shared/lib/minio";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const attachment = await prisma.documentAttachment.findUnique({
      where: { id: params.id },
      include: {
        document: true,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { message: "Anexo não encontrado" },
        { status: 404 }
      );
    }

    const filePath = attachment.filePath;
    const headers = {
      "Content-Type": attachment.fileType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${attachment.fileName}"`,
      "Cache-Control": "public, max-age=3600",
    };

    if (filePath?.startsWith("http://") || filePath?.startsWith("https://")) {
      const parsed = parseMinioUrl(filePath);
      if (parsed) {
        try {
          const stream = await getObjectFromMinio(
            parsed.bucket,
            parsed.objectName
          );
          return new NextResponse(stream, { headers });
        } catch (error) {
          console.error("Erro ao buscar anexo no MinIO:", error);
          return NextResponse.json(
            { message: "Erro ao ler arquivo" },
            { status: 500 }
          );
        }
      }
    }

    if (filePath && existsSync(filePath)) {
      try {
        const fileBuffer = await readFile(filePath);
        return new NextResponse(fileBuffer, { headers });
      } catch (error) {
        console.error("Erro ao ler anexo:", error);
        return NextResponse.json(
          { message: "Erro ao ler arquivo" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: "Arquivo não encontrado no sistema" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching attachment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
