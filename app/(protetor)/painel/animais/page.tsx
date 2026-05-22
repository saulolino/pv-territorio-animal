"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Animal {
  id: string;
  slug: string;
  nome: string;
  especie: string;
  sexo: string;
  porte: string;
  status: string;
  createdAt: string;
  fotos: { url: string }[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  disponivel: { label: "Disponível", color: "bg-green-100 text-green-700" },
  em_processo_adocao: { label: "Em processo", color: "bg-amber-100 text-amber-700" },
  adotado: { label: "Adotado", color: "bg-blue-100 text-blue-700" },
  indisponivel_temporario: { label: "Indisponível", color: "bg-gray-100 text-gray-600" },
  removido: { label: "Removido", color: "bg-red-100 text-red-600" },
};

export default function AnimaisPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/painel/animais")
      .then((r) => r.json())
      .then(setAnimais)
      .finally(() => setLoading(false));
  }, []);

  async function remover(slug: string) {
    if (!confirm("Remover este animal da plataforma?")) return;
    await fetch(`/api/animais/${slug}`, { method: "DELETE" });
    setAnimais((prev) => prev.filter((a) => a.slug !== slug));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Animais</h1>
        <Link
          href="/painel/animais/novo"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Cadastrar animal
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse" />
          ))}
        </div>
      ) : animais.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">Nenhum animal cadastrado ainda.</p>
          <Link href="/painel/animais/novo" className="text-green-600 hover:underline text-sm font-medium">
            Cadastrar primeiro animal →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {animais.map((animal) => {
            const st = statusLabels[animal.status] || { label: animal.status, color: "bg-gray-100 text-gray-600" };
            return (
              <div key={animal.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {animal.fotos[0] ? (
                    <Image src={animal.fotos[0].url} alt={animal.nome} width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🐾</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{animal.nome}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5 capitalize">
                    {animal.especie} • {animal.sexo} • {animal.porte}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/animais/${animal.slug}`}
                    target="_blank"
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Ver
                  </Link>
                  <Link
                    href={`/painel/animais/${animal.slug}/editar`}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => remover(animal.slug)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
