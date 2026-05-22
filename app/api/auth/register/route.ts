import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(8),
  nomeCompleto: z.string().min(2),
  telefone: z.string().optional(),
  tipo: z.enum(["protetor", "adotante"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existe = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (existe) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    }

    const senhaHash = await bcrypt.hash(data.senha, 12);
    const tokenVerificacao = generateToken(32);
    const tokenExpiraEm = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const usuario = await prisma.usuario.create({
      data: {
        email: data.email,
        senhaHash,
        nomeCompleto: data.nomeCompleto,
        telefone: data.telefone,
        tipo: data.tipo,
        tokenVerificacao,
        tokenExpiraEm,
      },
    });

    if (data.tipo === "protetor") {
      await prisma.perfilProtetor.create({
        data: {
          usuarioId: usuario.id,
          tipoProtetor: "independente",
        },
      });
    } else {
      await prisma.perfilAdotante.create({
        data: { usuarioId: usuario.id },
      });
    }

    await sendVerificationEmail(data.email, data.nomeCompleto, tokenVerificacao).catch(() => {});

    return NextResponse.json({ message: "Cadastro realizado. Verifique seu e-mail." }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
