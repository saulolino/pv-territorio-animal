"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

interface Foto {
  id: string;
  url: string;
  principal: boolean;
}

interface Animal {
  id: string;
  slug: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: string;
  porte: string;
  cor: string | null;
  descricao: string;
  idadeEstimadaMeses: number | null;
  castrado: boolean | null;
  vacinado: boolean | null;
  vermifugado: boolean | null;
  microchipado: boolean;
  bomComCriancas: boolean | null;
  bomComOutrosAnimais: boolean | null;
  bomComGatos: boolean | null;
  necessidadesEspeciais: string | null;
  status: string;
  fotos: Foto[];
}

function boolStr(v: boolean | null | undefined): string {
  if (v === true) return "true";
  if (v === false) return "false";
  return "";
}

function parseBool(v: string): boolean | null {
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export default function EditarAnimalPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nome: "", especie: "cachorro", raca: "", sexo: "macho", porte: "medio",
    cor: "", descricao: "", idadeEstimadaMeses: "", castrado: "", vacinado: "",
    vermifugado: "", microchipado: false, bomComCriancas: "", bomComOutrosAnimais: "",
    bomComGatos: "", necessidadesEspeciais: "", status: "disponivel",
  });

  useEffect(() => {
    fetch(`/api/animais/${slug}`)
      .then((r) => r.json())
      .then((a: Animal) => {
        setAnimal(a);
        setFotos(a.fotos);
        setForm({
          nome: a.nome,
          especie: a.especie,
          raca: a.raca ?? "",
          sexo: a.sexo,
          porte: a.porte,
          cor: a.cor ?? "",
          descricao: a.descricao,
          idadeEstimadaMeses: a.idadeEstimadaMeses?.toString() ?? "",
          castrado: boolStr(a.castrado),
          vacinado: boolStr(a.vacinado),
          vermifugado: boolStr(a.vermifugado),
          microchipado: a.microchipado,
          bomComCriancas: boolStr(a.bomComCriancas),
          bomComOutrosAnimais: boolStr(a.bomComOutrosAnimais),
          bomComGatos: boolStr(a.bomComGatos),
          necessidadesEspeciais: a.necessidadesEspeciais ?? "",
          status: a.status,
        });
      });
  }, [slug]);

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
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error);

      const addRes = await fetch(`/api/animais/${slug}/fotos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: upData.url, thumbUrl: upData.thumbUrl }),
      });
      const added = await addRes.json();
      if (!addRes.ok) throw new Error(added.error);
      setFotos((prev) => [...prev, added]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar foto.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removerFoto(fotoId: string) {
    await fetch(`/api/animais/${slug}/fotos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fotoId }),
    });
    setFotos((prev) => prev.filter((f) => f.id !== fotoId));
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
        idadeEstimadaMeses: form.idadeEstimadaMeses ? Number(form.idadeEstimadaMeses) : null,
        castrado: parseBool(form.castrado),
        vacinado: parseBool(form.vacinado),
        vermifugado: parseBool(form.vermifugado),
        microchipado: form.microchipado,
        bomComCriancas: parseBool(form.bomComCriancas),
        bomComOutrosAnimais: parseBool(form.bomComOutrosAnimais),
        bomComGatos: parseBool(form.bomComGatos),
        necessidadesEspeciais: form.necessidadesEspeciais || undefined,
        status: form.status,
      };
      const res = await fetch(`/api/animais/${slug}`, {
        method: "PUT",
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

  if (!animal) {
    return <div className="text-gray-500">Carregando...</div>;
  }

  const triOpts = [
    { value: "", label: "Não sei" },
    { value: "true", label: "Sim" },
    { value: "false", label: "Não" },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Animal</h1>

      <form onSubmit={submit} className="space-y-6">
        {/* Fotos */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Fotos</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {fotos.map((f) => (
              <div key={f.id} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <Image src={f.url} alt="" fill className="object-cover" />
                {f.principal && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-green-600 text-white py-0.5">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removerFoto(f.id)}
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
        </section>

        {/* Status */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Status</h2>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="disponivel">Disponível</option>
            <option value="em_processo_adocao">Em processo de adoção</option>
            <option value="adotado">Adotado</option>
            <option value="indisponivel_temporario">Indisponível temporariamente</option>
          </select>
        </section>

        {/* Identificação */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Identificação</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input required value={form.nome} onChange={(e) => set("nome", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
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
                <option value="mini">Mini</option>
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
                <option value="gigante">Gigante</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade (meses)</label>
              <input type="number" min="0" value={form.idadeEstimadaMeses} onChange={(e) => set("idadeEstimadaMeses", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
              <input value={form.raca} onChange={(e) => set("raca", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input value={form.cor} onChange={(e) => set("cor", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <textarea required minLength={10} rows={4} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
          </div>
        </section>

        {/* Saúde */}
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
                <select value={form[field as keyof typeof form] as string} onChange={(e) => set(field, e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
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
                <select value={form[field as keyof typeof form] as string} onChange={(e) => set(field, e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  {triOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Necessidades especiais</label>
            <textarea rows={2} value={form.necessidadesEspeciais} onChange={(e) => set("necessidadesEspeciais", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
          </div>
        </section>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving || uploading} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button type="button" onClick={() => router.push("/painel/animais")} className="text-gray-600 hover:text-gray-800 px-4 py-2.5 text-sm transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
