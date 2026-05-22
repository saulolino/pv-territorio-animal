import Link from "next/link";

export default function VerificarEmailPage() {
  return (
    <div className="text-center">
      <div className="text-5xl mb-4">📧</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Verifique seu e-mail</h2>
      <p className="text-gray-600 mb-6">
        Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta.
      </p>
      <p className="text-sm text-gray-500">
        Não recebeu?{" "}
        <Link href="/login" className="text-green-700 hover:underline">Voltar ao login</Link>
      </p>
    </div>
  );
}
