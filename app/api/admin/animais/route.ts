import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const animais = await prisma.animal.findMany({
    where: { status: { not: "removido" } },
    orderBy: { createdAt: "desc" },
    include: {
      protetor: { include: { usuario: { select: { nomeCompleto: true } } } },
    },
  });

  return NextResponse.json(animais);
}
