import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`public-stats:${ip}`, 30, 60_000)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em 1 minuto." },
      { status: 429, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
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
