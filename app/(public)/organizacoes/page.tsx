"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Org {
  id: string;
  nome: string;
  tipo: string;
  descricao: string | null;
  verificada: boolean;
  ra: { nome: string; sigla: string } | null;
  _count: { protetores: number };
}

const tipoLabels: Record<string, string> = {
  abrigo: "Abrigo",
  ong: "ONG",
  empresa: "Empresa",
  publica: "Entidade pública",
};

export default function OrganizacoesPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = tipo ? `?tipo=${tipo}` : "";
    fetch(`/api/organizacoes${params}`)
      .then((r) => r.json())
      .then(setOrgs)
      .finally(() => setLoading(false));
  }, [tipo]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-green-700 text-lg">PV Território Animal</Link>
          <Link href="/animais" className="text-sm text-gray-600 hover:text-gray-900">Ver animais</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Organizações parceiras</h1>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="abrigo">Abrigos</option>
            <option value="ong">ONGs</option>
            <option value="empresa">Empresas</option>
            <option value="publica">Entidades públicas</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-20 animate-pulse" />
            ))}
          </div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Nenhuma organização encontrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orgs.map((org) => (
              <Link key={org.id} href={`/organizacoes/${org.id}`} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 hover:shadow-md transition-shadow block">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 text-xl">
                  {org.tipo === "abrigo" ? "🏠" : org.tipo === "ong" ? "💚" : org.tipo === "publica" ? "🏛️" : "🏢"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{org.nome}</span>
                    {org.verificada && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Verificada</span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                      {tipoLabels[org.tipo] || org.tipo}
                    </span>
                  </div>
                  {org.ra && <div className="text-xs text-gray-400 mt-0.5">{org.ra.nome}</div>}
                  {org.descricao && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{org.descricao}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {org._count.protetores} {org._count.protetores === 1 ? "protetor" : "protetores"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
