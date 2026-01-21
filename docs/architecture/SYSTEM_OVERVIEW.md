# Visão Geral do Sistema - NeuroExecução (KNH4)

**Versão:** 1.0
**Data:** 21/01/2026
**Status:** Em Desenvolvimento

---

## 🎯 Propósito

O NeuroExecução é uma plataforma SaaS neuroadaptativa projetada especificamente para indivíduos com TDAH, baseada em evidências científicas de Russell Barkley, Thomas Brown e Joseph Biederman. O sistema implementa o **Sistema 3-5-X**, uma metodologia proprietária de gestão de execução.

## 🏗️ Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 18)                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │   Dashboard    │  │  Componentes   │  │   Features     │   │
│  │   Principal    │  │      IA        │  │     TDAH       │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER (REST)                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │   Auth         │  │   Projects     │  │    AI          │   │
│  │   /api/auth    │  │   /api/proj    │  │    /api/ai     │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  Controllers   │  │   Services     │  │   Middleware   │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER (PostgreSQL + Redis)              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  PostgreSQL    │  │     Redis      │  │   Cloudinary   │   │
│  │  (Persistence) │  │    (Cache)     │  │    (Assets)    │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SERVIÇOS EXTERNOS (Integrações)                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │   Anthropic    │  │    Vercel      │  │    Railway     │   │
│  │  Claude AI     │  │   (Frontend)   │  │   (Backend)    │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔑 Componentes Principais

### 1. Frontend (React 18)

**Responsabilidades:**
- Interface do usuário neuroadaptativa
- Gestão de estado com Context API / Zustand
- Cache de dados com React Query
- Componentes acessíveis (WCAG 2.1 AA)

**Principais Módulos:**
- **Dashboard:** Visão geral 3 colunas (Sidebar Left, Main, Weekly Overview)
- **TeamPanel:** 8 personas C-Level virtuais
- **PromptLibrary:** 22+ prompts estruturados
- **AI Chat:** Integração com Claude Sonnet 4.5
- **TDAH Features:** Timer Progressivo, "Onde Parei", Divisão A/R/M

### 2. Backend (Node.js + Express)

**Responsabilidades:**
- API RESTful para operações CRUD
- Autenticação e autorização (JWT)
- Lógica de negócio
- Integração com serviços externos

**Principais Endpoints:**
- `/api/auth/*` - Autenticação e registro
- `/api/projects/*` - Gestão de projetos
- `/api/tasks/*` - Gestão de tarefas
- `/api/ai/*` - Interações com IA
- `/api/exports/*` - Geração de documentos

### 3. Database (PostgreSQL)

**Responsabilidades:**
- Persistência de dados estruturados
- Transações ACID
- Relacionamentos complexos

**Principais Tabelas:**
- `users` - Usuários do sistema
- `projects` - Projetos ativos
- `tasks` - Tarefas com sistema A-B-C
- `prompts` - Biblioteca de prompts
- `personas` - Configuração C-Level
- `activity_logs` - Log de ações ("Onde Parei")

### 4. Cache Layer (Redis)

**Responsabilidades:**
- Cache de sessões
- Cache de respostas IA
- Rate limiting
- Pub/Sub para notificações

**Principais Keys:**
- `session:{userId}` - Sessões ativas
- `ai:response:{promptHash}` - Respostas IA cacheadas
- `ratelimit:{userId}:{endpoint}` - Controle de taxa

### 5. AI Integration (Anthropic Claude)

**Responsabilidades:**
- Conversação contextualizada com personas
- Execução de prompts estruturados
- Geração de insights e sugestões
- Validação de features (Coeficiente CV)

**Configuração:**
- Model: `claude-sonnet-4-5-20250514`
- Max tokens: 1000 (ajustável)
- Temperatura: 0.7
- System prompts por persona

## 🔄 Fluxos Principais

### Fluxo 1: Criação de Projeto

```
1. Usuário clica em "Novo Ciclo" (Dashboard)
2. Modal de criação abre (Onboarding wizard)
3. Preenche nome, objetivo, prazo
4. Sistema cria projeto no DB
5. Gera 3 tarefas iniciais (A/B/C)
6. Atualiza dashboard em tempo real
7. Inicia timer progressivo
```

### Fluxo 2: Consulta a Persona C-Level

```
1. Usuário clica em card de persona (TeamPanel)
2. Carrega contexto da persona (KPIs, expertise)
3. Abre chat com IA
4. Usuário envia pergunta
5. Sistema monta system prompt + contexto do projeto
6. Envia para Anthropic API
7. Recebe resposta formatada
8. Exibe com markdown support
9. Salva interação no histórico
```

### Fluxo 3: Timer Progressivo (TDAH)

```
1. Usuário inicia timer no painel de tarefas
2. Timer count-up começa (00:00:00)
3. A cada 1 segundo, incrementa
4. Cor verde (#7ED957) para reforço positivo
5. Usuário pode pausar/retomar com um clique
6. Estado persiste se fechar aba (localStorage)
7. Ao finalizar, salva tempo trabalhado
```

### Fluxo 4: Recuperação de Contexto ("Onde Parei")

```
1. Sistema salva ação a cada 30 segundos
2. Armazena em activity_logs (timestamp, action, context)
3. Ao abrir dashboard, carrega últimas 3 ações
4. Exibe com timestamp relativo ("há 2 horas")
5. Botão "Retomar" restaura estado completo
6. Navega para contexto exato (projeto, tarefa)
```

## 📊 Métricas de Performance

**Frontend:**
- Lighthouse Score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Bundle size (gzipped) < 200KB

**Backend:**
- P95 Latency < 200ms
- Throughput > 1000 req/s
- Error rate < 0.1%
- Uptime > 99.5%

**Database:**
- Query time P95 < 50ms
- Connection pool: 10-20 conexões
- Índices em todos os foreign keys

**AI:**
- Response time P95 < 3s
- Custo por usuário < R$0.10/mês
- Cache hit rate > 40%

## 🔒 Segurança

**Autenticação:**
- JWT tokens com expiração 24h
- Refresh tokens com expiração 30d
- Senha hasheada com bcrypt (10 rounds)

**Autorização:**
- RBAC (Role-Based Access Control)
- Roles: `free`, `pro`, `enterprise`
- Middleware de verificação em todas as rotas protegidas

**LGPD:**
- Consentimento explícito para dados sensíveis
- Direito ao esquecimento (delete account)
- Exportação de dados (download JSON)
- Logs de acesso auditáveis

## 🚀 Deployment

**Frontend (Vercel):**
- Build automático no push para `main`
- Preview deployments em PRs
- Edge caching global
- Serverless functions para API routes

**Backend (Railway):**
- Container Docker
- Auto-scaling baseado em CPU
- Health checks a cada 30s
- Rollback automático em falhas

**Database (Railway):**
- PostgreSQL 15
- Backups diários automáticos
- Point-in-time recovery (7 dias)
- Replicação para read replicas

## 📈 Roadmap de Escalabilidade

**Fase 1: MVP (100 usuários)**
- Monolito Node.js
- PostgreSQL single instance
- Redis single instance

**Fase 2: Growth (1K usuários)**
- Separação Frontend/Backend
- PostgreSQL com read replicas
- Redis cluster (3 nodes)
- CDN para assets estáticos

**Fase 3: Scale (10K usuários)**
- Microserviços (Auth, Projects, AI)
- PostgreSQL sharding por usuário
- Redis cluster (6 nodes)
- Load balancer (Nginx)
- Queue system (BullMQ)

## 🧪 Testing Strategy

**Unit Tests (Jest):**
- Coverage > 80% para lógica crítica
- Todos os utils e hooks
- Componentes isolados

**Integration Tests (Playwright):**
- Fluxos principais E2E
- Autenticação completa
- Criação de projeto + tarefas
- Consulta a persona

**Performance Tests (k6):**
- Load testing (1000 users simultâneos)
- Stress testing (até falha)
- Spike testing (picos repentinos)

## 📝 Documentação

**Código:**
- JSDoc para funções públicas
- TypeScript types explícitos
- README em cada módulo

**API:**
- Swagger/OpenAPI 3.0
- Exemplos de requisição/resposta
- Error codes documentados

**Usuário:**
- Guia de início rápido
- FAQ científico (Barkley/Brown)
- Vídeos tutoriais

---

**Próximas Atualizações:**
- Integração com calendários (Google, Outlook)
- Modo offline com sync
- Mobile apps (iOS, Android)
- Gamificação (XP, badges)
