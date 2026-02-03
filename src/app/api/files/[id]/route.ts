import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/shared/config/auth";
import { prisma } from "@/src/shared/lib/prisma";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const file = await prisma.file.findUnique({
      where: { id: params.id },
    });

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    // Verificar permissões (se o arquivo pertence ao usuário ou se é admin)
    const userId = (session.user as any)?.id;
    const isAdmin = (session.user as any)?.roles?.includes("ADMINISTRADOR");

    if (!isAdmin && file.createdBy !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Se o arquivo tem URL, redirecionar
    if (file.url) {
      return NextResponse.redirect(file.url);
    }

    // Se o arquivo tem path, tentar ler do sistema de arquivos
    if (file.path) {
      try {
        // Verificar se o arquivo existe
        if (!existsSync(file.path)) {
          return NextResponse.json(
            { message: "File not found on disk" },
            { status: 404 }
          );
        }

        const fileBuffer = await readFile(file.path);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": file.mimeType,
            "Content-Disposition": `inline; filename="${file.originalName}"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
      } catch (error) {
        console.error("Erro ao ler arquivo:", error);
        return NextResponse.json(
          { message: "File not found on disk" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: "File path or URL not available" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

