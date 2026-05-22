"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Protetor {
  id: string;
  tipoProtetor: string;
  descricao: string | null;
  fotoPerfil: string | null;
  verificado: boolean;
  createdAt: string;
  usuario: { nomeCompleto: string };
  ra: { nome: string; sigla: string } | null;
  animais: {
    id: string;
    slug: string;
    nome: string;
    especie: string;
    sexo: string;
    porte: string;
    fotos: { url: string }[];
  }[];
  _count: { animais: number };
}

const tipoLabels: Record<string, string> = {
  independente: "Protetor independente",
  lar_temporario: "Lar temporário",
  abrigo: "Abrigo",
  ong: "ONG",
};

const porteLabels: Record<string, string> = {
  mini: "Mini", pequeno: "Pequeno", medio: "Médio", grande: "Grande", gigante: "Gigante",
};

export default function PerfilProtetorPage() {
  const params = useParams();
  const [protetor, setProtetor] = useState<Protetor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/protetores/${params.id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setProtetor(d); })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Carregando...
      </div>
    );
  }

  if (notFound || !protetor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Protetor não encontrado.</p>
        <Link href="/animais" className="text-green-600 hover:underline text-sm">← Ver animais</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-green-700 text-lg">PV Território Animal</Link>
          <Link href="/animais" className="text-sm text-gray-600 hover:text-gray-900">← Ver animais</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Perfil header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex-shrink-0 overflow-hidden">
            {protetor.fotoPerfil ? (
              <Image src={protetor.fotoPerfil} alt={protetor.usuario.nomeCompleto} width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-green-600">🐾</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{protetor.usuario.nomeCompleto}</h1>
              {protetor.verificado && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Verificado</span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {tipoLabels[protetor.tipoProtetor] || protetor.tipoProtetor}
              {protetor.ra && ` · ${protetor.ra.nome}`}
            </div>
            {protetor.descricao && (
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{protetor.descricao}</p>
            )}
            <div className="text-xs text-gray-400 mt-2">
              Membro desde {new Date(protetor.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              {" · "}
              {protetor._count.animais} {protetor._count.animais === 1 ? "animal disponível" : "animais disponíveis"}
            </div>
          </div>
        </div>

        {/* Animais */}
        {protetor.animais.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Animais disponíveis</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {protetor.animais.map((animal) => (
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
                      {animal.especie} · {animal.sexo} · {porteLabels[animal.porte]}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {protetor.animais.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Este protetor não tem animais disponíveis no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
