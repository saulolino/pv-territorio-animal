import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const [usuarios, animais, solicitacoes, protetores, porEspecie, porStatus, topRas] = await Promise.all([
    prisma.usuario.count(),
    prisma.animal.count({ where: { status: { not: "removido" } } }),
    prisma.solicitacaoAdocao.count(),
    prisma.perfilProtetor.count(),
    prisma.animal.groupBy({ by: ["especie"], _count: { id: true }, where: { status: { not: "removido" } } }),
    prisma.animal.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.regiaoAdministrativa.findMany({
      select: {
        nome: true,
        sigla: true,
        _count: { select: { animais: { where: { status: "disponivel" } } } },
      },
      orderBy: { animais: { _count: "desc" } },
      take: 8,
    }),
  ]);

  // Solicitações por semana (últimas 8 semanas)
  const oitoSemanasAtras = new Date();
  oitoSemanasAtras.setDate(oitoSemanasAtras.getDate() - 56);
  const solicitacoesRecentes = await prisma.solicitacaoAdocao.findMany({
    where: { createdAt: { gte: oitoSemanasAtras } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Agrupa por semana
  const semanas: Record<string, number> = {};
  solicitacoesRecentes.forEach(({ createdAt }) => {
    const d = new Date(createdAt);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay());
    const key = startOfWeek.toISOString().slice(0, 10);
    semanas[key] = (semanas[key] || 0) + 1;
  });
  const solicitacoesPorSemana = Object.entries(semanas)
    .map(([semana, total]) => ({ semana, total }))
    .sort((a, b) => a.semana.localeCompare(b.semana));

  return NextResponse.json({
    usuarios,
    animais,
    solicitacoes,
    protetores,
    porEspecie: porEspecie.map((e) => ({ especie: e.especie, total: e._count.id })),
    porStatus: porStatus.map((s) => ({ status: s.status, total: s._count.id })),
    topRas: topRas.map((r) => ({ nome: r.sigla || r.nome, total: r._count.animais })),
    solicitacoesPorSemana,
  });
}
