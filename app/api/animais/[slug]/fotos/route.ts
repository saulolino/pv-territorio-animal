import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo === "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const animal = await prisma.animal.findUnique({
    where: { slug: params.slug },
    include: { protetor: { select: { usuarioId: true } }, fotos: { select: { ordem: true } } },
  });
  if (!animal) return NextResponse.json({ error: "Animal não encontrado." }, { status: 404 });

  if (session.tipo !== "admin" && animal.protetor.usuarioId !== session.sub) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  if (animal.fotos.length >= 8) {
    return NextResponse.json({ error: "Máximo de 8 fotos por animal." }, { status: 400 });
  }

  const { url, thumbUrl } = await req.json();
  const maxOrdem = animal.fotos.reduce((m, f) => Math.max(m, f.ordem), -1);
  const isPrincipal = animal.fotos.length === 0;

  const foto = await prisma.fotoAnimal.create({
    data: { animalId: animal.id, url: thumbUrl || url, ordem: maxOrdem + 1, principal: isPrincipal },
  });

  return NextResponse.json(foto, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo === "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { fotoId } = await req.json();
  const foto = await prisma.fotoAnimal.findUnique({
    where: { id: fotoId },
    include: { animal: { include: { protetor: { select: { usuarioId: true } } } } },
  });
  if (!foto || foto.animal.slug !== params.slug) {
    return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  }
  if (session.tipo !== "admin" && foto.animal.protetor.usuarioId !== session.sub) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await prisma.fotoAnimal.delete({ where: { id: fotoId } });

  if (foto.principal) {
    const outra = await prisma.fotoAnimal.findFirst({ where: { animalId: foto.animalId }, orderBy: { ordem: "asc" } });
    if (outra) await prisma.fotoAnimal.update({ where: { id: outra.id }, data: { principal: true } });
  }

  return NextResponse.json({ message: "Foto removida." });
}
