import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`public-animais:${ip}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em 1 minuto." },
      { status: 429, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const especie = searchParams.get("especie");
  const sexo = searchParams.get("sexo");
  const porte = searchParams.get("porte");
  const raId = searchParams.get("raId");
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const where = {
    status: "disponivel" as const,
    ...(especie && { especie: especie as "cachorro" | "gato" | "outro" }),
    ...(sexo && { sexo: sexo as "macho" | "femea" }),
    ...(porte && { porte: porte as "mini" | "pequeno" | "medio" | "grande" | "gigante" }),
    ...(raId && { raId: Number(raId) }),
    ...(q && { nome: { contains: q, mode: "insensitive" as const } }),
  };

  const [animais, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        nome: true,
        especie: true,
        sexo: true,
        porte: true,
        idadeEstimadaMeses: true,
        castrado: true,
        vacinado: true,
        destaque: true,
        ra: { select: { id: true, nome: true, sigla: true } },
        fotos: { where: { principal: true }, take: 1, select: { url: true } },
      },
    }),
    prisma.animal.count({ where }),
  ]);

  return NextResponse.json(
    { data: animais, total, page, pages: Math.ceil(total / limit), limit },
    { headers: { "Cache-Control": "public, s-maxage=60", "Access-Control-Allow-Origin": "*" } }
  );
}
