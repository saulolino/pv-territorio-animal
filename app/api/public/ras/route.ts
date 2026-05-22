import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ras = await prisma.regiaoAdministrativa.findMany({
    select: { id: true, codigoRa: true, nome: true, sigla: true, regiao: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(
    { data: ras, total: ras.length },
    { headers: { "Cache-Control": "public, s-maxage=86400", "Access-Control-Allow-Origin": "*" } }
  );
}
