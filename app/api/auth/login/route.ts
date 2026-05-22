import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, buildSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const usuario = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (!usuario || !usuario.ativo) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const senhaOk = await bcrypt.compare(data.senha, usuario.senhaHash);
    if (!senhaOk) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    if (!usuario.emailVerificado) {
      return NextResponse.json({ error: "E-mail não verificado. Verifique sua caixa de entrada." }, { status: 403 });
    }

    const token = await signToken({
      sub: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo as "protetor" | "adotante" | "admin",
      nomeCompleto: usuario.nomeCompleto,
    });

    const res = NextResponse.json({
      usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo, nomeCompleto: usuario.nomeCompleto },
    });
    res.headers.set("Set-Cookie", buildSessionCookie(token));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
