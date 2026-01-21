# Documentação Final: Projeto NeuroExecução (Full-Stack MECE)

Este documento descreve a arquitetura completa do sistema **NeuroExecução**, estruturado sob o princípio **MECE** (Mutually Exclusive, Collectively Exhaustive) para garantir clareza técnica e funcional.

---

## 1. Arquitetura de Backend (Lógica e Dados)

### 1.1. Motor de Inteligência Artificial (Multi-Agent)
*   **Agente Planner Barkley:** Orquestrador principal que transforma briefings em ciclos de 3 dias.
*   **Análise de Charter:** Validação de objetivos no formato SMART.
*   **Decomposição WBS:** Quebra de projetos em entregas e tarefas acionáveis.
*   **Validação de Ciclo:** IA que analisa a viabilidade do plano gerado (Score 0-100%).
*   **Diagnóstico de Bloqueios:** Agente socrático para ajudar o usuário a destravar tarefas.

### 1.2. Infraestrutura e Performance
*   **Cache Agressivo (Upstash/Redis):** Armazenamento de respostas de IA para redução de custos (até 95% de economia).
*   **Monitoramento de Créditos:** Middleware em tempo real que loga o custo de cada interação no banco de dados.
*   **Rate Limiting:** Proteção contra abusos baseada no plano do usuário (Free, Pro, Team).
*   **Persistência de Dados:** Drizzle ORM com MySQL, garantindo consultas rápidas e seguras (Anti-SQLi).

---

## 2. Interface do Usuário (Frontend e UX)

### 2.1. Design System NeuroFlow v2.0
*   **Cromoterapia ADHD-Safe:** Paleta focada em Laranja (Ação) e Azul (Foco), eliminando o azul puro para evitar fadiga visual.
*   **Animações Neuroadaptativas:** Transições suaves e feedbacks visuais ≤ 200ms para manter o engajamento sem sobrecarga.
*   **Componentes de Progresso:** `ProgressCircle` e `ProgressHeader` para feedback visual constante da "Miopia Temporal".

### 2.2. Fluxos de Experiência (UX)
*   **Landing Page Premium:** Focada em conversão com Hero animado e prova social baseada em ciência.
*   **Dashboard Barkley:** Layout minimalista que prioriza o "Hoje" e o "Onde Parei".
*   **Quick Ideas Panel:** Captura rápida de pensamentos não-lineares para evitar perda de foco.
*   **Onboarding Guiado:** Modal de 3 passos para configuração inicial do perfil cognitivo.

---

## 3. Integrações e Ecossistema

### 3.1. Serviços Externos
*   **Stripe API:** Gestão completa de assinaturas, planos e webhooks de pagamento.
*   **Google Calendar:** Sincronização de tarefas e prazos para externalização do tempo.
*   **Manus Auth (OAuth):** Sistema de autenticação seguro e persistente.

### 3.2. Notificações e Retenção
*   **Service Worker (PWA):** Infraestrutura para notificações push e funcionamento offline básico.
*   **Sistema de Streaks:** Gamificação baseada em consistência para reforço positivo.
*   **Lembretes Inteligentes:** Notificações baseadas no horário de maior foco do usuário.

---

## 4. Governança e Deploy

### 4.1. Ciclo de Vida do Código
*   **Deploy Automático:** Integração contínua via GitHub conectada diretamente ao painel do Manus.
*   **Ambiente de Staging:** Configuração de variáveis de ambiente (`.env`) isoladas para produção e teste.
*   **Auditoria Técnica:** Relatórios de segurança e performance gerados pré-lançamento.

### 4.2. Conformidade e Segurança
*   **LGPD/GDPR:** Sistema de consentimento de dados e termos de privacidade integrados.
*   **Validação Zod:** Tipagem rigorosa de ponta a ponta (Full-stack Type Safety).
*   **Segredos (Secrets):** Gestão centralizada de chaves de API no cofre do Manus.

---
**Status Final:** Projeto Estável | **Versão:** 2.0.0 | **Pronto para Lançamento Oficial.**
