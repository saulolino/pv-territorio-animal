import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "protetor") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const protetor = await prisma.perfilProtetor.findUnique({
    where: { usuarioId: session.sub },
    include: {
      usuario: { select: { nomeCompleto: true, email: true, telefone: true } },
      ra: { select: { nome: true, sigla: true } },
      organizacao: { select: { nome: true } },
    },
  });

  if (!protetor) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  return NextResponse.json(protetor);
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "protetor") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { nomeCompleto, telefone, descricao, raId, fotoPerfil, redesSociais } = body;

  const [protetor] = await prisma.$transaction([
    prisma.perfilProtetor.update({
      where: { usuarioId: session.sub },
      data: { descricao, raId: raId || null, fotoPerfil, redesSociais },
    }),
    prisma.usuario.update({
      where: { id: session.sub },
      data: { nomeCompleto, telefone },
    }),
  ]);

  return NextResponse.json(protetor);
}
