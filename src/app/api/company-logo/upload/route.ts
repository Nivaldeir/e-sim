import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/shared/config/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "uploads", "companies");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

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
    const file = formData.get("logo") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo não permitido. Use JPEG, PNG, GIF ou WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 2MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.${ext}`;
    const filePath = join(UPLOAD_DIR, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      logoUrl: fileName,
      message: "Logo enviada com sucesso",
    });
  } catch (error) {
    console.error("Erro no upload da logo:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao fazer upload da logo",
      },
      { status: 500 }
    );
  }
}
