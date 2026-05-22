"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  animais: number;
  disponiveis: number;
  solicitacoesPendentes: number;
  adotados: number;
}

export default function PainelPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/painel/stats").then((r) => r.json()),
    ])
      .then(([s]) => setStats(s))
      .catch(() => setStats({ animais: 0, disponiveis: 0, solicitacoesPendentes: 0, adotados: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total de animais", value: stats?.animais ?? 0, href: "/painel/animais", color: "text-blue-600" },
    { label: "Disponíveis", value: stats?.disponiveis ?? 0, href: "/painel/animais", color: "text-green-600" },
    { label: "Solicitações pendentes", value: stats?.solicitacoesPendentes ?? 0, href: "/painel/solicitacoes", color: "text-amber-600" },
    { label: "Adotados", value: stats?.adotados ?? 0, href: "/painel/animais", color: "text-purple-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Painel do Protetor</h1>
        <Link
          href="/painel/animais/novo"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Cadastrar animal
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-sm text-gray-500 mt-1">{c.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Ações rápidas</h2>
          <div className="space-y-2">
            <Link href="/painel/animais/novo" className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700 transition-colors">
              <span className="text-green-600">+</span> Cadastrar novo animal
            </Link>
            <Link href="/painel/solicitacoes" className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700 transition-colors">
              <span className="text-amber-500">→</span> Ver solicitações pendentes
            </Link>
            <Link href="/animais" className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700 transition-colors">
              <span className="text-blue-500">↗</span> Ver galeria pública
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Dicas</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Adicione fotos de qualidade para aumentar as chances de adoção.</li>
            <li>• Mantenha o status dos animais atualizado.</li>
            <li>• Responda solicitações em até 48 horas.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
