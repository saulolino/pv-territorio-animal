"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"protetor" | "adotante" | "">("");
  const [form, setForm] = useState({ email: "", senha: "", confirmarSenha: "", nomeCompleto: "", telefone: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!tipo) { setErro("Selecione o tipo de conta."); return; }
    if (form.senha !== form.confirmarSenha) { setErro("As senhas não conferem."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tipo }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error); return; }
      router.push("/verificar-email");
    } finally {
      setLoading(false);
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar conta</h2>
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{erro}</div>
      )}

      {/* Seleção de tipo */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(["protetor", "adotante"] as const).map((t) => (
          <button
            key={t} type="button" onClick={() => setTipo(t)}
            className={`border-2 rounded-xl p-4 text-center transition ${tipo === t ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
          >
            <div className="text-2xl mb-1">{t === "protetor" ? "🏠" : "❤️"}</div>
            <div className="font-semibold text-sm capitalize">{t === "protetor" ? "Protetor / Abrigo" : "Adotante"}</div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
          <input type="text" required value={form.nomeCompleto} onChange={set("nomeCompleto")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input type="email" required value={form.email} onChange={set("email")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp)</label>
          <input type="tel" value={form.telefone} onChange={set("telefone")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha (mín. 8 caracteres)</label>
          <input type="password" required minLength={8} value={form.senha} onChange={set("senha")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
          <input type="password" required value={form.confirmarSenha} onChange={set("confirmarSenha")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition mt-2">
          {loading ? "Criando conta…" : "Criar conta"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Já tem conta?{" "}
        <Link href="/login" className="text-green-700 font-medium hover:underline">Entrar</Link>
      </p>
    </>
  );
}
