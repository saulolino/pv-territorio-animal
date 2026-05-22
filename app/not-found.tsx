import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">🐾</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        O que você procurava não está aqui, mas há muitos animais esperando por um lar!
      </p>
      <div className="flex gap-3">
        <Link
          href="/animais"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Ver animais disponíveis
        </Link>
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-800 px-6 py-2.5 text-sm transition-colors"
        >
          Página inicial
        </Link>
      </div>
    </div>
  );
}
