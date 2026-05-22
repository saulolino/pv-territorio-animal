import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAdoptionRequestEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "adotante") {
    return NextResponse.json({ error: "Apenas adotantes podem solicitar adoção." }, { status: 403 });
  }

  const { animalId, mensagem } = await req.json();
  if (!animalId || !mensagem?.trim()) {
    return NextResponse.json({ error: "Animal e mensagem são obrigatórios." }, { status: 400 });
  }

  const adotante = await prisma.perfilAdotante.findUnique({ where: { usuarioId: session.sub } });
  if (!adotante || !adotante.perfilCompleto) {
    return NextResponse.json({ error: "Complete seu perfil antes de solicitar adoção." }, { status: 400 });
  }

  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
    include: {
      protetor: { include: { usuario: { select: { email: true, nomeCompleto: true } } } },
    },
  });
  if (!animal || animal.status !== "disponivel") {
    return NextResponse.json({ error: "Animal não disponível para adoção." }, { status: 400 });
  }

  const existing = await prisma.solicitacaoAdocao.findUnique({
    where: { animalId_adotanteId: { animalId, adotanteId: adotante.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Você já possui uma solicitação para este animal." }, { status: 409 });
  }

  const solicitacao = await prisma.solicitacaoAdocao.create({
    data: {
      animalId,
      adotanteId: adotante.id,
      protetorId: animal.protetorId,
      mensagemAdotante: mensagem,
    },
  });

  await sendAdoptionRequestEmail(
    animal.protetor.usuario.email,
    animal.protetor.usuario.nomeCompleto,
    animal.nome,
    session.nomeCompleto
  ).catch(() => null);

  return NextResponse.json(solicitacao, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  if (session.tipo === "adotante") {
    const adotante = await prisma.perfilAdotante.findUnique({ where: { usuarioId: session.sub } });
    if (!adotante) return NextResponse.json([]);
    const solicitacoes = await prisma.solicitacaoAdocao.findMany({
      where: { adotanteId: adotante.id },
      include: { animal: { include: { fotos: { where: { principal: true }, take: 1 } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(solicitacoes);
  }

  if (session.tipo === "protetor") {
    const protetor = await prisma.perfilProtetor.findUnique({ where: { usuarioId: session.sub } });
    if (!protetor) return NextResponse.json([]);
    const solicitacoes = await prisma.solicitacaoAdocao.findMany({
      where: { protetorId: protetor.id },
      include: {
        animal: { select: { nome: true, slug: true } },
        adotante: { include: { usuario: { select: { nomeCompleto: true, email: true, telefone: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(solicitacoes);
  }

  return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
}
