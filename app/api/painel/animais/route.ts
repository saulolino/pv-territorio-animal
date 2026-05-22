import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "protetor") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const protetor = await prisma.perfilProtetor.findUnique({ where: { usuarioId: session.sub } });
  if (!protetor) return NextResponse.json([]);

  const animais = await prisma.animal.findMany({
    where: { protetorId: protetor.id },
    orderBy: { createdAt: "desc" },
    include: { fotos: { where: { principal: true }, take: 1 } },
  });

  return NextResponse.json(animais);
}
