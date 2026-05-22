import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escapeCsv(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(cols: unknown[]): string {
  return cols.map(escapeCsv).join(",");
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.tipo !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") ?? "animais";

  let csv = "";

  if (tipo === "animais") {
    const animais = await prisma.animal.findMany({
      where: { status: { not: "removido" } },
      orderBy: { createdAt: "desc" },
      select: {
        nome: true,
        especie: true,
        sexo: true,
        porte: true,
        status: true,
        castrado: true,
        vacinado: true,
        idadeEstimadaMeses: true,
        createdAt: true,
        ra: { select: { nome: true } },
        protetor: { select: { usuario: { select: { nomeCompleto: true, email: true } } } },
      },
    });

    const header = ["Nome", "Espécie", "Sexo", "Porte", "Status", "Castrado", "Vacinado", "Idade (meses)", "RA", "Protetor", "E-mail protetor", "Cadastro"];
    csv = [header.join(","), ...animais.map((a) =>
      row([
        a.nome,
        a.especie,
        a.sexo,
        a.porte,
        a.status,
        a.castrado === true ? "Sim" : a.castrado === false ? "Não" : "",
        a.vacinado === true ? "Sim" : a.vacinado === false ? "Não" : "",
        a.idadeEstimadaMeses,
        a.ra?.nome,
        a.protetor.usuario.nomeCompleto,
        a.protetor.usuario.email,
        new Date(a.createdAt).toLocaleDateString("pt-BR"),
      ])
    )].join("\n");
  } else if (tipo === "solicitacoes") {
    const sols = await prisma.solicitacaoAdocao.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        status: true,
        createdAt: true,
        dataResposta: true,
        animal: { select: { nome: true, especie: true } },
        adotante: { select: { usuario: { select: { nomeCompleto: true, email: true } } } },
        protetor: { select: { usuario: { select: { nomeCompleto: true } } } },
      },
    });

    const header = ["Animal", "Espécie", "Adotante", "E-mail adotante", "Protetor", "Status", "Data solicitação", "Data resposta"];
    csv = [header.join(","), ...sols.map((s) =>
      row([
        s.animal.nome,
        s.animal.especie,
        s.adotante.usuario.nomeCompleto,
        s.adotante.usuario.email,
        s.protetor.usuario.nomeCompleto,
        s.status,
        new Date(s.createdAt).toLocaleDateString("pt-BR"),
        s.dataResposta ? new Date(s.dataResposta).toLocaleDateString("pt-BR") : "",
      ])
    )].join("\n");
  } else {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }

  const filename = `${tipo}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
