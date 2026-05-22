import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [disponiveis, adotados, protetores, ras] = await Promise.all([
    prisma.animal.count({ where: { status: "disponivel" } }),
    prisma.animal.count({ where: { status: "adotado" } }),
    prisma.perfilProtetor.count(),
    prisma.regiaoAdministrativa.count(),
  ]);

  return NextResponse.json(
    { disponiveis, adotados, protetores, ras },
    { headers: { "Cache-Control": "public, s-maxage=300", "Access-Control-Allow-Origin": "*" } }
  );
}
