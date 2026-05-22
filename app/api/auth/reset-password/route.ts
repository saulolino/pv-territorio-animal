import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
  senha: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const { token, senha } = schema.parse(await req.json());

    const usuario = await prisma.usuario.findFirst({ where: { tokenReset: token } });
    if (!usuario || !usuario.tokenResetExpira || usuario.tokenResetExpira < new Date()) {
      return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senhaHash, tokenReset: null, tokenResetExpira: null },
    });

    return NextResponse.json({ message: "Senha redefinida com sucesso." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
