"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Foto {
  url: string;
  thumbUrl: string;
}

export default function NovoAnimalPage() {
  const router = useRouter();
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nome: "",
    especie: "cachorro",
    raca: "",
    sexo: "macho",
    porte: "medio",
    cor: "",
    descricao: "",
    idadeEstimadaMeses: "",
    castrado: "",
    vacinado: "",
    vermifugado: "",
    microchipado: false,
    bomComCriancas: "",
    bomComOutrosAnimais: "",
    bomComGatos: "",
    necessidadesEspeciais: "",
  });

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fotos.length >= 8) { setError("Máximo de 8 fotos."); return; }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("foto", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFotos((prev) => [...prev, { url: data.url, thumbUrl: data.thumbUrl }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar foto.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeFoto(i: number) {
    setFotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function parseBool(v: string): boolean | null {
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        nome: form.nome,
        especie: form.especie,
        raca: form.raca || undefined,
        sexo: form.sexo,
        porte: form.porte,
        cor: form.cor || undefined,
        descricao: form.descricao,
        idadeEstimadaMeses: form.idadeEstimadaMeses ? Number(form.idadeEstimadaMeses) : undefined,
        castrado: parseBool(form.castrado),
        vacinado: parseBool(form.vacinado),
        vermifugado: parseBool(form.vermifugado),
        microchipado: form.microchipado,
        bomComCriancas: parseBool(form.bomComCriancas),
        bomComOutrosAnimais: parseBool(form.bomComOutrosAnimais),
        bomComGatos: parseBool(form.bomComGatos),
        necessidadesEspeciais: form.necessidadesEspeciais || undefined,
        fotos: fotos.map((f, i) => ({ url: f.url, thumbUrl: f.thumbUrl, ordem: i, principal: i === 0 })),
      };

      const res = await fetch("/api/animais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/painel/animais");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const triOpts = [
    { value: "", label: "Não sei" },
    { value: "true", label: "Sim" },
    { value: "false", label: "Não" },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastrar Animal</h1>

      <form onSubmit={submit} className="space-y-6">
        {/* Fotos */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Fotos</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {fotos.map((f, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <Image src={f.thumbUrl || f.url} alt="" fill className="object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-green-600 text-white py-0.5">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {fotos.length < 8 && (
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
                {uploading ? (
                  <span className="text-xs text-gray-400">...</span>
                ) : (
                  <>
                    <span className="text-2xl text-gray-300">+</span>
                    <span className="text-xs text-gray-400 mt-1">Foto</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={uploadFoto} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">Até 8 fotos. A primeira será a foto principal.</p>
        </section>

        {/* Identificação */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Identificação</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              required
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Bolinha"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espécie *</label>
              <select value={form.especie} onChange={(e) => set("especie", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
              <select value={form.sexo} onChange={(e) => set("sexo", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porte *</label>
              <select value={form.porte} onChange={(e) => set("porte", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="mini">Mini (até 4kg)</option>
                <option value="pequeno">Pequeno (4–10kg)</option>
                <option value="medio">Médio (10–25kg)</option>
                <option value="grande">Grande (25–45kg)</option>
                <option value="gigante">Gigante (45kg+)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade estimada</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={form.idadeEstimadaMeses}
                  onChange={(e) => set("idadeEstimadaMeses", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">meses</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
              <input value={form.raca} onChange={(e) => set("raca", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="SRD, Labrador..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input value={form.cor} onChange={(e) => set("cor", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Amarelo, preto..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <textarea
              required
              minLength={10}
              rows={4}
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Conte um pouco sobre a personalidade e história deste animal..."
            />
          </div>
        </section>

        {/* Saúde e Comportamento */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Saúde e Comportamento</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Castrado", field: "castrado" },
              { label: "Vacinado", field: "vacinado" },
              { label: "Vermifugado", field: "vermifugado" },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select
                  value={form[field as keyof typeof form] as string}
                  onChange={(e) => set(field, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {triOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.microchipado} onChange={(e) => set("microchipado", e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">Microchipado</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Bom com crianças", field: "bomComCriancas" },
              { label: "Bom com outros animais", field: "bomComOutrosAnimais" },
              { label: "Bom com gatos", field: "bomComGatos" },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select
                  value={form[field as keyof typeof form] as string}
                  onChange={(e) => set(field, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {triOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Necessidades especiais</label>
            <textarea
              rows={2}
              value={form.necessidadesEspeciais}
              onChange={(e) => set("necessidadesEspeciais", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Medicação, acompanhamento veterinário, etc. (opcional)"
            />
          </div>
        </section>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? "Salvando..." : "Cadastrar Animal"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/painel/animais")}
            className="text-gray-600 hover:text-gray-800 px-4 py-2.5 text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
