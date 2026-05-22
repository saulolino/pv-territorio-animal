import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getDestaques() {
  try {
    const animais = await prisma.animal.findMany({
      where: { status: "disponivel" },
      orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: {
        fotos: { where: { principal: true }, take: 1 },
        ra: { select: { sigla: true, nome: true } },
      },
    });
    const total = await prisma.animal.count({ where: { status: "disponivel" } });
    const adotados = await prisma.animal.count({ where: { status: "adotado" } });
    return { animais, total, adotados };
  } catch {
    return { animais: [], total: 0, adotados: 0 };
  }
}

const porteLabels: Record<string, string> = {
  mini: "Mini", pequeno: "Pequeno", medio: "Médio", grande: "Grande", gigante: "Gigante",
};

export default async function Home() {
  const { animais, total, adotados } = await getDestaques();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-green-700 text-lg">PV Território Animal</span>
          <div className="flex items-center gap-4">
            <Link href="/animais" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Adotar
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Cadastrar animal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-green-700 to-green-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🐾</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Adoção responsável no<br />Distrito Federal
          </h1>
          <p className="text-green-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Uma iniciativa do Partido Verde para conectar animais que precisam de um lar
            a famílias prontas para adotar com amor e responsabilidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/animais"
              className="bg-white text-green-700 font-semibold px-8 py-3 rounded-xl text-lg hover:bg-green-50 transition-colors"
            >
              Ver animais disponíveis
            </Link>
            <Link
              href="/cadastro"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl text-lg hover:bg-white/10 transition-colors"
            >
              Sou protetor
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-700">{total}</div>
            <div className="text-sm text-gray-500 mt-1">Animais disponíveis</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-700">{adotados}</div>
            <div className="text-sm text-gray-500 mt-1">Adoções realizadas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-700">35</div>
            <div className="text-sm text-gray-500 mt-1">Regiões do DF</div>
          </div>
        </div>
      </section>

      {/* Animais em destaque */}
      {animais.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Animais esperando por você</h2>
            <Link href="/animais" className="text-sm text-green-600 hover:underline font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {animais.map((animal) => (
              <Link
                key={animal.id}
                href={`/animais/${animal.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {animal.fotos[0] ? (
                    <Image
                      src={animal.fotos[0].url}
                      alt={animal.nome}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl">🐾</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-gray-900">{animal.nome}</div>
                  <div className="text-xs text-gray-500 capitalize mt-0.5">
                    {animal.especie} • {animal.sexo} • {porteLabels[animal.porte]}
                  </div>
                  {animal.ra && (
                    <div className="text-xs text-green-600 mt-1">{animal.ra.sigla}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Encontre um animal", desc: "Navegue pela galeria com filtros por espécie, porte, sexo e região." },
              { num: "2", title: "Envie sua solicitação", desc: "Complete seu perfil de adotante e envie uma mensagem ao protetor." },
              { num: "3", title: "Conclua a adoção", desc: "O protetor analisa seu perfil e conduz o processo de adoção responsável." },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Tem um animal para adoção?</h2>
          <p className="text-gray-500 mb-6">
            Cadastre-se como protetor e publique os animais que você cuida.
            Encontre lares responsáveis em todo o DF.
          </p>
          <Link
            href="/cadastro"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Cadastrar como protetor
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© 2026 PV Território Animal — Partido Verde DF</span>
          <div className="flex gap-6">
            <Link href="/animais" className="hover:text-gray-600 transition-colors">Adotar</Link>
            <Link href="/cadastro" className="hover:text-gray-600 transition-colors">Ser protetor</Link>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
