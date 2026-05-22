import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAdoptionStatusEmail } from "@/lib/email";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const sol = await prisma.solicitacaoAdocao.findUnique({
    where: { id: params.id },
    include: { adotante: { select: { usuarioId: true } } },
  });

  if (!sol) return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  if (sol.adotante.usuarioId !== session.sub) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }
  if (sol.status !== "pendente") {
    return NextResponse.json({ error: "Apenas solicitações pendentes podem ser canceladas." }, { status: 400 });
  }

  await prisma.solicitacaoAdocao.update({
    where: { id: params.id },
    data: { status: "cancelada" },
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "protetor") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { status, notaInterna } = await req.json();
  const allowed = ["em_analise", "aprovada", "rejeitada", "concluida"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const protetor = await prisma.perfilProtetor.findUnique({ where: { usuarioId: session.sub } });
  const sol = await prisma.solicitacaoAdocao.findUnique({
    where: { id: params.id },
    include: {
      animal: { select: { nome: true } },
      adotante: { include: { usuario: { select: { email: true, nomeCompleto: true } } } },
    },
  });

  if (!sol || sol.protetorId !== protetor?.id) {
    return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  }

  const updated = await prisma.solicitacaoAdocao.update({
    where: { id: params.id },
    data: {
      status,
      notaInterna,
      dataResposta: ["aprovada", "rejeitada"].includes(status) ? new Date() : undefined,
      dataConclusao: status === "concluida" ? new Date() : undefined,
    },
  });

  if (["aprovada", "rejeitada"].includes(status)) {
    await sendAdoptionStatusEmail(
      sol.adotante.usuario.email,
      sol.adotante.usuario.nomeCompleto,
      sol.animal.nome,
      status
    ).catch(() => null);
  }

  return NextResponse.json(updated);
}
