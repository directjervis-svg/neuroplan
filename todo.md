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

## Fase 10: Sistema de Gamificação
- [x] Criar schema para gamificação (streaks, badges, XP, levels)
- [x] Implementar sistema de streaks (dias consecutivos)
- [x] Criar emblemas/badges por conquistas
- [x] Implementar barras de progresso e XP
- [x] Criar página de perfil com conquistas

## Fase 11: Jornada do Usuário (Onboarding)
- [x] Criar fluxo de boas-vindas para novos usuários
- [x] Implementar tour guiado pelas funcionalidades
- [x] Criar checklist de primeiros passos
- [x] Adicionar tooltips contextuais

## Fase 12: Modelos de Projeto
- [x] Criar templates pré-prontos (Conteúdo, Software, Acadêmico, Pessoal)
- [x] Implementar seleção de template na criação de projeto
- [x] Pré-popular tarefas baseadas no template

## Fase 13: Exportação PDF Premium
- [x] Implementar geração de PDF com design corporativo
- [x] Criar template "Plano Mental One-Page"
- [x] Criar template "Post-its Recortáveis"
- [x] Criar template "One-Page do Projeto"
- [x] Implementar exportação de código iCal para calendário
- [x] Adicionar personalização de logo/cores corporativas

## Fase 14: Welcome Page Estilo Starlink
- [x] Integrar imagem Voyager como hero background
- [x] Criar design imersivo estilo Starlink
- [x] Adicionar animações sutis de entrada


## Fase 15: Sistema de Notificações
- [x] Implementar notificações para tarefas do dia
- [x] Criar alertas de quebra de streak
- [x] Adicionar incentivos para manutenção de streaks
- [x] Integrar com API de notificações do template

## Fase 16: Dashboard de Analytics
- [x] Criar página de analytics com gráficos
- [x] Implementar visualização de produtividade semanal/mensal
- [x] Adicionar métricas de horas de foco
- [x] Criar gráfico de evolução de XP e tarefas

## Fase 17: Coeficientes de Tarefas
- [x] Implementar coeficientes para ACTION (peso 1.0)
- [x] Implementar coeficientes para RETENTION (peso 0.7)
- [x] Implementar coeficientes para MAINTENANCE (peso 0.5)
- [x] Calcular score de produtividade baseado em coeficientes

## Fase 18: Matriz Esforço/Resultado
- [x] Criar visualização da matriz 2x2
- [x] Implementar classificação de tarefas por esforço/impacto
- [x] Adicionar drag-and-drop para reposicionar tarefas
- [x] Gerar recomendações baseadas na matriz

## Fase 19: Redesign Welcome Page
- [x] Separar hero com apenas imagem Voyager (sem texto)
- [x] Mover textos para seção abaixo da imagem
- [x] Ajustar transições entre seções


## Fase 20: Modo Offline (PWA)
- [x] Criar manifest.json para PWA
- [x] Implementar Service Worker para cache de assets
- [x] Configurar IndexedDB para armazenamento local
- [x] Criar hooks de sincronização offline/online
- [x] Implementar fila de operações pendentes
- [x] Adicionar indicador de status de conexão na UI
- [x] Implementar sincronização automática ao reconectar
- [x] Permitir instalação do app no dispositivo


## Fase 21: Notificações Push
- [x] Configurar Web Push API no servidor
- [x] Criar endpoint para registro de subscription
- [x] Implementar envio de notificações para tarefas pendentes
- [x] Criar alertas de streak em risco
- [x] Adicionar UI para gerenciar preferências de notificação

## Fase 22: Sincronização em Segundo Plano
- [x] Implementar Background Sync API no Service Worker
- [x] Criar fila de operações pendentes persistente
- [x] Garantir sincronização mesmo com app fechado
- [x] Adicionar retry automático para falhas

## Fase 23: Relatórios Semanais por Email
- [x] Criar template de email com resumo semanal
- [x] Implementar cálculo de métricas de produtividade
- [x] Gerar insights baseados em coeficientes de tarefas
- [x] Configurar agendamento de envio semanal
- [x] Adicionar opção de opt-in/opt-out nas configurações


## Fase 24: Modo Escuro Neuroadaptado
- [x] Criar variáveis CSS para tema escuro
- [x] Manter cores verde/vermelho/laranja em ambos os modos
- [x] Implementar toggle de tema no header/sidebar
- [x] Persistir preferência do usuário
- [x] Garantir contraste adequado para acessibilidade

## Fase 25: Integração Google Calendar
- [x] Configurar OAuth2 para Google Calendar API
- [x] Implementar sincronização de tarefas → eventos
- [x] Implementar sincronização de eventos → tarefas
- [x] Criar página de configuração de calendário
- [x] Adicionar toggle de sincronização automática
## Fase 26: Sistema de Recompensas e TDAH Store
- [x] Criar schema para recompensas e produtos
- [x] Implementar sistema de troca de pontos
- [x] Criar loja TDAH Store com produtos físicos
- [x] Implementar descontos nos planos via pontos
- [x] Criar página de recompensas e históricord
- [ ] Implementar histórico de resgates


## Fase 27: Layout com Abas Dinâmicas
- [x] Implementar sistema de abas expansíveis/recolhíveis
- [x] Criar componente de accordion para seções
- [x] Adicionar animações de transição suaves
- [x] Persistir estado das abas por usuário

## Fase 28: Exportação de Calendários Avançada
- [x] Implementar exportação de calendário mensal
- [x] Criar exportação de calendário semanal
- [x] Criar exportação de planner diário
- [ ] Adicionar exportação de calendário diário
- [ ] Seguir design padrão dos exemplos

## Fase 29: 5 Fases de Gestão de Projetos
- [x] Implementar fase de Iniciação
- [x] Implementar fase de Planejamento
- [x] Implementar fase de Execução
- [x] Implementar fase de Monitoramento
- [x] Implementar fase de Encerramento
- [x] Adicionar insights de aprendizado por fase

## Fase 30: Dashboard Unificado
- [x] Centralizar todas as funcionalidades no dashboard
- [x] Criar visão consolidada de projetos, tarefas e métricas
- [x] Implementar widgets configuráveis
- [x] Adicionar atalhos rápidos para ações frequentes


## Fase 31: Painel Admin TDAH Store
- [x] Criar procedures admin para produtos (CRUD)
- [x] Criar procedures admin para pedidos (listar, atualizar status)
- [x] Implementar página de gerenciamento de produtos
- [x] Implementar página de processamento de pedidos
- [x] Adicionar dashboard de métricas da loja
- [x] Implementar filtros e busca de pedidos


## Fase 32: Redesign Neuroadaptativo (Especificação Completa)

### Schema e Entidades
- [x] Criar tabela de Ciclos (3 dias) com referências a tarefas A/B/C
- [x] Criar tabela "Onde Parei" (registro diário por ciclo)
- [x] Atualizar tarefas para suportar tipos A/B/C e estimativas
- [x] Criar tabela de Log de IA (ações, tokens, tempo)

### Dashboard em 3 Colunas (NotebookLM-like)
- [x] Coluna esquerda (30-35%): Painel "Hoje" com ciclo de 3 dias
- [x] Bloco "Onde parei ontem" fixo no topo
- [x] Lista de máximo 3 tarefas (A destacada, B e C menores)
- [x] Coluna central (45-50%): Área de trabalho da tarefa ativa
- [x] Card expansível com descrição, checklist, botão "Começar por 10 min"
- [x] Barra de ações (Metacognição, 5 Whys, Prompts) no rodapé
- [x] Coluna direita (20-25%): Painel lateral tipo NotebookLM
- [x] Aba 1: Resumo do projeto (bullets)
- [x] Aba 2: Onde parei (editável)
- [x] Aba 3: Assistente IA (campo + botões rápidos)

### Landing Page Focada em Conversão
- [ ] Hero: "Execute projetos em ciclos de 3 dias, mesmo com TDAH"
- [ ] CTA principal: "Começar ciclo de 3 dias grátis"
- [ ] Seção "Como funciona" (3 passos visuais)
- [ ] Seção "Neurociência por trás" (3 cards Barkley)
- [ ] Seção de benefícios esperados (sem promessas médicas)
- [ ] FAQ e segurança/privacidade

### Agente Planner Barkley (IA)
- [ ] Criar agente que recebe descrição e retorna ciclo de 3 dias
- [ ] Gerar tarefas A-B-C automaticamente
- [ ] Integrar no painel Assistente

### Regras Neuroadaptativas
- [ ] Máximo 3-4 elementos de ação por bloco
- [ ] Fonte mínima 14px, espaçamento generoso
- [ ] Estados vazios sempre guiados
- [ ] Feedback visual ≤ 200ms em todas as ações
- [ ] Tooltips explicando elementos neuroadaptativos


## Fase 33: Rebranding para NeuroExecução
- [ ] Renomear app de NeuroPlan para NeuroExecução
- [ ] Atualizar logo e título em todo o app
- [ ] Remover imagem NASA (Voyager) da landing page
- [ ] Redesenhar landing page estilo NotebookLM
- [ ] Criar hero minimalista com foco em texto
- [ ] Atualizar meta tags e SEO


## Fase 34: Tarefas Finais para Lançamento
- [x] Criar Agente Planner Barkley para gerar ciclo de 3 dias automaticamente
- [x] Adicionar seção "Neurociência por trás" com 3 cards Barkley na landing page
- [x] Adicionar seção FAQ na landing page
- [x] Implementar tooltips explicativos para elementos neuroadaptativos
- [x] Garantir feedback visual ≤ 200ms em todas as ações
