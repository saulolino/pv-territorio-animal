import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ total: 0 });

  const tipoOutro = session.tipo === "protetor" ? "adotante" : "protetor";

  let solicitacaoIds: string[] = [];

  if (session.tipo === "protetor") {
    const protetor = await prisma.perfilProtetor.findUnique({ where: { usuarioId: session.sub } });
    if (!protetor) return NextResponse.json({ total: 0 });
    const sols = await prisma.solicitacaoAdocao.findMany({
      where: { protetorId: protetor.id, status: { in: ["pendente", "em_analise", "aprovada"] } },
      select: { id: true },
    });
    solicitacaoIds = sols.map((s) => s.id);
  } else if (session.tipo === "adotante") {
    const adotante = await prisma.perfilAdotante.findUnique({ where: { usuarioId: session.sub } });
    if (!adotante) return NextResponse.json({ total: 0 });
    const sols = await prisma.solicitacaoAdocao.findMany({
      where: { adotanteId: adotante.id, status: { in: ["pendente", "em_analise", "aprovada"] } },
      select: { id: true },
    });
    solicitacaoIds = sols.map((s) => s.id);
  }

  if (solicitacaoIds.length === 0) return NextResponse.json({ total: 0 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const total = await prisma.mensagem.count({
    where: {
      solicitacaoId: { in: solicitacaoIds },
      tipoAutor: tipoOutro as "protetor" | "adotante",
      createdAt: { gte: since },
    },
  });

  return NextResponse.json({ total });
}
