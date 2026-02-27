import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "uploads", "companies");

// Apenas nome de arquivo seguro (sem path traversal)
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/;

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    if (!filename || !SAFE_FILENAME.test(filename)) {
      return NextResponse.json({ message: "Arquivo não encontrado" }, { status: 404 });
    }

    const filePath = join(UPLOAD_DIR, filename);
    if (!existsSync(filePath)) {
      return NextResponse.json({ message: "Arquivo não encontrado" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const contentType = MIME[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Erro ao servir logo:", error);
    return NextResponse.json(
      { message: "Erro ao carregar arquivo" },
      { status: 500 }
    );
  }
}
