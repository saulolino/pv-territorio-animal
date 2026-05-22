import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const solicitacaoId = searchParams.get("solicitacaoId");
  if (!solicitacaoId) return NextResponse.json({ error: "solicitacaoId obrigatório." }, { status: 400 });

  const sol = await prisma.solicitacaoAdocao.findUnique({
    where: { id: solicitacaoId },
    include: {
      adotante: { select: { usuarioId: true } },
      protetor: { select: { usuarioId: true } },
    },
  });

  if (!sol) return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });

  const isParticipant =
    sol.adotante.usuarioId === session.sub ||
    sol.protetor.usuarioId === session.sub ||
    session.tipo === "admin";

  if (!isParticipant) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  const mensagens = await prisma.mensagem.findMany({
    where: { solicitacaoId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      texto: true,
      tipoAutor: true,
      autorId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(mensagens);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { solicitacaoId, texto } = await req.json();
  if (!solicitacaoId || !texto?.trim()) {
    return NextResponse.json({ error: "solicitacaoId e texto são obrigatórios." }, { status: 400 });
  }

  const sol = await prisma.solicitacaoAdocao.findUnique({
    where: { id: solicitacaoId },
    include: {
      adotante: { select: { usuarioId: true } },
      protetor: { select: { usuarioId: true } },
    },
  });

  if (!sol) return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });

  const isParticipant =
    sol.adotante.usuarioId === session.sub || sol.protetor.usuarioId === session.sub;

  if (!isParticipant) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  if (!["aprovada", "em_analise", "pendente"].includes(sol.status)) {
    return NextResponse.json({ error: "Não é possível enviar mensagens nesta solicitação." }, { status: 400 });
  }

  const msg = await prisma.mensagem.create({
    data: {
      solicitacaoId,
      autorId: session.sub,
      tipoAutor: session.tipo as "protetor" | "adotante" | "admin",
      texto: texto.trim(),
    },
  });

  return NextResponse.json(msg, { status: 201 });
}
