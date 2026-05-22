"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

interface Favorito {
  id: string;
  animalId: string;
  animal: {
    slug: string;
    nome: string;
    especie: string;
    sexo: string;
    porte: string;
    status: string;
    fotos: { url: string }[];
    ra: { nome: string; sigla: string } | null;
  };
}

const porteLabels: Record<string, string> = {
  mini: "Mini", pequeno: "Pequeno", medio: "Médio", grande: "Grande", gigante: "Gigante",
};

interface Solicitacao {
  id: string;
  status: string;
  createdAt: string;
  animal: {
    nome: string;
    slug: string;
    fotos: { url: string }[];
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: "Aguardando análise", color: "bg-amber-100 text-amber-700" },
  em_analise: { label: "Em análise", color: "bg-blue-100 text-blue-700" },
  aprovada: { label: "Aprovada!", color: "bg-green-100 text-green-700" },
  rejeitada: { label: "Não aprovada", color: "bg-red-100 text-red-700" },
  cancelada: { label: "Cancelada", color: "bg-gray-100 text-gray-600" },
  concluida: { label: "Concluída", color: "bg-purple-100 text-purple-700" },
};

export default function PainelAdotantePage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [meuId, setMeuId] = useState("");
  const [chatAberto, setChatAberto] = useState<string | null>(null);
  const [aba, setAba] = useState<"solicitacoes" | "favoritos">("solicitacoes");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((me) => setMeuId(me.id ?? ""));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/solicitacoes").then((r) => r.json()),
      fetch("/api/favoritos").then((r) => r.ok ? r.json() : []),
    ]).then(([sols, favs]) => {
      setSolicitacoes(sols);
      setFavoritos(favs);
    }).finally(() => setLoading(false));
  }, []);

  async function cancelar(id: string) {
    if (!confirm("Cancelar esta solicitação?")) return;
    const res = await fetch(`/api/solicitacoes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSolicitacoes((prev) => prev.map((s) => s.id === id ? { ...s, status: "cancelada" } : s));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
          <div className="flex gap-3">
            <Link href="/animais" className="text-sm text-green-600 hover:underline">Ver animais</Link>
            <Link href="/perfil/adotante" className="text-sm text-gray-500 hover:underline">Meu perfil</Link>
          </div>
        </div>

        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {(["solicitacoes", "favoritos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setAba(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                aba === t ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "solicitacoes" ? `Solicitações${solicitacoes.length > 0 ? ` (${solicitacoes.length})` : ""}` : `Favoritos${favoritos.length > 0 ? ` (${favoritos.length})` : ""}`}
            </button>
          ))}
        </div>

        {aba === "favoritos" && (
          favoritos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 mb-4">Nenhum favorito ainda.</p>
              <Link href="/animais" className="text-green-600 hover:underline text-sm font-medium">
                Explorar animais →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favoritos.map((f) => (
                <Link key={f.id} href={`/animais/${f.animal.slug}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {f.animal.fotos[0] ? (
                      <Image src={f.animal.fotos[0].url} alt={f.animal.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200 text-3xl">🐾</div>
                    )}
                    {f.animal.status !== "disponivel" && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">Indisponível</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-gray-900 text-sm">{f.animal.nome}</div>
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">
                      {f.animal.especie} · {f.animal.sexo} · {porteLabels[f.animal.porte]}
                    </div>
                    {f.animal.ra && <div className="text-xs text-green-700 mt-0.5">{f.animal.ra.sigla}</div>}
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {aba === "solicitacoes" && loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse" />
            ))}
          </div>
        ) : aba === "solicitacoes" && solicitacoes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">Nenhuma solicitação ainda.</p>
            <Link href="/animais" className="text-green-600 hover:underline text-sm font-medium">
              Encontrar um animal para adotar →
            </Link>
          </div>
        ) : aba === "solicitacoes" ? (
          <div className="space-y-3">
            {solicitacoes.map((s) => {
              const st = statusLabels[s.status] || { label: s.status, color: "bg-gray-100 text-gray-600" };
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {s.animal.fotos[0] ? (
                        <Image src={s.animal.fotos[0].url} alt={s.animal.nome} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">🐾</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/animais/${s.animal.slug}`} className="font-semibold text-gray-900 hover:text-green-700 transition-colors">
                          {s.animal.nome}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {["pendente", "em_analise", "aprovada"].includes(s.status) && (
                        <button
                          onClick={() => setChatAberto(chatAberto === s.id ? null : s.id)}
                          className="text-xs text-green-600 hover:text-green-800 transition-colors"
                        >
                          {chatAberto === s.id ? "Fechar chat" : "Chat"}
                        </button>
                      )}
                      {s.status === "pendente" && (
                        <button onClick={() => cancelar(s.id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                  {chatAberto === s.id && meuId && (
                    <div className="border-t border-gray-100">
                      <Chat solicitacaoId={s.id} meuTipo="adotante" meuId={meuId} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
