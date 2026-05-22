import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ras = await prisma.regiaoAdministrativa.findMany({
    select: { id: true, nome: true, sigla: true, regiao: true },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(ras, {
    headers: { "Cache-Control": "public, s-maxage=86400" },
  });
}
