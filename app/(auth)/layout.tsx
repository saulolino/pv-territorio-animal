export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <span className="text-3xl">🐾</span>
            <h1 className="text-2xl font-bold text-green-800 mt-2">PV Território Animal</h1>
          </a>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">{children}</div>
        <p className="text-center text-sm text-gray-500 mt-6">
          Partido Verde · Adoção Responsável no DF
        </p>
      </div>
    </div>
  );
}
