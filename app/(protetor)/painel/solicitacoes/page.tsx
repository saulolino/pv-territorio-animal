"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

interface PerfilAdotante {
  id: string;
  tipoMoradia: string | null;
  temAreaExterna: boolean | null;
  temOutrosAnimais: boolean;
  descricaoOutrosAnimais: string | null;
  jaAdotouAntes: boolean;
  motivoAdocao: string | null;
  conheceCustos: boolean;
  aceitaVisita: boolean;
  perfilCompleto: boolean;
  ra: { nome: string; sigla: string } | null;
  usuario: { nomeCompleto: string; email: string; telefone: string | null };
}

const moradiaLabels: Record<string, string> = {
  casa_propria: "Casa própria", alugada: "Alugada", cedida: "Cedida", outros: "Outros",
};

function ModalPerfil({ adotanteId, onClose }: { adotanteId: string; onClose: () => void }) {
  const [perfil, setPerfil] = useState<PerfilAdotante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/painel/adotantes/${adotanteId}`)
      .then((r) => r.json())
      .then(setPerfil)
      .finally(() => setLoading(false));
  }, [adotanteId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Perfil do adotante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Carregando...</div>
        ) : !perfil ? (
          <div className="p-6 text-center text-gray-400 text-sm">Perfil não disponível.</div>
        ) : (
          <div className="p-5 space-y-4 text-sm">
            <div>
              <div className="font-semibold text-gray-800 text-base">{perfil.usuario.nomeCompleto}</div>
              <div className="text-gray-500">{perfil.usuario.email}</div>
              {perfil.usuario.telefone && <div className="text-gray-500">{perfil.usuario.telefone}</div>}
              {perfil.ra && <div className="text-gray-400 text-xs mt-0.5">{perfil.ra.nome}</div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Moradia", perfil.tipoMoradia ? moradiaLabels[perfil.tipoMoradia] || perfil.tipoMoradia : "Não informado"],
                ["Área externa", perfil.temAreaExterna === true ? "Sim" : perfil.temAreaExterna === false ? "Não" : "Não informado"],
                ["Outros animais", perfil.temOutrosAnimais ? "Sim" : "Não"],
                ["Já adotou antes", perfil.jaAdotouAntes ? "Sim" : "Não"],
                ["Conhece os custos", perfil.conheceCustos ? "Sim" : "Não"],
                ["Aceita visita", perfil.aceitaVisita ? "Sim" : "Não"],
              ].map(([label, valor]) => (
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-xs text-gray-400">{label}</div>
                  <div className="font-medium text-gray-700">{valor}</div>
                </div>
              ))}
            </div>
            {perfil.descricaoOutrosAnimais && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Outros animais</div>
                <p className="text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{perfil.descricaoOutrosAnimais}</p>
              </div>
            )}
            {perfil.motivoAdocao && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Motivação para adotar</div>
                <p className="text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{perfil.motivoAdocao}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface Solicitacao {
  id: string;
  status: string;
  mensagemAdotante: string;
  createdAt: string;
  animal: { nome: string; slug: string };
  adotante: {
    id: string;
    usuario: { nomeCompleto: string; email: string; telefone: string | null };
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-700" },
  em_analise: { label: "Em análise", color: "bg-blue-100 text-blue-700" },
  aprovada: { label: "Aprovada", color: "bg-green-100 text-green-700" },
  rejeitada: { label: "Rejeitada", color: "bg-red-100 text-red-700" },
  cancelada: { label: "Cancelada", color: "bg-gray-100 text-gray-600" },
  concluida: { label: "Concluída", color: "bg-purple-100 text-purple-700" },
};

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [meuId, setMeuId] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((me) => setMeuId(me.id ?? ""));
  }, []);

  useEffect(() => {
    fetch("/api/solicitacoes")
      .then((r) => r.json())
      .then(setSolicitacoes)
      .finally(() => setLoading(false));
  }, []);

  async function atualizar(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/solicitacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSolicitacoes((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  const pendentes = solicitacoes.filter((s) => s.status === "pendente" || s.status === "em_analise");
  const historico = solicitacoes.filter((s) => !["pendente", "em_analise"].includes(s.status));

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Solicitações de Adoção</h1>

      {solicitacoes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Nenhuma solicitação ainda.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pendentes.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Pendentes / Em análise ({pendentes.length})
              </h2>
              <div className="space-y-3">
                {pendentes.map((s) => (
                  <SolicitacaoCard key={s.id} s={s} onUpdate={atualizar} updating={updating === s.id} meuId={meuId} />
                ))}
              </div>
            </div>
          )}

          {historico.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Histórico
              </h2>
              <div className="space-y-3">
                {historico.map((s) => (
                  <SolicitacaoCard key={s.id} s={s} onUpdate={atualizar} updating={updating === s.id} meuId={meuId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SolicitacaoCard({
  s,
  onUpdate,
  updating,
  meuId,
}: {
  s: Solicitacao;
  onUpdate: (id: string, status: string) => void;
  updating: boolean;
  meuId: string;
}) {
  const [tab, setTab] = useState<"mensagem" | "chat">("mensagem");
  const [verPerfil, setVerPerfil] = useState(false);
  const st = statusLabels[s.status] || { label: s.status, color: "bg-gray-100 text-gray-600" };
  const podeChat = ["pendente", "em_analise", "aprovada"].includes(s.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {verPerfil && (
        <ModalPerfil adotanteId={s.adotante.id} onClose={() => setVerPerfil(false)} />
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setVerPerfil(true)}
              className="font-semibold text-gray-900 hover:text-green-700 transition-colors"
            >
              {s.adotante.usuario.nomeCompleto}
            </button>
            <span className="text-gray-400">→</span>
            <span className="text-gray-700">{s.animal.nome}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {s.adotante.usuario.email}
            {s.adotante.usuario.telefone && ` · ${s.adotante.usuario.telefone}`}
            <button onClick={() => setVerPerfil(true)} className="ml-2 text-xs text-green-600 hover:underline">
              Ver perfil completo →
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {new Date(s.createdAt).toLocaleDateString("pt-BR")}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-3 border-b border-gray-100">
        <button
          onClick={() => setTab("mensagem")}
          className={`text-xs pb-1.5 border-b-2 transition-colors ${tab === "mensagem" ? "border-green-600 text-green-700 font-medium" : "border-transparent text-gray-400"}`}
        >
          Mensagem inicial
        </button>
        {podeChat && (
          <button
            onClick={() => setTab("chat")}
            className={`text-xs pb-1.5 border-b-2 transition-colors ${tab === "chat" ? "border-green-600 text-green-700 font-medium" : "border-transparent text-gray-400"}`}
          >
            Chat
          </button>
        )}
      </div>

      <div className="mt-3">
        {tab === "mensagem" && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
            {s.mensagemAdotante}
          </div>
        )}
        {tab === "chat" && podeChat && meuId && (
          <Chat solicitacaoId={s.id} meuTipo="protetor" meuId={meuId} />
        )}
      </div>

      {["pendente", "em_analise"].includes(s.status) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {s.status === "pendente" && (
            <button
              onClick={() => onUpdate(s.id, "em_analise")}
              disabled={updating}
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
            >
              Marcar em análise
            </button>
          )}
          <button
            onClick={() => onUpdate(s.id, "aprovada")}
            disabled={updating}
            className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            Aprovar
          </button>
          <button
            onClick={() => onUpdate(s.id, "rejeitada")}
            disabled={updating}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            Rejeitar
          </button>
        </div>
      )}
    </div>
  );
}
