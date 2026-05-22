"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Perfil {
  perfilCompleto: boolean;
  tipoMoradia: string | null;
  temAreaExterna: boolean | null;
  temOutrosAnimais: boolean;
  descricaoOutrosAnimais: string | null;
  jaAdotouAntes: boolean;
  motivoAdocao: string | null;
  conheceCustos: boolean;
  aceitaVisita: boolean;
  usuario: { nomeCompleto: string; email: string; telefone: string | null };
}

export default function PerfilAdotantePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nomeCompleto: "",
    telefone: "",
    tipoMoradia: "",
    temAreaExterna: "",
    temOutrosAnimais: false,
    descricaoOutrosAnimais: "",
    jaAdotouAntes: false,
    motivoAdocao: "",
    conheceCustos: false,
    aceitaVisita: false,
  });

  useEffect(() => {
    fetch("/api/me/adotante")
      .then((r) => r.json())
      .then((p: Perfil) => {
        setForm((prev) => ({
          ...prev,
          nomeCompleto: p.usuario.nomeCompleto,
          telefone: p.usuario.telefone ?? "",
          tipoMoradia: p.tipoMoradia ?? "",
          temAreaExterna: p.temAreaExterna === null ? "" : String(p.temAreaExterna),
          temOutrosAnimais: p.temOutrosAnimais,
          descricaoOutrosAnimais: p.descricaoOutrosAnimais ?? "",
          jaAdotouAntes: p.jaAdotouAntes,
          motivoAdocao: p.motivoAdocao ?? "",
          conheceCustos: p.conheceCustos,
          aceitaVisita: p.aceitaVisita,
        }));
      })
      .catch(() => router.push("/login"));
  }, [router]);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        temAreaExterna: form.temAreaExterna === "true" ? true : form.temAreaExterna === "false" ? false : null,
        tipoMoradia: form.tipoMoradia || null,
      };
      const res = await fetch("/api/me/adotante", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSaved(true);
      setTimeout(() => router.push("/painel/adotante"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const stepTitles = ["Dados pessoais", "Moradia e animais", "Comprometimento"];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meu Perfil de Adotante</h1>
        <p className="text-gray-500 text-sm mb-6">Complete seu perfil para solicitar adoções.</p>

        {/* Steps */}
        <div className="flex items-center mb-8">
          {stepTitles.map((title, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i + 1 <= step ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 mx-1 transition-colors ${i + 1 < step ? "bg-green-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-4">{stepTitles[step - 1]}</h2>

          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input required value={form.nomeCompleto} onChange={(e) => set("nomeCompleto", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp *</label>
                <input required value={form.telefone} onChange={(e) => set("telefone", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="(61) 9xxxx-xxxx" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de moradia *</label>
                <select required value={form.tipoMoradia} onChange={(e) => set("tipoMoradia", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Selecione...</option>
                  <option value="casa_propria">Casa própria</option>
                  <option value="alugada">Alugada</option>
                  <option value="cedida">Cedida</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tem área externa?</label>
                <select value={form.temAreaExterna} onChange={(e) => set("temAreaExterna", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Não informado</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.temOutrosAnimais} onChange={(e) => set("temOutrosAnimais", e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Já tenho outros animais</span>
              </label>
              {form.temOutrosAnimais && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descreva seus animais</label>
                  <textarea rows={2} value={form.descricaoOutrosAnimais} onChange={(e) => set("descricaoOutrosAnimais", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.jaAdotouAntes} onChange={(e) => set("jaAdotouAntes", e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Já adotei animais antes</span>
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Por que deseja adotar? *</label>
                <textarea required rows={4} value={form.motivoAdocao} onChange={(e) => set("motivoAdocao", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" placeholder="Conte-nos sobre sua motivação e como será o ambiente para o animal..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input required type="checkbox" checked={form.conheceCustos} onChange={(e) => set("conheceCustos", e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Estou ciente dos custos com alimentação, saúde e cuidados *</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input required type="checkbox" checked={form.aceitaVisita} onChange={(e) => set("aceitaVisita", e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Aceito que o protetor faça visita domiciliar se necessário *</span>
              </label>
            </>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm">Perfil salvo! Redirecionando...</p>}

          <div className="flex justify-between pt-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                ← Voltar
              </button>
            ) : <div />}
            <button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {step < 3 ? "Continuar →" : saving ? "Salvando..." : "Salvar perfil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
