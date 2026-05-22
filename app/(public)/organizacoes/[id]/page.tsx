"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Org {
  id: string;
  nome: string;
  tipo: string;
  cnpj: string | null;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  site: string | null;
  descricao: string | null;
  verificada: boolean;
  createdAt: string;
  ra: { nome: string; sigla: string } | null;
  protetores: {
    id: string;
    tipoProtetor: string;
    usuario: { nomeCompleto: string };
    _count: { animais: number };
  }[];
}

const tipoLabels: Record<string, string> = {
  abrigo: "Abrigo",
  ong: "ONG",
  empresa: "Empresa",
  publica: "Entidade pública",
};

const tipoProtetorLabels: Record<string, string> = {
  independente: "Protetor independente",
  lar_temporario: "Lar temporário",
  abrigo: "Abrigo",
  ong: "ONG",
};

export default function OrgPage() {
  const params = useParams();
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/organizacoes/${params.id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setOrg(d); })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Carregando...</div>;
  }

  if (notFound || !org) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Organização não encontrada.</p>
        <Link href="/organizacoes" className="text-green-600 hover:underline text-sm">← Organizações</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-green-700 text-lg">PV Território Animal</Link>
          <Link href="/organizacoes" className="text-sm text-gray-600 hover:text-gray-900">← Organizações</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-3xl flex-shrink-0">
              {org.tipo === "abrigo" ? "🏠" : org.tipo === "ong" ? "💚" : org.tipo === "publica" ? "🏛️" : "🏢"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{org.nome}</h1>
                {org.verificada && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Verificada</span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                {tipoLabels[org.tipo] || org.tipo}
                {org.ra && ` · ${org.ra.nome}`}
              </div>
              {org.descricao && <p className="text-sm text-gray-700 mt-3 leading-relaxed">{org.descricao}</p>}
            </div>
          </div>

          {(org.telefone || org.email || org.site || org.endereco || org.cnpj) && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
              {org.telefone && <div><span className="text-gray-400">Tel:</span> {org.telefone}</div>}
              {org.email && <div><span className="text-gray-400">E-mail:</span> {org.email}</div>}
              {org.site && (
                <div>
                  <span className="text-gray-400">Site:</span>{" "}
                  <a href={org.site} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
                    {org.site.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {org.endereco && <div className="sm:col-span-2"><span className="text-gray-400">Endereço:</span> {org.endereco}</div>}
              {org.cnpj && <div><span className="text-gray-400">CNPJ:</span> {org.cnpj}</div>}
            </div>
          )}
        </div>

        {org.protetores.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Protetores vinculados</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {org.protetores.map((p) => (
                <Link key={p.id} href={`/protetores/${p.id}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                    {p.usuario.nomeCompleto.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{p.usuario.nomeCompleto}</div>
                    <div className="text-xs text-gray-400">
                      {tipoProtetorLabels[p.tipoProtetor] || p.tipoProtetor}
                      {" · "}
                      {p._count.animais} {p._count.animais === 1 ? "animal" : "animais"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
