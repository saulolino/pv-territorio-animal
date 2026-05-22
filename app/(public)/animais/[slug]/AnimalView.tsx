"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Animal {
  id: string;
  slug: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: string;
  porte: string;
  cor: string | null;
  descricao: string;
  idadeEstimadaMeses: number | null;
  castrado: boolean | null;
  vacinado: boolean | null;
  vermifugado: boolean | null;
  microchipado: boolean;
  bomComCriancas: boolean | null;
  bomComOutrosAnimais: boolean | null;
  bomComGatos: boolean | null;
  necessidadesEspeciais: string | null;
  fotos: { id: string; url: string; principal: boolean }[];
  ra: { nome: string; sigla: string } | null;
  protetor: {
    tipoProtetor: string;
    usuario: { nomeCompleto: string; telefone: string | null };
    organizacao: { nome: string } | null;
  };
}

const porteLabels: Record<string, string> = {
  mini: "Mini (até 4kg)", pequeno: "Pequeno (4–10kg)", medio: "Médio (10–25kg)",
  grande: "Grande (25–45kg)", gigante: "Gigante (45kg+)",
};

function triLabel(v: boolean | null) {
  if (v === true) return { text: "Sim", cls: "text-green-600" };
  if (v === false) return { text: "Não", cls: "text-red-500" };
  return { text: "Não informado", cls: "text-gray-400" };
}

function idadeLabel(meses: number): string {
  if (meses < 1) return "menos de 1 mês";
  if (meses < 12) return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  const anos = Math.floor(meses / 12);
  const restante = meses % 12;
  return restante > 0
    ? `${anos} ano${anos > 1 ? "s" : ""} e ${restante} ${restante === 1 ? "mês" : "meses"}`
    : `${anos} ano${anos > 1 ? "s" : ""}`;
}

export default function AnimalView() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch(`/api/animais/${slug}`)
      .then((r) => {
        if (!r.ok) router.push("/animais");
        return r.json();
      })
      .then((a) => {
        setAnimal(a);
        const principalIdx = a.fotos.findIndex((f: Animal["fotos"][0]) => f.principal);
        setFotoIdx(principalIdx >= 0 ? principalIdx : 0);
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  async function solicitar(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setFormError("");
    try {
      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animalId: animal!.id, mensagem }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { router.push("/login?redirect=/animais/" + slug); return; }
        throw new Error(data.error);
      }
      setSent(true);
      setShowForm(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erro ao enviar.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!animal) return null;

  const fotoAtual = animal.fotos[fotoIdx];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/animais" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
            ← Galeria
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-700 font-medium">{animal.nome}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Fotos */}
          <div className="md:col-span-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-3">
              {fotoAtual ? (
                <Image src={fotoAtual.url} alt={animal.nome} fill className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">🐾</div>
              )}
            </div>
            {animal.fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {animal.fotos.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setFotoIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === fotoIdx ? "border-green-500" : "border-transparent"}`}
                  >
                    <Image src={f.url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-3xl font-bold text-gray-900">{animal.nome}</h1>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    if (navigator.share) {
                      navigator.share({ title: `Adote ${animal.nome}`, text: `Conheça ${animal.nome} e ajude a encontrar um lar!`, url });
                    } else {
                      navigator.clipboard.writeText(url).then(() => alert("Link copiado!"));
                    }
                  }}
                  className="shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Compartilhar"
                  aria-label="Compartilhar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
              </div>
              <div className="text-gray-500 capitalize mt-1">
                {animal.especie} • {animal.sexo} • {porteLabels[animal.porte]}
              </div>
              {animal.idadeEstimadaMeses !== null && (
                <div className="text-sm text-gray-400 mt-0.5">{idadeLabel(animal.idadeEstimadaMeses)}</div>
              )}
              {animal.ra && (
                <div className="inline-block mt-2 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                  {animal.ra.nome}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Saúde</h3>
              {[
                ["Castrado", animal.castrado],
                ["Vacinado", animal.vacinado],
                ["Vermifugado", animal.vermifugado],
                ["Microchipado", animal.microchipado],
              ].map(([label, val]) => {
                const { text, cls } = triLabel(val as boolean | null);
                return (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-gray-600">{label as string}</span>
                    <span className={`font-medium ${cls}`}>{text}</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Convivência</h3>
              {[
                ["Bom com crianças", animal.bomComCriancas],
                ["Bom com outros animais", animal.bomComOutrosAnimais],
                ["Bom com gatos", animal.bomComGatos],
              ].map(([label, val]) => {
                const { text, cls } = triLabel(val as boolean | null);
                return (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-gray-600">{label as string}</span>
                    <span className={`font-medium ${cls}`}>{text}</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Protetor</div>
              <div className="font-medium text-gray-800">{animal.protetor.usuario.nomeCompleto}</div>
              {animal.protetor.organizacao && (
                <div className="text-gray-500">{animal.protetor.organizacao.nome}</div>
              )}
            </div>

            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
                Solicitação enviada! O protetor entrará em contato.
              </div>
            ) : showForm ? (
              <form onSubmit={solicitar} className="space-y-3">
                <textarea
                  required
                  rows={4}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Apresente-se e conte por que gostaria de adotar este animal..."
                />
                {formError && <p className="text-red-600 text-sm">{formError}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={sending} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                    {sending ? "Enviando..." : "Enviar solicitação"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                Quero adotar {animal.nome}
              </button>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Sobre {animal.nome}</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{animal.descricao}</p>
          {animal.necessidadesEspeciais && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm font-medium text-amber-800 mb-1">Necessidades especiais</div>
              <p className="text-sm text-amber-700">{animal.necessidadesEspeciais}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
