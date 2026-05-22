"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Perfil {
  descricao: string | null;
  raId: number | null;
  fotoPerfil: string | null;
  tipoProtetor: string;
  verificado: boolean;
  usuario: { nomeCompleto: string; email: string; telefone: string | null };
}

export default function PerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [form, setForm] = useState({ nomeCompleto: "", telefone: "", descricao: "" });

  useEffect(() => {
    fetch("/api/me/protetor")
      .then((r) => r.json())
      .then((p: Perfil) => {
        setPerfil(p);
        setForm({
          nomeCompleto: p.usuario.nomeCompleto,
          telefone: p.usuario.telefone ?? "",
          descricao: p.descricao ?? "",
        });
      });
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/me/protetor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const tipoLabels: Record<string, string> = {
    independente: "Protetor independente",
    lar_temporario: "Lar temporário",
    abrigo: "Abrigo",
    ong: "ONG",
  };

  async function excluirConta() {
    if (!confirm("Excluir sua conta é irreversível. Seus dados serão anonimizados. Confirmar?")) return;
    setDeletingAccount(true);
    await fetch("/api/auth/conta", { method: "DELETE" });
    router.push("/");
  }

  if (!perfil) return <div className="text-gray-500">Carregando...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-gray-700">
            {tipoLabels[perfil.tipoProtetor] ?? perfil.tipoProtetor}
          </span>
          {perfil.verificado && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verificado</span>
          )}
        </div>
        <div className="text-sm text-gray-500">{perfil.usuario.email}</div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
          <input
            required
            value={form.nomeCompleto}
            onChange={(e) => set("nomeCompleto", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
          <input
            value={form.telefone}
            onChange={(e) => set("telefone", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="(61) 9xxxx-xxxx"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            rows={4}
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Conte um pouco sobre seu trabalho com os animais..."
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {saved && <p className="text-green-600 text-sm">Perfil salvo com sucesso!</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>

      <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-red-700 mb-1">Zona de perigo</h2>
        <p className="text-xs text-red-600 mb-3">A exclusão é irreversível. Seus dados pessoais serão anonimizados.</p>
        <button
          onClick={excluirConta}
          disabled={deletingAccount}
          className="text-xs px-4 py-2 rounded-lg border border-red-400 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          {deletingAccount ? "Excluindo..." : "Excluir minha conta"}
        </button>
      </div>
    </div>
  );
}
