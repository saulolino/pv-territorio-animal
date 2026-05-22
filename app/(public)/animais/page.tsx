"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const MapaRAs = dynamic(() => import("@/components/MapaRAs"), {
  ssr: false,
  loading: () => <div className="w-full h-80 bg-gray-100 rounded-2xl animate-pulse" />,
});

interface Animal {
  id: string;
  slug: string;
  nome: string;
  especie: string;
  sexo: string;
  porte: string;
  raca: string | null;
  idadeEstimadaMeses: number | null;
  fotos: { url: string }[];
  ra: { nome: string; sigla: string } | null;
}

interface Ra {
  id: number;
  nome: string;
  sigla: string;
}

const porteLabels: Record<string, string> = {
  mini: "Mini", pequeno: "Pequeno", medio: "Médio", grande: "Grande", gigante: "Gigante",
};

function idadeLabel(meses: number | null): string {
  if (meses === null) return "";
  if (meses < 1) return "menos de 1 mês";
  if (meses < 12) return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  const anos = Math.floor(meses / 12);
  return `${anos} ${anos === 1 ? "ano" : "anos"}`;
}

function GaleriaContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ras, setRas] = useState<Ra[]>([]);

  const especie = sp.get("especie") ?? "";
  const sexo = sp.get("sexo") ?? "";
  const porte = sp.get("porte") ?? "";
  const castrado = sp.get("castrado") ?? "";
  const raId = sp.get("raId") ?? "";
  const page = Number(sp.get("page") ?? 1);

  useEffect(() => {
    fetch("/api/territorios/ras")
      .then((r) => r.json())
      .then(setRas);
  }, []);

  const loadAnimais = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (especie) params.set("especie", especie);
    if (sexo) params.set("sexo", sexo);
    if (porte) params.set("porte", porte);
    if (castrado) params.set("castrado", castrado);
    if (raId) params.set("raId", raId);
    params.set("page", page.toString());
    const res = await fetch(`/api/animais?${params}`);
    const data = await res.json();
    setAnimais(data.animais ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [especie, sexo, porte, castrado, raId, page]);

  useEffect(() => { loadAnimais(); }, [loadAnimais]);

  function setFilter(key: string, value: string) {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/animais?${p}`);
  }

  function setPage(n: number) {
    const p = new URLSearchParams(sp.toString());
    p.set("page", n.toString());
    router.push(`/animais?${p}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasFilters = especie || sexo || porte || castrado || raId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-green-700 text-lg">PV Território Animal</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Entrar</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Animais para adoção</h1>
          {!loading && (
            <p className="text-gray-500 text-sm mt-1">
              {total} {total === 1 ? "animal encontrado" : "animais encontrados"}
              {raId && ras.find((r) => r.id === Number(raId)) && (
                <span> em {ras.find((r) => r.id === Number(raId))?.nome}</span>
              )}
            </p>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          <select value={especie} onChange={(e) => setFilter("especie", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Todas as espécies</option>
            <option value="cachorro">Cachorro</option>
            <option value="gato">Gato</option>
            <option value="outro">Outro</option>
          </select>
          <select value={sexo} onChange={(e) => setFilter("sexo", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Qualquer sexo</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select>
          <select value={porte} onChange={(e) => setFilter("porte", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Qualquer porte</option>
            <option value="mini">Mini</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
            <option value="gigante">Gigante</option>
          </select>
          <select value={castrado} onChange={(e) => setFilter("castrado", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Castrado ou não</option>
            <option value="true">Castrado</option>
            <option value="false">Não castrado</option>
          </select>
          <select value={raId} onChange={(e) => setFilter("raId", e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Todas as regiões</option>
            {ras.map((ra) => (
              <option key={ra.id} value={ra.id}>{ra.sigla} — {ra.nome}</option>
            ))}
          </select>
          {hasFilters && (
            <button onClick={() => router.push("/animais")} className="text-sm text-red-500 hover:text-red-700 transition-colors">
              Limpar filtros
            </button>
          )}
        </div>

        {/* Mapa territorial */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Animais disponíveis por Região Administrativa
            {raId && " — clique em outra região para filtrar"}
          </h2>
          <MapaRAs raIdAtivo={raId ? Number(raId) : null} onClickRa={(id) => setFilter("raId", id ? String(id) : "")} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse h-64" />
            ))}
          </div>
        ) : animais.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Nenhum animal encontrado com esses filtros.</p>
            {hasFilters && (
              <button onClick={() => router.push("/animais")} className="mt-3 text-sm text-green-600 hover:underline">
                Ver todos os animais →
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {animais.map((animal) => (
                <Link key={animal.id} href={`/animais/${animal.slug}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {animal.fotos[0] ? (
                      <Image
                        src={animal.fotos[0].url}
                        alt={animal.nome}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl">🐾</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-gray-900">{animal.nome}</div>
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">
                      {animal.especie} • {animal.sexo} • {porteLabels[animal.porte]}
                    </div>
                    {animal.idadeEstimadaMeses !== null && (
                      <div className="text-xs text-gray-400 mt-0.5">{idadeLabel(animal.idadeEstimadaMeses)}</div>
                    )}
                    {animal.ra && (
                      <div className="text-xs text-green-700 mt-1">{animal.ra.sigla || animal.ra.nome}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40">
                  ‹ Anterior
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  {page} de {pages}
                </span>
                <button onClick={() => setPage(page + 1)} disabled={page >= pages} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40">
                  Próxima ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AnimaisPage() {
  return (
    <Suspense>
      <GaleriaContent />
    </Suspense>
  );
}
