import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  await prisma.usuario.update({
    where: { id: session.sub },
    data: {
      nomeCompleto: "Usuário removido",
      email: `removido_${session.sub}@pvterritorioanimal.invalid`,
      senhaHash: "",
      emailVerificado: false,
    },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("pv_session", "", { maxAge: 0, path: "/" });
  return response;
}
