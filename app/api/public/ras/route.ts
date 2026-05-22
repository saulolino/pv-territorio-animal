import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`public-ras:${ip}`, 30, 60_000)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em 1 minuto." },
      { status: 429, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
  const ras = await prisma.regiaoAdministrativa.findMany({
    select: { id: true, codigoRa: true, nome: true, sigla: true, regiao: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(
    { data: ras, total: ras.length },
    { headers: { "Cache-Control": "public, s-maxage=86400", "Access-Control-Allow-Origin": "*" } }
  );
}
