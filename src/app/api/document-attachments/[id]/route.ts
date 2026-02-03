import { NextResponse } from "next/server";
import { prisma } from "@/src/shared/lib/prisma";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

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
      return NextResponse.json({ message: "Anexo não encontrado" }, { status: 404 });
    }

    if (attachment.filePath && existsSync(attachment.filePath)) {
      try {
        const fileBuffer = await readFile(attachment.filePath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": attachment.fileType,
            "Content-Disposition": `inline; filename="${attachment.fileName}"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
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

