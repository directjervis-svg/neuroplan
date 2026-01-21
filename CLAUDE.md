# NeuroExecução - Plataforma Neuroadaptativa

## Quick Commands
- `npm run dev` - Inicia servidor desenvolvimento
- `npm run test` - Executa suite de testes
- `npm run lint` - ESLint check
- `npm run build` - Build de produção
- `npm run typecheck` - TypeScript validation

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Drizzle ORM
- **AI**: Anthropic Claude Sonnet 4.5
- **Database**: PostgreSQL + Redis cache
- **Deployment**: Vercel (frontend) + Railway (backend)

## Key Directories
- `src/components/dashboard/` - Componentes principais UI
- `src/components/ai/` - Sistema de chat e prompts
- `src/components/tdah/` - Features neuroadaptativas
- `docs/prompts/` - 22+ prompts estruturados
- `docs/scientific/` - Base científica TDAH

## Standards Críticos

### Design System (Matriz Crextio)
**Cores Primárias:**
- `#FFD400` - CTA principal (amarelo vibrante)
- `#FFC738` - Hover/destaque (amarelo médio)
- `#000000` - Contraste forte (preto)
- `#1A1A1A` - Texto principal (preto suave)

**Backgrounds:**
- `#F8F6F1` - Fundo geral da aplicação (bege claro)
- `#FFFFFF` - Cards e containers
- `#FFFBF2` - Hover states
- `#FFF9E6` - Estados selecionados

**Texto:**
- `#1A1A1A` - Texto principal
- `#6B6B6B` - Texto secundário
- `#A8A8A8` - Texto hint/disabled

**Semantic Colors:**
- `#7ED957` - Sucesso/progresso (verde limão)
- `#FF6B6B` - Erro/alerta (vermelho suave)
- `#5B9BFF` - Informação (azul médio)

**Borders & Shadows:**
- `#E8E5DD` - Bordas sutis
- `#D4D1C7` - Bordas visíveis
- Shadow máximo: `rgba(0, 0, 0, 0.16)`

**Tipografia:**
- Font: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Tamanho mínimo: 16px
- Line-height: 1.6
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

**Border Radius:**
- Small: 12px
- Medium: 16px
- Large: 24px
- Full: 9999px (círculos)

**Shadows:**
- `--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06)`
- `--shadow-md: 0 8px 32px rgba(0, 0, 0, 0.08)`
- `--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.12)`
- `--shadow-xl: 0 24px 64px rgba(0, 0, 0, 0.16)`

### Princípios TDAH (Base Científica)

**Russell Barkley - Temporal Myopia:**
- ✅ Máximo 3 tarefas simultâneas
- ✅ Timer progressivo (count-up), nunca countdown
- ✅ Tudo externalizado, zero dependência de memória
- ✅ Feedback imediato < 200ms

**Thomas Brown - 6 Clusters:**
1. **Ativação:** Sistema de início rápido (botão "START FOCUS")
2. **Foco:** Distração zero, progressive disclosure
3. **Esforço:** Divisão Ação/Retenção/Manutenção
4. **Emoção:** Cores suaves, sem urgência visual
5. **Memória:** Painel "Onde Parei" sempre visível
6. **Ação:** Checkboxes grandes (44px mínimo)

**DUA - Universal Design for Learning:**
- Multiple means of representation
- Multiple means of action/expression
- Multiple means of engagement

**Regras de Ouro:**
1. Máximo 3 tarefas por dia
2. Timer sempre count-up (nunca countdown)
3. Última ação salva a cada 30 segundos
4. Feedback visual instantâneo (< 200ms)
5. Zero notificações agressivas
6. Botões mínimo 44x44px (touch-friendly)

### Code Quality

**TypeScript:**
- Props sempre tipadas
- Evitar `any`, usar `unknown` quando necessário
- Interfaces para componentes públicos
- Types para utilitários internos

**React:**
- Componentes < 300 linhas
- Funções < 50 linhas
- Hooks customizados para lógica reutilizável
- Memoization apenas quando medido ganho de performance

**CSS/Tailwind:**
- Design tokens no `tokens.css`
- Evitar inline styles diretos
- Classes utilitárias personalizadas no `utilities.css`
- Mobile-first (design para 375px primeiro)

**Testes:**
- Cobertura mínima 80% para lógica crítica
- Testes unitários para hooks e utils
- Testes de integração para fluxos principais
- Axe-core para validação de acessibilidade

**Performance:**
- Lighthouse Score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lazy loading para componentes pesados
- Code splitting por rota

## Personas C-Level Disponíveis

### CTO - Chief Technology Officer
**Missão:** Escalar arquitetura sem explodir custos
**Expertise:** serverless, microservices, edge computing, custos cloud
**Tom:** Pragmático, hands-on, data-driven
**KPIs 90 dias:**
- Uptime 99.9%
- P95 latency < 200ms
- Custo AI < R$0.10/usuário/mês

### CPO - Chief Product Officer
**Missão:** Validar features com base científica
**Expertise:** user research, psicologia TDAH, priorização (RICE)
**Tom:** Empático, baseado em evidências
**KPIs 90 dias:**
- Retenção D30 > 25%
- NPS > 50
- Feature adoption > 40%

### CAIO - Chief AI Officer
**Missão:** Otimizar prompts e reduzir custos LLM
**Expertise:** prompt engineering, RAG, fine-tuning, caching
**Tom:** Técnico, experimental, cost-aware
**KPIs 90 dias:**
- Token usage -30%
- Relevância respostas > 85%
- Custo por query < R$0.05

### CMO - Chief Marketing Officer
**Missão:** Growth orgânico via SEO e conteúdo
**Expertise:** content marketing, SEO técnico, community building
**Tom:** Criativo, analytical, long-term thinker
**KPIs 90 dias:**
- Tráfego orgânico +150%
- Conversão landing page 12%
- 500+ waitlist

### CFO - Chief Financial Officer
**Missão:** Unit economics sustentáveis
**Expertise:** SaaS metrics, fundraising, pricing strategy
**Tom:** Conservador, números-driven
**KPIs 90 dias:**
- CAC < R$200
- LTV/CAC > 3
- Burn rate -20%

### CSO - Chief Sales Officer
**Missão:** Escalar vendas B2B2C
**Expertise:** enterprise sales, parcerias institucionais, playbooks
**Tom:** Persuasivo, relationship-focused
**KPIs 90 dias:**
- 3 parcerias fechadas
- Pipeline R$500K
- Ticket médio B2B R$5K

### CCO - Chief Customer Officer
**Missão:** Retenção e satisfação de usuários
**Expertise:** onboarding, customer success, churn prevention
**Tom:** Empático, proativo, data-informed
**KPIs 90 dias:**
- Churn < 6%
- CSAT > 4.5/5
- Time to value < 10min

### CLO - Chief Legal Officer
**Missão:** Compliance LGPD e proteção IP
**Expertise:** LGPD, propriedade intelectual, contratos SaaS
**Tom:** Cauteloso, detalhista, protetor
**KPIs 90 dias:**
- 100% LGPD compliance
- Termos + Privacidade publicados
- Zero incidentes de dados

**Como consultar:**
"Preciso falar com o [SIGLA]" - ativa contexto especializado

## Validação de Features

### Coeficiente de Validação (CV)
Toda nova feature deve passar pelo CV antes de implementação.

**7 Variáveis (Pesos):**
1. **V1 - Dores TDAH (25%):** Score 0-10 de aderência às dores reais
2. **V2 - Base Científica (20%):** Validação Barkley/Brown/Biederman
3. **V3 - Volume de Busca (15%):** Demanda mensurada (Google Trends, etc)
4. **V4 - Gap de Mercado (15%):** Inexistência em concorrentes
5. **V5 - Viabilidade Técnica (10%):** Esforço dev vs complexidade
6. **V6 - Fit com Personas (10%):** Alinhamento com 8 C-Levels
7. **V7 - Potencial Monetização (5%):** Impacto no LTV

**Fórmula:**
```
CV = (V1 × 0.25) + (V2 × 0.20) + (V3 × 0.15) + (V4 × 0.15) + (V5 × 0.10) + (V6 × 0.10) + (V7 × 0.05)
```

**Decisão:**
- **CV ≥ 7.0:** PRIORIZAR (incluir no roadmap imediato)
- **5.0 ≤ CV < 7.0:** REFINAR (validar melhor antes de implementar)
- **CV < 5.0:** DESCARTAR (não vale o investimento)

**Exemplo de Uso:**
```
Feature: "Timer Pomodoro com gamificação"

V1 = 9 (Barkley: gestão temporal crítica)
V2 = 8 (Estudos comprovam eficácia)
V3 = 7 (Alto volume de busca "pomodoro TDAH")
V4 = 3 (Todos concorrentes têm)
V5 = 9 (Simples implementar)
V6 = 7 (Fit com CPO, CCO)
V7 = 4 (Não diferencia pricing)

CV = (9×0.25) + (8×0.20) + (7×0.15) + (3×0.15) + (9×0.10) + (7×0.10) + (4×0.05)
CV = 2.25 + 1.60 + 1.05 + 0.45 + 0.90 + 0.70 + 0.20 = 7.15

DECISÃO: PRIORIZAR ✅
```

## Performance Targets

**Lighthouse Metrics:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Custom Metrics:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle size (gzipped): < 200KB
- Custo AI por usuário: < R$0.10/mês
- Uptime: > 99.5%

## Dependency Management

**Node/NPM:**
- `npm install [package]` - Adiciona dependência
- `npm run dev` - Ambiente de desenvolvimento
- `npm run build` - Build de produção

**Python (se backend Python):**
- `uv add package` - Adiciona dependência
- `uv run script.py` - Executa com ambiente correto
- `uv sync` - Sincroniza ambiente

## Important Notes

### ⚠️ Restrições Críticas
- **NUNCA** use `localStorage`/`sessionStorage` em artifacts
- **SEMPRE** use React state para dados temporários
- **NUNCA** crie arquivos markdown (.md) a menos que explicitamente solicitado
- **SEMPRE** prefira editar arquivos existentes a criar novos

### 🎨 Design Patterns
- **Progressive enhancement:** funciona sem JS
- **Mobile-first:** design para 375px primeiro, depois desktop
- **Acessibilidade:** contrast ratio mínimo 4.5:1
- **Touch targets:** mínimo 44x44px para interativos
- **Hover states:** sempre translateY(-2px) + shadow aumentado

### 🔄 Estado e Persistência
- Estado global: Context API ou Zustand
- Cache local: React Query para dados server
- Persistência: Backend API + PostgreSQL
- Uploads: Cloudinary ou similar

### 🧪 Testing Strategy
- **Unit:** Jest + Testing Library
- **Integration:** Playwright
- **E2E:** Cypress (fluxos críticos)
- **Accessibility:** axe-core + manual testing
- **Visual:** Percy ou Chromatic

### 📦 Estrutura de Componentes

**Hierarquia de Pastas:**
```
src/components/
├── dashboard/          # Páginas principais
│   ├── TeamPanel.tsx
│   ├── PromptLibrary.tsx
│   ├── DailyTasks.tsx
│   └── WeeklyOverview.tsx
├── ai/                 # IA e prompts
│   ├── PersonaChat.tsx
│   └── PromptExecutor.tsx
├── tdah/               # Features neuroadaptativas
│   ├── ProgressiveTimer.tsx
│   ├── WhereILeftOff.tsx
│   └── TaskEffortDivider.tsx
└── shared/             # Componentes base
    ├── Button.tsx
    ├── Card.tsx
    └── Input.tsx
```

**Convenções de Nomenclatura:**
- Componentes: PascalCase (e.g., `TeamPanel.tsx`)
- Hooks: camelCase com prefixo `use` (e.g., `usePersona.ts`)
- Utils: camelCase (e.g., `validation.ts`)
- Tipos: PascalCase (e.g., `CLevelPersona`)

### 🚀 Deploy Workflow

**Staging:**
1. Push para branch `staging`
2. CI/CD executa testes
3. Deploy automático para staging.neuroexecucao.com
4. Smoke tests automatizados

**Production:**
1. Merge para `main`
2. CI/CD completo (tests + build + security scan)
3. Deploy automático para neuroexecucao.com
4. Health checks pós-deploy
5. Rollback automático se falhar

### 📊 Monitoramento

**Métricas Técnicas:**
- Sentry: Error tracking
- LogRocket: Session replay
- Vercel Analytics: Performance
- PostHog: Product analytics

**Métricas de Negócio:**
- Amplitude: Funnels de conversão
- Stripe: Receita e churn
- Google Analytics: Tráfego e comportamento

## Contato e Suporte

**Para dúvidas sobre implementação:**
- **Questões Técnicas (Arquitetura, Stack):** Ativar persona CTO
- **Questões de Produto (Features, UX):** Ativar persona CPO
- **Questões de AI (Prompts, Custos):** Ativar persona CAIO
- **Validação Científica:** Consultar `docs/scientific/`
- **Design e UI:** Consultar `REFERENCIAS_DESIGN_KNH4.md`

---

**Versão:** 1.0
**Última atualização:** 21/01/2026
**Status:** ✅ Ativo
