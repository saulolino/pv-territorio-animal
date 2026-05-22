"use client";

import { useEffect, useRef, useState } from "react";

interface Mensagem {
  id: string;
  texto: string;
  tipoAutor: string;
  autorId: string;
  createdAt: string;
}

interface Props {
  solicitacaoId: string;
  meuTipo?: "protetor" | "adotante" | "admin";
  meuId: string;
}

export default function Chat({ solicitacaoId, meuId }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/mensagens?solicitacaoId=${solicitacaoId}`)
      .then((r) => r.json())
      .then(setMensagens);
  }, [solicitacaoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setSending(true);
    const res = await fetch("/api/mensagens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solicitacaoId, texto }),
    });
    if (res.ok) {
      const nova = await res.json();
      setMensagens((prev) => [...prev, nova]);
      setTexto("");
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col h-80 border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mensagens</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {mensagens.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">Nenhuma mensagem ainda. Inicie a conversa.</p>
        )}
        {mensagens.map((m) => {
          const minha = m.autorId === meuId;
          return (
            <div key={m.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  minha
                    ? "bg-green-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {!minha && (
                  <div className="text-xs font-semibold mb-0.5 opacity-60 capitalize">{m.tipoAutor}</div>
                )}
                <p className="leading-snug">{m.texto}</p>
                <div className={`text-xs mt-0.5 ${minha ? "text-green-200" : "text-gray-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={enviar} className="flex gap-2 p-3 border-t border-gray-100">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !texto.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
