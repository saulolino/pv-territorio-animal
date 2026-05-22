import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slugify";

const animalSchema = z.object({
  nome: z.string().min(1).max(100),
  especie: z.enum(["cachorro", "gato", "outro"]),
  raca: z.string().max(100).optional(),
  sexo: z.enum(["macho", "femea"]),
  idadeEstimadaMeses: z.number().int().min(0).optional().nullable(),
  porte: z.enum(["mini", "pequeno", "medio", "grande", "gigante"]),
  cor: z.string().max(100).optional(),
  descricao: z.string().min(10),
  castrado: z.boolean().optional().nullable(),
  vacinado: z.boolean().optional().nullable(),
  vermifugado: z.boolean().optional().nullable(),
  microchipado: z.boolean().optional(),
  necessidadesEspeciais: z.string().optional(),
  bomComCriancas: z.boolean().optional().nullable(),
  bomComOutrosAnimais: z.boolean().optional().nullable(),
  bomComGatos: z.boolean().optional().nullable(),
  raId: z.number().int().optional().nullable(),
  destaque: z.boolean().optional(),
  fotos: z.array(z.object({ url: z.string().url(), thumbUrl: z.string().url().optional(), ordem: z.number().optional(), principal: z.boolean().optional() })).optional(),
});

// Galeria pública
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const especie = sp.get("especie");
  const sexo = sp.get("sexo");
  const porte = sp.get("porte");
  const raId = sp.get("raId");
  const castrado = sp.get("castrado");
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = 12;

  const q = sp.get("q")?.trim();

  const where: Record<string, unknown> = { status: "disponivel" };
  if (especie) where.especie = especie;
  if (sexo) where.sexo = sexo;
  if (porte) where.porte = porte;
  if (raId) where.raId = Number(raId);
  if (castrado !== null && castrado !== "") where.castrado = castrado === "true";
  if (q) where.nome = { contains: q, mode: "insensitive" };

  const [animais, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        fotos: { where: { principal: true }, take: 1 },
        ra: { select: { nome: true, sigla: true } },
        protetor: { select: { usuario: { select: { nomeCompleto: true } } } },
      },
    }),
    prisma.animal.count({ where }),
  ]);

  return NextResponse.json({ animais, total, page, pages: Math.ceil(total / limit) });
}

// Criar animal (protetor autenticado)
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo === "adotante") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  try {
    const body = animalSchema.parse(await req.json());

    const protetor = await prisma.perfilProtetor.findUnique({ where: { usuarioId: session.sub } });
    if (!protetor) return NextResponse.json({ error: "Perfil de protetor não encontrado." }, { status: 404 });

    const slug = await uniqueSlug(
      `${body.nome}-${body.especie}`,
      async (s) => !!(await prisma.animal.findUnique({ where: { slug: s } }))
    );

    const { fotos, ...animalData } = body;

    const animal = await prisma.animal.create({
      data: {
        ...animalData,
        slug,
        protetorId: protetor.id,
        fotos: fotos && fotos.length > 0
          ? { create: fotos.map((f, i) => ({ url: f.url, ordem: f.ordem ?? i, principal: i === 0 })) }
          : undefined,
      },
      include: { fotos: true },
    });

    return NextResponse.json(animal, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
