import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const adotante = await prisma.perfilAdotante.findUnique({
    where: { usuarioId: session.sub },
    include: { usuario: { select: { nomeCompleto: true, email: true, telefone: true } } },
  });

  if (!adotante) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  return NextResponse.json(adotante);
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { nomeCompleto, telefone, tipoMoradia, temAreaExterna, temOutrosAnimais,
    descricaoOutrosAnimais, jaAdotouAntes, motivoAdocao, conheceCustos, aceitaVisita } = body;

  const perfilCompleto = !!(tipoMoradia && motivoAdocao && conheceCustos && aceitaVisita);

  const [adotante] = await prisma.$transaction([
    prisma.perfilAdotante.update({
      where: { usuarioId: session.sub },
      data: {
        tipoMoradia: tipoMoradia || null,
        temAreaExterna: temAreaExterna ?? null,
        temOutrosAnimais: !!temOutrosAnimais,
        descricaoOutrosAnimais: descricaoOutrosAnimais || null,
        jaAdotouAntes: !!jaAdotouAntes,
        motivoAdocao: motivoAdocao || null,
        conheceCustos: !!conheceCustos,
        aceitaVisita: !!aceitaVisita,
        perfilCompleto,
      },
    }),
    prisma.usuario.update({
      where: { id: session.sub },
      data: { nomeCompleto, telefone: telefone || null },
    }),
  ]);

  return NextResponse.json(adotante);
}
