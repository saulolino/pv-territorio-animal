export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-700 text-white px-4">
      <div className="text-center max-w-lg">
        <div className="text-7xl mb-6">🐾</div>
        <h1 className="text-4xl font-bold mb-3">PV Território Animal</h1>
        <p className="text-green-100 text-lg mb-8">
          Adoção responsável de animais no Distrito Federal.
          <br />
          Uma iniciativa comunitária do Partido Verde.
        </p>
        <a
          href="/animais"
          className="inline-block bg-white text-green-700 font-semibold px-8 py-3 rounded-full text-lg hover:bg-green-50 transition-colors"
        >
          Ver animais disponíveis
        </a>
      </div>
      <p className="mt-16 text-green-300 text-sm">Em construção — em breve disponível</p>
    </main>
  );
}
