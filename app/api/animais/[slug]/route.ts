import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const animal = await prisma.animal.findUnique({
    where: { slug: params.slug },
    include: {
      fotos: { orderBy: { ordem: "asc" } },
      ra: { select: { nome: true, sigla: true } },
      protetor: {
        include: {
          usuario: { select: { nomeCompleto: true, telefone: true } },
          organizacao: { select: { nome: true } },
        },
      },
    },
  });
  if (!animal) return NextResponse.json({ error: "Animal não encontrado." }, { status: 404 });
  return NextResponse.json(animal);
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo === "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const animal = await prisma.animal.findUnique({
    where: { slug: params.slug },
    include: { protetor: { select: { usuarioId: true } } },
  });
  if (!animal) return NextResponse.json({ error: "Animal não encontrado." }, { status: 404 });

  if (session.tipo !== "admin" && animal.protetor.usuarioId !== session.sub) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fotos: _fotos, ...data } = body;
    const updated = await prisma.animal.update({
      where: { slug: params.slug },
      data,
      include: { fotos: { orderBy: { ordem: "asc" } } },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo === "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const animal = await prisma.animal.findUnique({
    where: { slug: params.slug },
    include: { protetor: { select: { usuarioId: true } } },
  });
  if (!animal) return NextResponse.json({ error: "Animal não encontrado." }, { status: 404 });

  if (session.tipo !== "admin" && animal.protetor.usuarioId !== session.sub) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await prisma.animal.update({ where: { slug: params.slug }, data: { status: "removido" } });
  return NextResponse.json({ message: "Animal removido." });
}
