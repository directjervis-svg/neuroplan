import { useLocation } from "wouter";

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-xl">NeuroExecução</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-gray-600 mb-8">Última atualização: 12 de Janeiro de 2026</p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          {/* Seção 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Dados Coletados</h2>
            <p className="mb-4">
              O NeuroExecução coleta os seguintes dados pessoais para fornecer nosso serviço:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong>Dados de Autenticação:</strong> Email e nome (coletados via OAuth Manus)
              </li>
              <li>
                <strong>Dados de Uso:</strong> Projetos criados, tarefas, tempo investido, ciclos
              </li>
              <li>
                <strong>Preferências:</strong> Tipo de timer, duração de foco, configurações de notificação
              </li>
              <li>
                <strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional
              </li>
            </ul>
          </section>

          {/* Seção 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Finalidade do Tratamento</h2>
            <p className="mb-4">Utilizamos seus dados para:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Fornecer o serviço de gestão de projetos neuroadaptado</li>
              <li>Melhorar a experiência do usuário e personalizar o sistema</li>
              <li>Comunicar sobre atualizações, novos recursos e manutenção</li>
              <li>Analisar uso e tendências (de forma anônima)</li>
              <li>Prevenir fraude e garantir segurança</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Compartilhamento de Dados</h2>
            <p className="mb-4">
              Seus dados podem ser compartilhados com os seguintes terceiros:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong>Stripe:</strong> Para processamento seguro de pagamentos (PCI-DSS compliant)
              </li>
              <li>
                <strong>Google Analytics:</strong> Para análise anônima de uso (dados agregados)
              </li>
              <li>
                <strong>Manus:</strong> Provedor de infraestrutura e autenticação
              </li>
            </ul>
            <p className="mb-4">
              <strong>Nós NÃO vendemos seus dados</strong> a terceiros. Nós NÃO compartilhamos dados
              pessoais com fins de marketing.
            </p>
          </section>

          {/* Seção 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Seus Direitos (LGPD)</h2>
            <p className="mb-4">
              Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong>Acesso:</strong> Solicitar cópia de todos os dados que temos sobre você
              </li>
              <li>
                <strong>Correção:</strong> Corrigir dados incorretos ou incompletos
              </li>
              <li>
                <strong>Exclusão:</strong> Solicitar exclusão de seus dados ("direito ao esquecimento")
              </li>
              <li>
                <strong>Portabilidade:</strong> Receber seus dados em formato estruturado
              </li>
              <li>
                <strong>Revogação:</strong> Revogar consentimento para tratamento de dados
              </li>
              <li>
                <strong>Oposição:</strong> Se opor ao tratamento de seus dados
              </li>
            </ul>
            <p className="mb-4">
              Para exercer qualquer destes direitos, envie um email para{" "}
              <a href="mailto:privacidade@neuroexecucao.com.br" className="text-green-600 hover:underline">
                privacidade@neuroexecucao.com.br
              </a>
              .
            </p>
          </section>

          {/* Seção 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Segurança dos Dados</h2>
            <p className="mb-4">
              Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Criptografia HTTPS em todas as comunicações</li>
              <li>Senhas armazenadas com hash seguro</li>
              <li>Acesso restrito a dados pessoais</li>
              <li>Backups regulares e plano de recuperação</li>
              <li>Monitoramento de segurança 24/7</li>
            </ul>
          </section>

          {/* Seção 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies e Rastreamento</h2>
            <p className="mb-4">Utilizamos cookies para:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong>Essenciais:</strong> Manter você autenticado e salvar preferências
              </li>
              <li>
                <strong>Análise:</strong> Entender como você usa o NeuroExecução (Google Analytics)
              </li>
            </ul>
            <p className="mb-4">
              Você pode desabilitar cookies em seu navegador, mas isso pode afetar a funcionalidade do
              serviço.
            </p>
          </section>

          {/* Seção 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Retenção de Dados</h2>
            <p className="mb-4">
              Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, seus dados
              serão deletados em até 30 dias, exceto quando obrigados a manter por lei.
            </p>
          </section>

          {/* Seção 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Encarregado de Dados (DPO)</h2>
            <p className="mb-4">
              Designamos um Encarregado de Proteção de Dados (DPO) conforme exigido pela LGPD.
              Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de seus dados pessoais:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="mb-2">
                <strong>Email DPO:</strong>{" "}
                <a href="mailto:dpo@neuroexecucao.com.br" className="text-green-600 hover:underline">
                  dpo@neuroexecucao.com.br
                </a>
              </p>
              <p className="mb-2">
                <strong>Nome:</strong> Leonardo (Proprietário e DPO)
              </p>
              <p>
                <strong>Localização:</strong> Brasil
              </p>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Localização dos Dados</h3>
            <p className="mb-4">
              Seus dados pessoais são armazenados em servidores localizados nos Estados Unidos,
              operados por nossos provedores de infraestrutura (Manus Hosting e TiDB Cloud).
              Garantimos que todos os prestadores de serviços que processam dados em nosso nome
              aderem aos mesmos padrões de proteção exigidos pela LGPD.
            </p>
          </section>

          {/* Seção 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Alterações a Esta Política</h2>
            <p className="mb-4">
              Podemos atualizar esta política ocasionalmente. Notificaremos você sobre mudanças
              significativas por email ou através de um aviso no site.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
          <a href="/terms" className="hover:text-gray-900">
            Termos de Uso
          </a>
          <a href="/" className="hover:text-gray-900">
            Voltar ao Site
          </a>
        </div>
      </main>
    </div>
  );
}
