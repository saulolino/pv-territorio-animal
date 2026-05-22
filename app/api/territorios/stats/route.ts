import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const stats = await prisma.regiaoAdministrativa.findMany({
    select: {
      codigoRa: true,
      nome: true,
      sigla: true,
      _count: {
        select: {
          animais: { where: { status: "disponivel" } },
        },
      },
    },
    orderBy: { codigoRa: "asc" },
  });

  const result = stats.map((ra) => ({
    codigoRa: ra.codigoRa,
    nome: ra.nome,
    sigla: ra.sigla,
    animaisDisponiveis: ra._count.animais,
  }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
