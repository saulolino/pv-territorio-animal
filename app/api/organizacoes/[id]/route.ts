import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const org = await prisma.organizacao.findUnique({
    where: { id: params.id },
    include: {
      ra: { select: { nome: true, sigla: true } },
      protetores: {
        where: { verificado: true },
        select: {
          id: true,
          tipoProtetor: true,
          usuario: { select: { nomeCompleto: true } },
          _count: { select: { animais: { where: { status: "disponivel" } } } },
        },
        take: 20,
      },
    },
  });

  if (!org) return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });
  return NextResponse.json(org);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const org = await prisma.organizacao.update({ where: { id: params.id }, data: body });
  return NextResponse.json(org);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  await prisma.organizacao.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
