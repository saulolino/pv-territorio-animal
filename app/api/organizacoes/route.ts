import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(2),
  tipo: z.enum(["abrigo", "ong", "empresa", "publica"]),
  cnpj: z.string().optional(),
  raId: z.number().int().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  site: z.string().url().optional().or(z.literal("")),
  descricao: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  const orgs = await prisma.organizacao.findMany({
    where: tipo ? { tipo: tipo as "abrigo" | "ong" | "empresa" | "publica" } : undefined,
    orderBy: [{ verificada: "desc" }, { nome: "asc" }],
    select: {
      id: true,
      nome: true,
      tipo: true,
      descricao: true,
      verificada: true,
      ra: { select: { nome: true, sigla: true } },
      _count: { select: { protetores: true } },
    },
  });

  return NextResponse.json(orgs, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const org = await prisma.organizacao.create({ data: parsed.data });
  return NextResponse.json(org, { status: 201 });
}
