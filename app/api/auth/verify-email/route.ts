import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token não fornecido." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findFirst({
    where: { tokenVerificacao: token },
  });

  if (!usuario) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }

  if (usuario.tokenExpiraEm && usuario.tokenExpiraEm < new Date()) {
    return NextResponse.json({ error: "Token expirado." }, { status: 400 });
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { emailVerificado: true, tokenVerificacao: null, tokenExpiraEm: null },
  });

  return NextResponse.redirect(new URL("/login?verificado=1", req.url));
}
