import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const protetores = await prisma.perfilProtetor.findMany({
    orderBy: [{ verificado: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      tipoProtetor: true,
      verificado: true,
      createdAt: true,
      usuario: { select: { nomeCompleto: true, email: true } },
      ra: { select: { nome: true, sigla: true } },
      _count: { select: { animais: { where: { status: "disponivel" } } } },
    },
  });

  return NextResponse.json(protetores);
}
