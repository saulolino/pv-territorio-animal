"use client";

import { useState } from "react";
import Link from "next/link";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEnviado(true);
    setLoading(false);
  }

  if (enviado) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Verifique seu e-mail</h2>
        <p className="text-gray-600 text-sm mb-6">Se o e-mail existir em nossa base, você receberá as instruções de redefinição.</p>
        <Link href="/login" className="text-green-700 hover:underline text-sm">Voltar ao login</Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Esqueci minha senha</h2>
      <p className="text-gray-500 text-sm mb-6">Informe seu e-mail e enviaremos o link de redefinição.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition">
          {loading ? "Enviando…" : "Enviar link"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        <Link href="/login" className="text-green-700 hover:underline">Voltar ao login</Link>
      </p>
    </>
  );
}
