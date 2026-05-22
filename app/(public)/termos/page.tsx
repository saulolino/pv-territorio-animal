import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | PV Território Animal",
  description: "Termos e condições de uso da plataforma PV Território Animal.",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-green-700 text-lg">PV Território Animal</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: maio de 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Aceitação</h2>
            <p>Ao criar uma conta ou utilizar o PV Território Animal, você concorda com estes Termos de Uso. Se não concordar, não utilize a plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Propósito</h2>
            <p>A plataforma visa facilitar a adoção responsável de animais no Distrito Federal, conectando protetores voluntários a adotantes comprometidos.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Responsabilidades do protetor</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Manter informações atualizadas e verídicas sobre os animais.</li>
              <li>Analisar as solicitações com responsabilidade, priorizando o bem-estar animal.</li>
              <li>Nunca transferir animais sem o acompanhamento adequado.</li>
              <li>Notificar a plataforma em caso de adoção fora do sistema.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Responsabilidades do adotante</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fornecer informações verídicas no perfil de adoção.</li>
              <li>Comprometer-se com os cuidados necessários ao animal adotado.</li>
              <li>Não abandonar animais adotados por esta plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Conduta proibida</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utilizar a plataforma para fins comerciais (venda de animais).</li>
              <li>Fornecer informações falsas.</li>
              <li>Assediar ou ameaçar outros usuários.</li>
              <li>Tentar comprometer a segurança da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Limitação de responsabilidade</h2>
            <p>A plataforma é um intermediário. Não nos responsabilizamos pelo comportamento dos usuários após a adoção. A decisão final de adoção é sempre do protetor.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Encerramento de conta</h2>
            <p>Reservamos o direito de encerrar contas que violem estes termos. Você pode excluir sua conta a qualquer momento nas configurações.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Alterações</h2>
            <p>Podemos atualizar estes termos. Notificaremos por e-mail em caso de mudanças relevantes.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
