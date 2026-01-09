# NeuroPlan - TODO

## Fase 1: Estrutura Base e Design System
- [x] Configurar schema do banco de dados (users, projects, tasks, focus_cycles, daily_logs, quick_ideas)
- [x] Configurar paleta de cores neuroadaptada (sem azul, priorizar verde/vermelho/laranja)
- [x] Configurar tipografia Inter com tamanhos acessíveis (mínimo 14pt)
- [x] Criar design tokens e variáveis CSS

## Fase 2: Landing Page (Estilo NotebookLM)
- [x] Header com navegação e botão de login
- [x] Hero section com título e CTA principal
- [x] Seção "Seu Parceiro de Execução com IA"
- [x] Feature cards (Upload de briefing, Insights instantâneos, Citações, Timer)
- [x] Seção "Como as pessoas usam o NeuroPlan"
- [x] Seção de depoimentos
- [x] Footer com disclaimer LGPD/ANVISA

## Fase 3: Dashboard e Sistema de Projetos
- [x] Layout do dashboard com sidebar
- [x] Lista de projetos do usuário
- [x] Criar novo projeto
- [x] Visualização de projeto individual
- [x] Sistema de ciclos 3+1 (D0 planejamento + D1-D3 execução)
- [x] Visualização de tarefas por dia

## Fase 4: Sistema de Briefing com IA
- [x] Tela de briefing one-shot
- [x] Integração com LLM para reformulação do briefing
- [x] Geração automática de tarefas via IA
- [x] Definição de entregáveis A-B-C (anti-perfeccionismo)
- [x] Detecção automática de categoria (PERSONAL/PROFESSIONAL/ACADEMIC)

## Fase 5: Timer Progressivo e Ciclos de Foco
- [x] Timer progressivo (mostra tempo investido)
- [x] Timer countdown alternativo (preferência do usuário)
- [x] Barra/arco SVG animado com cores (verde/laranja/vermelho)
- [x] Registro de FocusCycle no banco
- [x] Sugestão automática de pausas

## Fase 6: Funcionalidades Adicionais
- [x] Quick Ideas (captura de ideias não-lineares)
- [x] Daily Log "Onde parei" (externalização de memória)
- [ ] Justificativa para alteração de tarefas
- [ ] Matriz esforço/impacto visual

## Fase 7: Integração de Pagamento (Stripe)
- [x] Configurar Stripe
- [x] Planos de assinatura (Gratuito, Pro, Team)
- [x] Página de pricing
- [x] Checkout e gestão de assinatura
- [x] Webhook para eventos de pagamento

## Fase 8: Compliance e Segurança
- [x] Disclaimer ANVISA em todas as telas
- [x] Consentimento LGPD explícito
- [x] Política de privacidade (placeholder)
- [x] Termos de uso (placeholder)

## Fase 9: Testes e Ajustes
- [x] Testes unitários para procedures críticas
- [x] Validação de responsividade
- [ ] Validação de acessibilidade (WCAG AA+)
- [ ] Testes de integração com IA
