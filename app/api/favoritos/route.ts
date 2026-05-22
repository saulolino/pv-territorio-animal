import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const adotante = await prisma.perfilAdotante.findUnique({ where: { usuarioId: session.sub } });
  if (!adotante) return NextResponse.json([], { status: 200 });

  const favoritos = await prisma.favorito.findMany({
    where: { adotanteId: adotante.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      animalId: true,
      createdAt: true,
      animal: {
        select: {
          slug: true,
          nome: true,
          especie: true,
          sexo: true,
          porte: true,
          status: true,
          fotos: { where: { principal: true }, take: 1, select: { url: true } },
          ra: { select: { nome: true, sigla: true } },
        },
      },
    },
  });

  return NextResponse.json(favoritos);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { animalId } = await req.json();
  if (!animalId) return NextResponse.json({ error: "animalId obrigatório." }, { status: 400 });

  const adotante = await prisma.perfilAdotante.findUnique({ where: { usuarioId: session.sub } });
  if (!adotante) return NextResponse.json({ error: "Perfil de adotante não encontrado." }, { status: 404 });

  const fav = await prisma.favorito.upsert({
    where: { adotanteId_animalId: { adotanteId: adotante.id, animalId } },
    create: { adotanteId: adotante.id, animalId },
    update: {},
  });

  return NextResponse.json(fav, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { animalId } = await req.json();
  const adotante = await prisma.perfilAdotante.findUnique({ where: { usuarioId: session.sub } });
  if (!adotante) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  await prisma.favorito.deleteMany({
    where: { adotanteId: adotante.id, animalId },
  });

  return NextResponse.json({ ok: true });
}
