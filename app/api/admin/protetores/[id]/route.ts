import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { verificado } = await req.json();
  const protetor = await prisma.perfilProtetor.update({
    where: { id: params.id },
    data: { verificado: Boolean(verificado) },
    select: { id: true, verificado: true },
  });

  return NextResponse.json(protetor);
}
