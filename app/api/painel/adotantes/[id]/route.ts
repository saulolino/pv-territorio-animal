import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "protetor") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const protetor = await prisma.perfilProtetor.findUnique({ where: { usuarioId: session.sub } });
  if (!protetor) return NextResponse.json({ error: "Protetor não encontrado." }, { status: 404 });

  // Verifica que existe uma solicitação ativa entre este protetor e o adotante
  const solicitacao = await prisma.solicitacaoAdocao.findFirst({
    where: { protetorId: protetor.id, adotanteId: params.id },
  });
  if (!solicitacao) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  const adotante = await prisma.perfilAdotante.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      tipoMoradia: true,
      temAreaExterna: true,
      temOutrosAnimais: true,
      descricaoOutrosAnimais: true,
      jaAdotouAntes: true,
      motivoAdocao: true,
      conheceCustos: true,
      aceitaVisita: true,
      perfilCompleto: true,
      ra: { select: { nome: true, sigla: true } },
      usuario: { select: { nomeCompleto: true, email: true, telefone: true } },
    },
  });

  if (!adotante) return NextResponse.json({ error: "Adotante não encontrado." }, { status: 404 });

  return NextResponse.json(adotante);
}
