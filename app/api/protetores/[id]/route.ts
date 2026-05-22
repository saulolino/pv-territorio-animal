import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const protetor = await prisma.perfilProtetor.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      tipoProtetor: true,
      descricao: true,
      fotoPerfil: true,
      verificado: true,
      createdAt: true,
      usuario: { select: { nomeCompleto: true } },
      ra: { select: { nome: true, sigla: true } },
      animais: {
        where: { status: "disponivel" },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          slug: true,
          nome: true,
          especie: true,
          sexo: true,
          porte: true,
          fotos: { where: { principal: true }, take: 1, select: { url: true } },
        },
      },
      _count: { select: { animais: { where: { status: "disponivel" } } } },
    },
  });

  if (!protetor) return NextResponse.json({ error: "Protetor não encontrado." }, { status: 404 });

  return NextResponse.json(protetor, {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}
