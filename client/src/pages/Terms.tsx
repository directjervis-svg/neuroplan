import { useLocation } from "wouter";

export default function Terms() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-gray-600 mb-8">Última atualização: 12 de Janeiro de 2026</p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          {/* Seção 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="mb-4">
              Ao acessar e usar o NeuroExecução, você concorda em estar vinculado por estes Termos de
              Uso. Se você não concorda com qualquer parte destes termos, você não deve usar o serviço.
            </p>
          </section>

          {/* Seção 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p className="mb-4">
              O NeuroExecução é um sistema de gestão de projetos neuroadaptado, projetado para auxílio
              na organização pessoal e profissional. O serviço oferece:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Decomposição de projetos em ciclos de 3 dias</li>
              <li>Priorização de tarefas em sistema A-B-C</li>
              <li>Timer progressivo para rastreamento de tempo</li>
              <li>Painel "Onde Parei" para externalização de memória</li>
              <li>Assistente IA para sugestões e orientação</li>
              <li>Análise de produtividade e gamificação</li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Uso Adequado</h2>
            <p className="mb-4">Você concorda em usar o NeuroExecução apenas para fins legítimos:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>✅ Uso pessoal e profissional permitido</li>
              <li>✅ Compartilhamento com colegas/equipe permitido (plano TEAM)</li>
              <li>❌ Revenda ou redistribuição proibida</li>
              <li>❌ Uso comercial sem autorização proibido</li>
              <li>❌ Acesso não autorizado ou hacking proibido</li>
              <li>❌ Conteúdo ilegal ou ofensivo proibido</li>
            </ul>
          </section>

          {/* Seção 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Importante: Não é Tratamento Médico</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="font-bold text-yellow-900 mb-2">⚠️ Aviso Legal</p>
              <p className="text-yellow-800">
                O NeuroExecução é uma ferramenta de produtividade e <strong>NÃO substitui</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 text-yellow-800">
                <li>Diagnóstico médico profissional</li>
                <li>Tratamento psicológico ou psiquiátrico</li>
                <li>Medicação prescrita por médico</li>
                <li>Orientação de um profissional de saúde</li>
              </ul>
              <p className="mt-2 text-yellow-800">
                Se você tem TDAH ou suspeita ter, consulte um médico qualificado.
              </p>
            </div>
          </section>

          {/* Seção 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Planos e Pagamentos</h2>
            <p className="mb-4">O NeuroExecução oferece três planos:</p>
            <div className="space-y-4 mb-4">
              <div className="border border-gray-200 p-4 rounded">
                <p className="font-bold text-gray-900">FREE</p>
                <p className="text-gray-600">Grátis. 1 projeto, 3 tarefas/dia, timer básico.</p>
              </div>
              <div className="border border-gray-200 p-4 rounded">
                <p className="font-bold text-gray-900">PRO</p>
                <p className="text-gray-600">R$ 29,90/mês ou R$ 199,90/ano. Projetos ilimitados, configurações avançadas.</p>
              </div>
              <div className="border border-gray-200 p-4 rounded">
                <p className="font-bold text-gray-900">TEAM</p>
                <p className="text-gray-600">R$ 99,90/mês. Até 5 usuários, compartilhamento de projetos.</p>
              </div>
            </div>
            <p className="mb-4">
              <strong>Cobrança:</strong> Cobranças são processadas mensalmente ou anualmente via Stripe,
              de acordo com seu plano.
            </p>
          </section>
          
          {/* Seção 5A: Política de Cancelamento e Reembolso */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5A. Política de Cancelamento e Reembolso</h2>
            <p className="mb-4">
              Em conformidade com o Código de Defesa do Consumidor (CDC), você tem direito ao
              arrependimento em até 7 dias corridos a partir da contratação de qualquer plano pago.
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Como Solicitar Reembolso</h3>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Envie um email para suporte@neuroexecucao.com.br dentro do prazo de 7 dias</li>
              <li>Informe seu email de cadastro e o motivo do cancelamento</li>
              <li>O reembolso será processado em até 5 dias úteis</li>
              <li>O valor será devolvido na mesma forma de pagamento utilizada</li>
            </ol>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Como Cancelar Assinatura</h3>
            <p className="mb-4">
              Você pode cancelar sua assinatura a qualquer momento sem multa ou penalidade através
              do Portal do Cliente disponível em Configurações &gt; Assinatura &gt; Gerenciar no Stripe.
              O cancelamento terá efeito imediato e você perderá acesso aos recursos Pro/Team.
            </p>
          </section>

          {/* Seção 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
            <p className="mb-4">
              <strong>Conteúdo do NeuroExecução:</strong> O sistema, design, código, logos e conteúdo
              são propriedade intelectual do NeuroExecução e protegidos por lei.
            </p>
            <p className="mb-4">
              <strong>Seu Conteúdo:</strong> Você retém todos os direitos sobre conteúdo que você criar
              (projetos, tarefas, notas). Você nos concede licença para usar seu conteúdo para operar o
              serviço.
            </p>
            <p className="mb-4">
              <strong>Marca:</strong> "NeuroExecução" é marca registrada. Você não pode usar sem
              autorização.
            </p>
          </section>

          {/* Seção 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
            <p className="mb-4">
              <strong>Isenção de Garantias:</strong> O NeuroExecução é fornecido "como está", sem
              garantias de qualquer tipo.
            </p>
            <p className="mb-4">
              <strong>Não Somos Responsáveis Por:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Decisões que você toma baseadas no uso do NeuroExecução</li>
              <li>Perda de dados (mantenha backups)</li>
              <li>Danos indiretos ou consequentes</li>
              <li>Resultados específicos de produtividade</li>
              <li>Diagnósticos ou tratamentos médicos</li>
            </ul>
            <p className="mb-4">
              <strong>Limite de Responsabilidade:</strong> Nossa responsabilidade total é limitada ao
              valor que você pagou nos últimos 12 meses.
            </p>
          </section>

          {/* Seção 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Suspensão de Conta</h2>
            <p className="mb-4">Podemos suspender ou encerrar sua conta se você:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Violar estes Termos de Uso</li>
              <li>Usar o serviço para fins ilegais</li>
              <li>Não pagar por serviços contratados</li>
              <li>Tentar acessar sistemas não autorizados</li>
              <li>Usar o serviço para spam ou abuso</li>
            </ul>
          </section>

          {/* Seção 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Mudanças aos Termos</h2>
            <p className="mb-4">
              Podemos atualizar estes Termos ocasionalmente. Notificaremos você sobre mudanças
              significativas por email. Seu uso continuado do serviço após mudanças significa aceitação
              dos novos termos.
            </p>
          </section>

          {/* Seção 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Lei Aplicável</h2>
            <p className="mb-4">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa
              será resolvida nos tribunais brasileiros.
            </p>
          </section>

          {/* Seção 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contato</h2>
            <p className="mb-4">
              Para dúvidas sobre estes Termos, entre em contato:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="mb-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:contato@neuroexecucao.com.br" className="text-green-600 hover:underline">
                  contato@neuroexecucao.com.br
                </a>
              </p>
              <p>
                <strong>Website:</strong> https://neuroexecucao.com.br
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-sm text-gray-600">
          <a href="/privacy" className="hover:text-gray-900">
            Política de Privacidade
          </a>
          <a href="/" className="hover:text-gray-900">
            Voltar ao Site
          </a>
        </div>
      </main>
    </div>
  );
}
