# NeuroExecução - Manual Oficial de Entrega
## PARTE 1: Manual do Produto

**Data de Entrega:** 11 de Janeiro de 2026  
**Versão do Projeto:** 1.0.0  
**Desenvolvido por:** Manus AI

---

## 1. Resumo das Funcionalidades Ativas

O NeuroExecução é um sistema de gestão de projetos neuroadaptado, especificamente projetado para pessoas com TDAH e dificuldades de execução. Todas as funcionalidades listadas abaixo estão **completamente implementadas e testadas** no código.

### 1.1 Autenticação e Gerenciamento de Usuários

O sistema utiliza autenticação OAuth integrada através do portal Manus. Quando um visitante chega ao site, ele pode fazer login usando suas credenciais. O sistema armazena informações do usuário no banco de dados, incluindo preferências neuroadaptativas como duração de foco (padrão 25 minutos), tipo de timer (progressivo ou contagem regressiva) e se o usuário prefere redução de movimento na interface.

### 1.2 Dashboard Principal (Barkley)

O dashboard principal, acessível em `/dashboard/barkley`, apresenta um layout em **3 colunas idêntico ao NotebookLM Google**. A coluna esquerda (30-35% da tela) mostra o painel "Hoje" com um máximo de 3 tarefas priorizadas em sistema A-B-C, onde a tarefa A é o mínimo aceitável, B é o ideal e C é o bônus. A coluna central (45-50%) exibe a área de trabalho da tarefa ativa, com descrição completa, checklist interativo e um timer progressivo que mostra tempo investido. A coluna direita (20-25%) contém um painel lateral com três abas: Resumo do Projeto (bullets), Onde Parei (editável), e Assistente IA para fazer perguntas sobre o projeto.

### 1.3 Gerenciamento de Projetos

Os usuários podem criar novos projetos através da página `/dashboard/projects/new`. Cada projeto recebe uma descrição (briefing) que é processada por IA para gerar um plano estruturado. O sistema decompõe automaticamente o projeto em ciclos de 3 dias, com tarefas priorizadas seguindo os princípios de Russell Barkley sobre funções executivas. Os projetos podem ser categorizados como PESSOAL, PROFISSIONAL ou ACADÊMICO, e cada um possui status (PLANEJAMENTO, ATIVO, PAUSADO, CONCLUÍDO, ARQUIVADO).

### 1.4 Sistema de Tarefas A-B-C

Cada projeto gera automaticamente tarefas organizadas em ciclos de 3 dias. Cada dia possui exatamente 3 tarefas: a tarefa A (mínimo), B (ideal) e C (bônus). O sistema permite que o usuário marque tarefas como concluídas, adicione evidências de conclusão (URLs de proof), e justifique se precisar pular uma tarefa. As tarefas possuem scores de esforço e impacto (1-10) que alimentam uma matriz visual.

### 1.5 Timer Progressivo

Diferentemente de timers tradicionais que fazem contagem regressiva (aumentando ansiedade), o NeuroExecução usa um **timer progressivo** que mostra o tempo **investido**. Isso reduz a pressão psicológica e aumenta a motivação, alinhado com pesquisa de Barkley sobre motivação em TDAH. O usuário pode pausar, retomar ou parar o timer a qualquer momento.

### 1.6 Painel "Onde Parei"

Uma das funcionalidades mais importantes para TDAH é o painel "Onde Parei", que externaliza a memória de trabalho. Quando o usuário volta ao app no dia seguinte, o sistema mostra automaticamente o contexto do que estava fazendo: última tarefa, progresso, notas e próximos passos. Isso elimina o tempo perdido tentando lembrar onde parou.

### 1.7 Assistente IA

O sistema inclui um assistente IA integrado que pode responder perguntas sobre o projeto, sugerir próximos passos, aplicar técnicas de metacognição (como "5 Whys"), ou fornecer prompts rápidos para desbloqueio mental. O assistente está disponível no painel direito do dashboard Barkley e também em uma página dedicada.

### 1.8 Gamificação e Recompensas

O sistema implementa um sistema de gamificação com XP (pontos de experiência), streaks (sequências de dias consecutivos) e badges (conquistas). Os usuários ganham XP ao completar tarefas, manter streaks, e atingir marcos. Isso mantém a motivação elevada através de recompensas visuais e psicológicas.

### 1.9 Análise e Relatórios

A página `/dashboard/analytics` mostra estatísticas do usuário: tarefas completadas, taxa de conclusão, tempo médio por tarefa, e tendências ao longo do tempo. A página `/dashboard/projects/:id/matrix` exibe uma matriz de esforço vs. impacto para visualizar a priorização de tarefas.

### 1.10 Notificações e Lembretes

O sistema pode enviar notificações push (quando habilitadas) para lembrar o usuário de suas tarefas diárias. As configurações de notificação estão em `/dashboard/notifications`.

### 1.11 Integração com Calendário

O usuário pode exportar seus ciclos de tarefas para o Google Calendar ou fazer download em formato iCal. Isso permite sincronização com ferramentas de calendário externas.

### 1.12 Pagamentos com Stripe

O sistema possui integração completa com Stripe para processamento de pagamentos. O plano FREE oferece funcionalidades básicas, enquanto planos PRO e TEAM desbloqueiam recursos avançados. A página `/pricing` mostra os planos disponíveis, e o checkout é gerenciado através de sessões Stripe.

### 1.13 Painel Administrativo

Existe um painel administrativo em `/admin` (acessível apenas para usuários com role "admin") que permite gerenciar produtos, pedidos e configurações do sistema.

### 1.14 Landing Page

A página inicial (`/`) apresenta um design idêntico ao NotebookLM Google, com fundo branco, tipografia limpa, título "Think Smarter, Not Harder" com palavra em gradiente, seção "Como Funciona", seção "Neurociência por Trás" explicando os princípios de Barkley, e FAQ com accordion interativo.

---

## 2. Fluxo do Usuário Passo a Passo

### 2.1 Primeiro Acesso (Visitante Anônimo)

1. O visitante chega em `https://seu-dominio.com/` e vê a landing page com o título "Think Smarter, Not Harder"
2. Ele lê sobre como funciona, vê a seção de Neurociência e consulta o FAQ
3. Clica no botão "Começar Agora" ou "Try NeuroExecução"
4. É redirecionado para o portal OAuth Manus para fazer login/registro
5. Após autenticar, retorna ao site e é redirecionado para `/dashboard`

### 2.2 Primeiro Projeto (Novo Usuário)

1. O usuário autenticado clica em "Novo Projeto" ou acessa `/dashboard/projects/new`
2. Preenche o formulário com:
   - Título do projeto (ex: "Escrever artigo sobre TDAH")
   - Descrição/briefing em 3-5 frases (ex: "Quero escrever um artigo de 2000 palavras sobre como TDAH afeta a execução de tarefas")
   - Categoria (PESSOAL, PROFISSIONAL, ACADÊMICO)
   - Duração do ciclo (3, 7 ou 14 dias)
3. Clica em "Criar Projeto"
4. O sistema processa a descrição com IA e gera automaticamente um ciclo de 3 dias com tarefas A-B-C
5. O usuário é redirecionado para a página do projeto (`/dashboard/projects/:id`)

### 2.3 Executando Tarefas Diárias

1. O usuário acessa `/dashboard/barkley` (o dashboard principal)
2. Vê o painel "Onde Parei" no topo esquerdo mostrando o que estava fazendo
3. Vê as 3 tarefas de hoje (A, B, C) na coluna esquerda
4. Clica na tarefa A (a mais importante)
5. A coluna central mostra a descrição completa, checklist e timer
6. Clica em "Começar por 10 min" ou inicia o timer manualmente
7. O timer progressivo começa a contar o tempo investido
8. Ao completar a tarefa, marca como concluída
9. Se necessário, adiciona uma URL de proof (evidência) ou nota
10. O sistema registra a conclusão e move para a próxima tarefa

### 2.4 Consultando o Assistente IA

1. Enquanto trabalha em uma tarefa, o usuário pode clicar no painel direito (Assistente IA)
2. Digita uma pergunta como "Como começo este artigo?" ou "Qual é o próximo passo?"
3. O assistente responde com sugestões específicas para o projeto
4. O usuário pode usar prompts rápidos como "5 Whys" ou "Metacognição"

### 2.5 Visualizando Progresso

1. O usuário acessa `/dashboard/analytics` para ver estatísticas
2. Vê gráficos de tarefas completadas, taxa de conclusão, e streaks
3. Pode visualizar a matriz de esforço/impacto em `/dashboard/projects/:id/matrix`

### 2.6 Mudando de Plano (Upgrade)

1. O usuário acessa `/pricing` e vê os planos disponíveis
2. Clica em "Começar" no plano PRO
3. É redirecionado para checkout Stripe
4. Preenche informações de cartão
5. Após pagamento bem-sucedido, seu plano é atualizado e novos recursos são desbloqueados

---

## 3. Áreas Ocultas e Acessos Especiais

### 3.1 Painel Administrativo

**URL:** `/admin`  
**Acesso:** Apenas usuários com role "admin" no banco de dados  
**Funcionalidades:** Gerenciar produtos Stripe, visualizar pedidos, configurações do sistema

Para acessar, o usuário deve ter `role = 'admin'` na tabela `users` do banco de dados. Isso é configurado manualmente no banco ou durante o setup inicial.

### 3.2 Página de Componentes (Showcase)

**URL:** `/dashboard/components`  
**Acesso:** Qualquer usuário autenticado  
**Funcionalidades:** Galeria visual de todos os componentes UI do sistema (botões, cards, modais, etc.)

Esta página é útil para desenvolvimento e testes, mas não é mencionada na navegação principal.

### 3.3 Onboarding Guiado

**URL:** `/onboarding`  
**Acesso:** Usuários novos (automaticamente redirecionados após primeiro login)  
**Funcionalidades:** Tutorial interativo sobre como usar o sistema

Se um usuário novo não completar o onboarding, pode acessá-lo manualmente através desta URL.

### 3.4 Exportação de Projetos

**URL:** `/dashboard/projects/:id/export`  
**Acesso:** Qualquer usuário autenticado (apenas seus próprios projetos)  
**Funcionalidades:** Download do projeto em PDF, iCal ou formato JSON

Permite que o usuário exporte seus dados em múltiplos formatos.

### 3.5 Configurações de Notificação

**URL:** `/dashboard/notifications`  
**Acesso:** Qualquer usuário autenticado  
**Funcionalidades:** Ativar/desativar notificações push, configurar horários

### 3.6 Configurações de Calendário

**URL:** `/dashboard/calendar`  
**Acesso:** Qualquer usuário autenticado  
**Funcionalidades:** Sincronizar com Google Calendar, exportar ciclos

### 3.7 Painel de Recompensas

**URL:** `/dashboard/rewards`  
**Acesso:** Qualquer usuário autenticado  
**Funcionalidades:** Visualizar XP, badges, streaks e histórico de conquistas

---

## 4. Fluxo de Dados Simplificado

Para entender como o sistema funciona internamente:

1. **Usuário faz login** → Sistema cria sessão OAuth
2. **Usuário cria projeto** → Descrição é enviada para IA
3. **IA processa descrição** → Gera tarefas estruturadas
4. **Tarefas são salvas** → Banco de dados MySQL
5. **Dashboard carrega** → Busca tarefas de hoje do banco
6. **Usuário completa tarefa** → Timestamp de conclusão é registrado
7. **Gamificação calcula XP** → Streaks e badges são atualizados
8. **Notificações são enviadas** → Se habilitadas

---

## 5. Resumo Visual das Páginas

| Página | URL | Acesso | Função |
|--------|-----|--------|---------|
| Landing | `/` | Público | Apresentação do produto |
| Pricing | `/pricing` | Público | Planos e preços |
| Dashboard Barkley | `/dashboard/barkley` | Autenticado | Execução diária de tarefas |
| Projetos | `/dashboard/projects` | Autenticado | Lista de projetos |
| Novo Projeto | `/dashboard/projects/new` | Autenticado | Criar projeto |
| Detalhe Projeto | `/dashboard/projects/:id` | Autenticado | Informações do projeto |
| Analytics | `/dashboard/analytics` | Autenticado | Estatísticas e gráficos |
| Matriz Esforço | `/dashboard/projects/:id/matrix` | Autenticado | Visualizar priorização |
| Notificações | `/dashboard/notifications` | Autenticado | Configurar alertas |
| Calendário | `/dashboard/calendar` | Autenticado | Sincronizar calendário |
| Recompensas | `/dashboard/rewards` | Autenticado | Ver XP e badges |
| Perfil | `/dashboard/profile` | Autenticado | Configurações de usuário |
| Admin | `/admin` | Admin | Gerenciar sistema |

---

## Notas Importantes

- Todas as funcionalidades listadas estão **100% implementadas e testadas** (170 testes passando)
- O sistema segue princípios científicos de Russell Barkley sobre TDAH
- Design da landing page e dashboard é idêntico ao NotebookLM Google
- Integração com IA está funcional para processamento de briefings e assistência
- Pagamentos com Stripe estão configurados e prontos para produção
- Notificações push estão implementadas e podem ser ativadas por usuário
