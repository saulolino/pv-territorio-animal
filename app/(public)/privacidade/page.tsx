import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | PV Território Animal",
  description: "Como coletamos, usamos e protegemos seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-green-700 text-lg">PV Território Animal</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: maio de 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Quem somos</h2>
            <p>O PV Território Animal é uma plataforma sem fins lucrativos que conecta protetores de animais do Distrito Federal a adotantes responsáveis. Esta política descreve como tratamos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Dados coletados</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Protetores:</strong> nome completo, e-mail, telefone, Região Administrativa, descrição e fotos de perfil.</li>
              <li><strong>Adotantes:</strong> nome completo, e-mail, CPF (armazenado criptografado com AES-256), telefone, endereço residencial, renda, histórico de animais e condições de moradia.</li>
              <li><strong>Dados de uso:</strong> logs de acesso (data, hora, IP) para segurança.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Finalidade do tratamento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Viabilizar o processo de adoção responsável entre protetores e adotantes.</li>
              <li>Enviar notificações relacionadas às solicitações de adoção.</li>
              <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Compartilhamento</h2>
            <p>Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais. O CPF do adotante é acessível apenas ao administrador da plataforma e ao protetor com solicitação de adoção ativa.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Seus direitos (LGPD)</h2>
            <p>Você tem direito a: confirmar o tratamento, acessar seus dados, corrigir informações incorretas, solicitar a exclusão da conta e revogar o consentimento. Para exercer esses direitos, acesse as configurações da sua conta ou entre em contato conosco.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Exclusão de conta</h2>
            <p>Você pode solicitar a exclusão da sua conta a qualquer momento. Seus dados pessoais serão anonimizados. Registros de adoções já concluídas são mantidos para fins de rastreabilidade, sem identificação pessoal.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Segurança</h2>
            <p>Utilizamos criptografia em trânsito (HTTPS/TLS) e em repouso (CPF com AES-256). Senhas são armazenadas com bcrypt (12 rounds). Cookies de sessão são httpOnly, SameSite=Strict e Secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Contato</h2>
            <p>Dúvidas sobre esta política: <a href="mailto:contato@pvterritorioanimal.org.br" className="text-green-700 hover:underline">contato@pvterritorioanimal.org.br</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
