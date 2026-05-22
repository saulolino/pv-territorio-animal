"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

interface Stats {
  usuarios: number;
  animais: number;
  solicitacoes: number;
  protetores: number;
  porEspecie: { especie: string; total: number }[];
  porStatus: { status: string; total: number }[];
  topRas: { nome: string; total: number }[];
  solicitacoesPorSemana: { semana: string; total: number }[];
}

interface Animal {
  id: string;
  slug: string;
  nome: string;
  status: string;
  especie: string;
  destaque: boolean;
  createdAt: string;
  protetor: { usuario: { nomeCompleto: string } };
}

const statusLabels: Record<string, string> = {
  disponivel: "Disponível",
  em_processo_adocao: "Em processo",
  adotado: "Adotado",
  indisponivel_temporario: "Indisponível",
  removido: "Removido",
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"metricas" | "animais">("metricas");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((me) => {
        if (me.tipo !== "admin") { router.push("/"); return; }
        return Promise.all([
          fetch("/api/admin/stats").then((r) => r.json()),
          fetch("/api/admin/animais").then((r) => r.json()),
        ]);
      })
      .then((results) => {
        if (results) {
          setStats(results[0]);
          setAnimais(results[1]);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function toggleDestaque(slug: string, destaque: boolean) {
    await fetch(`/api/animais/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destaque: !destaque }),
    });
    setAnimais((prev) =>
      prev.map((a) => (a.slug === slug ? { ...a, destaque: !destaque } : a))
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Carregando...
      </div>
    );
  }

  const especieLabels: Record<string, string> = { cachorro: "Cachorro", gato: "Gato", outro: "Outro" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-gray-800">Admin — PV Território Animal</span>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Site</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* KPIs */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Usuários", value: stats.usuarios },
              { label: "Animais", value: stats.animais },
              { label: "Solicitações", value: stats.solicitacoes },
              { label: "Protetores", value: stats.protetores },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-3xl font-bold text-gray-800">{c.value}</div>
                <div className="text-sm text-gray-500 mt-1">{c.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Export */}
        <div className="flex gap-2 mb-6 justify-end">
          <a href="/api/admin/export?tipo=animais" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            Exportar animais CSV
          </a>
          <a href="/api/admin/export?tipo=solicitacoes" className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            Exportar solicitações CSV
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {(["metricas", "animais"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "metricas" ? "Métricas" : "Animais"}
            </button>
          ))}
        </div>

        {tab === "metricas" && stats && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Por espécie */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Animais por espécie</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.porEspecie.map((e) => ({ ...e, especie: especieLabels[e.especie] || e.especie }))}>
                    <XAxis dataKey="especie" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top RAs */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Top RAs com animais disponíveis</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.topRas} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="nome" type="category" tick={{ fontSize: 11 }} width={40} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#15803d" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Solicitações por semana */}
            {stats.solicitacoesPorSemana.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Solicitações por semana</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.solicitacoesPorSemana}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="semana"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={(v) => `Semana de ${v}`} />
                    <Line type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Status breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Status dos animais</h3>
              <div className="flex flex-wrap gap-3">
                {stats.porStatus.map((s) => (
                  <div key={s.status} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">{statusLabels[s.status] || s.status}</span>
                    <span className="text-sm font-bold text-green-700">{s.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "animais" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Animal</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 hidden md:table-cell">Protetor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Destaque</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {animais.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">{a.nome}</div>
                      <div className="text-xs text-gray-400 capitalize">{a.especie}</div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-gray-600">{a.protetor.usuario.nomeCompleto}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{statusLabels[a.status] || a.status}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleDestaque(a.slug, a.destaque)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          a.destaque
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {a.destaque ? "★ Destaque" : "☆ Normal"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/animais/${a.slug}`} target="_blank" className="text-xs text-blue-600 hover:underline">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {animais.length === 0 && (
              <div className="text-center py-8 text-gray-400">Nenhum animal.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
