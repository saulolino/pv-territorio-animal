import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Pública | PV Território Animal",
  description: "Documentação da API pública do PV Território Animal.",
};

const BASE = "https://pets.lino.app.br";

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-gray-900 text-green-300 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
      {code}
    </pre>
  );
}

function Endpoint({ method, path, desc, params }: {
  method: string;
  path: string;
  desc: string;
  params?: { name: string; type: string; desc: string; required?: boolean }[];
}) {
  const methodColor = method === "GET" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${methodColor}`}>{method}</span>
        <code className="text-sm font-mono text-gray-800">{path}</code>
      </div>
      <p className="text-sm text-gray-600 mb-3">{desc}</p>
      {params && params.length > 0 && (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="pb-1 pr-4">Parâmetro</th>
              <th className="pb-1 pr-4">Tipo</th>
              <th className="pb-1 pr-4">Obrigatório</th>
              <th className="pb-1">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr key={p.name} className="border-b border-gray-50">
                <td className="py-1 pr-4 font-mono text-gray-700">{p.name}</td>
                <td className="py-1 pr-4 text-gray-500">{p.type}</td>
                <td className="py-1 pr-4 text-gray-500">{p.required ? "Sim" : "Não"}</td>
                <td className="py-1 text-gray-600">{p.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-green-700 text-lg">PV Território Animal</Link>
          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">API pública</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Pública</h1>
        <p className="text-gray-500 text-sm mb-2">
          Endpoints abertos, sem autenticação, para consulta de dados do PV Território Animal.
          Todos os endpoints retornam JSON com CORS habilitado (<code>*</code>).
        </p>
        <p className="text-gray-400 text-xs mb-8">Base URL: <code className="font-mono">{BASE}</code></p>

        <h2 className="text-lg font-bold text-gray-900 mb-4">Animais disponíveis</h2>

        <Endpoint
          method="GET"
          path="/api/public/animais"
          desc="Lista paginada de animais disponíveis para adoção."
          params={[
            { name: "page", type: "integer", desc: "Página (padrão: 1)" },
            { name: "limit", type: "integer", desc: "Itens por página (padrão: 20, máx: 50)" },
            { name: "especie", type: "string", desc: "cachorro | gato | outro" },
            { name: "sexo", type: "string", desc: "macho | femea" },
            { name: "porte", type: "string", desc: "mini | pequeno | medio | grande | gigante" },
            { name: "raId", type: "integer", desc: "ID da Região Administrativa (ver /api/public/ras)" },
          ]}
        />

        <CodeBlock code={`# Exemplo: buscar cachorros pequenos na RA 1
curl "${BASE}/api/public/animais?especie=cachorro&porte=pequeno&raId=1"

# Resposta
{
  "data": [
    {
      "id": "uuid",
      "slug": "rex-cachorro-pequeno",
      "nome": "Rex",
      "especie": "cachorro",
      "sexo": "macho",
      "porte": "pequeno",
      "idadeEstimadaMeses": 18,
      "castrado": true,
      "vacinado": true,
      "destaque": false,
      "ra": { "id": 1, "nome": "Brasília", "sigla": "RA I" },
      "fotos": [{ "url": "https://..." }]
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 3,
  "limit": 20
}`} />

        <h2 className="text-lg font-bold text-gray-900 mb-4 mt-8">Regiões Administrativas</h2>

        <Endpoint
          method="GET"
          path="/api/public/ras"
          desc="Lista todas as 35 Regiões Administrativas do DF."
        />

        <CodeBlock code={`curl "${BASE}/api/public/ras"

# Resposta
{
  "data": [
    { "id": 1, "codigoRa": "RA01", "nome": "Brasília", "sigla": "RA I", "regiao": "Centro" },
    ...
  ],
  "total": 35
}`} />

        <h2 className="text-lg font-bold text-gray-900 mb-4 mt-8">Estatísticas gerais</h2>

        <Endpoint
          method="GET"
          path="/api/public/stats"
          desc="Resumo de animais disponíveis, adotados, protetores e regiões cobertas."
        />

        <CodeBlock code={`curl "${BASE}/api/public/stats"

# Resposta
{
  "disponiveis": 127,
  "adotados": 89,
  "protetores": 34,
  "ras": 35
}`} />

        <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-green-800 mb-1">Uso justo</h3>
          <p className="text-xs text-green-700">
            Esta API é gratuita e aberta. Pedimos que você limite as requisições a no máximo 100 por minuto.
            Para integrações críticas ou volumes altos, entre em contato.
            Os dados são de uso social — atribuição ao PV Território Animal é bem-vinda.
          </p>
        </div>
      </div>
    </div>
  );
}
