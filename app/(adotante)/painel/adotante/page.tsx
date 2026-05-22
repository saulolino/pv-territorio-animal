"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

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
  const [loading, setLoading] = useState(true);
  const [meuId, setMeuId] = useState("");
  const [chatAberto, setChatAberto] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((me) => setMeuId(me.id ?? ""));
  }, []);

  useEffect(() => {
    fetch("/api/solicitacoes")
      .then((r) => r.json())
      .then(setSolicitacoes)
      .finally(() => setLoading(false));
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Minhas Solicitações</h1>
          <div className="flex gap-3">
            <Link href="/animais" className="text-sm text-green-600 hover:underline">
              Ver animais
            </Link>
            <Link href="/perfil/adotante" className="text-sm text-gray-500 hover:underline">
              Meu perfil
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse" />
            ))}
          </div>
        ) : solicitacoes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">Nenhuma solicitação ainda.</p>
            <Link href="/animais" className="text-green-600 hover:underline text-sm font-medium">
              Encontrar um animal para adotar →
            </Link>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
