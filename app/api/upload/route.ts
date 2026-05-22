import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/data/www/projects/pv-territorio-animal/uploads";
const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || "https://pets.lino.app.br/uploads";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("foto") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Arquivo muito grande (máx 10MB)." }, { status: 400 });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  const dir = path.join(UPLOAD_DIR, "animais");
  await mkdir(dir, { recursive: true });

  const mainName = `${id}.webp`;
  const thumbName = `${id}_thumb.webp`;

  await sharp(buffer)
    .resize(1200, 900, { fit: "cover", position: "center" })
    .webp({ quality: 82 })
    .toFile(path.join(dir, mainName));

  await sharp(buffer)
    .resize(400, 300, { fit: "cover", position: "center" })
    .webp({ quality: 75 })
    .toFile(path.join(dir, thumbName));

  return NextResponse.json({
    url: `${UPLOAD_URL}/animais/${mainName}`,
    thumbUrl: `${UPLOAD_URL}/animais/${thumbName}`,
  });
}

export const runtime = "nodejs";
