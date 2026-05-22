import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "protetor") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const protetor = await prisma.perfilProtetor.findUnique({ where: { usuarioId: session.sub } });
  if (!protetor) return NextResponse.json({ animais: 0, disponiveis: 0, solicitacoesPendentes: 0, adotados: 0 });

  const [animais, disponiveis, adotados, solicitacoesPendentes] = await Promise.all([
    prisma.animal.count({ where: { protetorId: protetor.id } }),
    prisma.animal.count({ where: { protetorId: protetor.id, status: "disponivel" } }),
    prisma.animal.count({ where: { protetorId: protetor.id, status: "adotado" } }),
    prisma.solicitacaoAdocao.count({ where: { protetorId: protetor.id, status: "pendente" } }),
  ]);

  return NextResponse.json({ animais, disponiveis, adotados, solicitacoesPendentes });
}
