"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RedefinirForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [form, setForm] = useState({ senha: "", confirmar: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (form.senha !== form.confirmar) { setErro("As senhas não conferem."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, senha: form.senha }),
    });
    const data = await res.json();
    if (!res.ok) { setErro(data.error); setLoading(false); return; }
    router.push("/login?verificado=1");
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nova senha</h2>
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{erro}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha (mín. 8 caracteres)</label>
          <input type="password" required minLength={8} value={form.senha}
            onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
          <input type="password" required value={form.confirmar}
            onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition">
          {loading ? "Salvando…" : "Redefinir senha"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        <Link href="/login" className="text-green-700 hover:underline">Voltar ao login</Link>
      </p>
    </>
  );
}

export default function RedefinirSenhaPage() {
  return <Suspense><RedefinirForm /></Suspense>;
}
