# ROADMAP DE IMPLEMENTAÇÃO: NEUROEXECUÇÃO

**Base:** Auditoria Técnica (21/01/2026) e KNH4 Master Blueprint
**Objetivo:** Estruturar as próximas fases de desenvolvimento, priorizando a estabilidade do backend e a conclusão das funcionalidades P0 (Lançamento).

---

## 1. FASE DE ESTABILIZAÇÃO (Prioridade: ALTA)

Esta fase foca em resolver os débitos técnicos e garantir a conformidade total com o **Guia Avançado Manus** para segurança e economia de créditos.

| ID | Tarefa | Objetivo | Prioridade | Arquivos Envolvidos |
| :--- | :--- | :--- | :--- | :--- |
| **S-1** | **Finalizar Log de Créditos** | Persistir o uso de tokens de IA no banco de dados para monitoramento de custos. | **Alta** | `server/middleware/creditMonitor.ts`, `server/db.ts` |
| **S-2** | **Finalizar Agentes de Validação** | Implementar a lógica real para `validateCycle` e `diagnoseBlocker` (Agentes 4 e 5). | **Alta** | `server/_core/ai-agents.ts` |
| **S-3** | **Corrigir Lógica de Dia Atual** | Ajustar a função `getTodayTasks` para calcular o dia do ciclo corretamente (D1, D2, D3) com base na data de início do projeto. | **Alta** | `server/db.ts`, `server/cycles.ts` |
| **S-4** | **Implementar Quick Ideas** | Criar o router e o componente para a funcionalidade de captura de ideias (pendência do `todo.md`). | **Alta** | `server/quickIdeas.ts`, `client/src/components/QuickIdeasPanel.tsx` |

---

## 2. FASE DE LANÇAMENTO (Prioridade: MÉDIA)

Esta fase foca em finalizar as pendências de UI/UX e SEO para um lançamento profissional.

| ID | Tarefa | Objetivo | Prioridade | Arquivos Envolvidos |
| :--- | :--- | :--- | :--- | :--- |
| **L-1** | **Finalizar SEO Técnico** | Adicionar meta tags, Open Graph e JSON-LD para melhor indexação e compartilhamento. | **Média** | `client/index.html`, `client/src/components/SEO.tsx` |
| **L-2** | **Barra de Progresso Permanente** | Criar o componente `ProgressHeader` e integrá-lo ao layout principal. | **Média** | `client/src/components/ProgressHeader.tsx`, `client/src/App.tsx` |
| **L-3** | **Testes de Streaks e Lembretes** | Finalizar a integração do Service Worker para notificações e validar a lógica de quebra de streak. | **Média** | `server/reminders.ts`, `server/streaks.ts`, `client/src/service-worker.ts` |

---

## 3. FASE DE EXPANSÃO (Baseado no KNH4 Master Blueprint)

Esta fase alinha o desenvolvimento futuro com o **KNH4 Master Blueprint** que você forneceu.

| ID | Tarefa (Blueprint) | Módulo | Prioridade |
| :--- | :--- | :--- | :--- |
| **E-1** | **Sistema 3-5-X Adaptativo (V2)** | 1.1.1 PRODUCT | **Baixa** |
| **E-2** | **Sistema A-B-C de Entregáveis** | 1.1.2 PRODUCT | **Baixa** |
| **E-3** | **Export de PDFs Executivos** | 1.1.5 PRODUCT | **Baixa** |
| **E-4** | **Cursos Neuroadaptados** | 1.2.1 EDUCAÇÃO | **Baixa** |

---

## 4. Próximos Passos Imediatos

Sugiro que comecemos pela **Fase de Estabilização**, seguindo a ordem de prioridade:

**Ação Imediata:** Implementar a correção do Log de Créditos (S-1).

**Prompt Estruturado para o Manus:**
> "Com base no Guia Avançado Manus, implemente a persistência do log de créditos. No arquivo `server/middleware/creditMonitor.ts`, conecte a função `logCreditUsage` à tabela `aiInteractionLog` no banco de dados. Garanta que o `userId`, `endpoint`, `creditsUsed` e `timeMs` sejam salvos corretamente."

**Deseja que eu inicie a implementação do Passo S-1 agora, mantendo o código em *staging* (sem commit), ou prefere que eu apenas entregue este Roadmap?**
