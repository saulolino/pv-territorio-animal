import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    // Resposta genérica para não revelar se o e-mail existe
    if (!usuario || !usuario.ativo) {
      return NextResponse.json({ message: "Se o e-mail existir, você receberá as instruções." });
    }

    const token = generateToken(32);
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tokenReset: token, tokenResetExpira: expira },
    });

    await sendPasswordResetEmail(email, usuario.nomeCompleto, token).catch(() => {});

    return NextResponse.json({ message: "Se o e-mail existir, você receberá as instruções." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
