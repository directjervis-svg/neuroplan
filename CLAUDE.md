# NeuroExecução - Plataforma Neuroadaptativa

## Quick Commands

```bash
pnpm dev          # Inicia servidor desenvolvimento
pnpm test         # Executa suite de testes
pnpm check        # TypeScript check
pnpm build        # Build de produção
pnpm db:push      # Aplica migrações
```

## Tech Stack

- **Frontend:** React 19, TypeScript, TailwindCSS 4, Radix UI
- **Backend:** Node.js/Express + tRPC + Python/FastAPI (AI Services)
- **AI:** Anthropic Claude (Sonnet 4.5) + OpenAI (decomposição)
- **Database:** MySQL + Drizzle ORM
- **Cache:** Upstash Redis
- **Deployment:** Hostinger VPS

## Key Directories

```
client/src/components/   # Componentes React principais
client/src/pages/        # Páginas e rotas
server/                  # Backend tRPC
backend/                 # Python FastAPI (AI/Intelligence)
docs/                    # Base científica e prompts
drizzle/                 # Schema e migrações
```

## Standards Críticos

### Design System (Matriz Crextio)

```css
/* Cores Primárias */
--amarelo-cta: #FFD400      /* CTAs, foco */
--amarelo-medio: #FFC738    /* Highlights */
--bege-base: #F8F6F1        /* Background */
--preto-principal: #000000  /* Texto, contraste */

/* Semânticas */
--verde-sucesso: #7ED957    /* Completude */
--vermelho-alerta: #FF6B6B  /* Erros (uso mínimo) */

/* Layout */
--radius-small: 12px
--radius-medium: 16px
--radius-large: 24px
--shadow-max: rgba(0,0,0,0.16)
```

### Tipografia

- Font: Inter, min 16px, line-height 1.6
- Hierarquia: 48px (h1) → 32px (h2) → 24px (h3) → 16px (body)

### Princípios TDAH (Barkley/Brown)

1. **Máximo 3 tarefas simultâneas** - Reduz paralisia
2. **Timer progressivo, não countdown** - Reduz ansiedade
3. **Tudo externalizado, zero memória** - Working memory fraca
4. **Progressive disclosure** - Ocultar para revelar
5. **Feedback imediato < 200ms** - Recompensa instantânea
6. **Ciclos de 3 dias** - Miopia temporal

### Code Quality

- Type hints obrigatórios (Python)
- Props tipadas (TypeScript)
- Testes para features críticas
- Componentes < 300 linhas
- Funções < 50 linhas

## Personas C-Level

Sistema de 8 especialistas virtuais para consulta:

| Persona | Especialidade | Ativar com |
|---------|---------------|------------|
| **CTO** | Arquitetura, custos AI, escala | "Falar com CTO" |
| **CPO** | Priorização, validação científica | "Falar com CPO" |
| **CAIO** | Prompts, RAG, otimização AI | "Falar com CAIO" |
| **CMO** | Growth orgânico, conteúdo | "Falar com CMO" |
| **CFO** | Unit economics, fundraising | "Falar com CFO" |
| **CSO** | B2B2C, parcerias, vendas | "Falar com CSO" |
| **CCO** | Retenção, onboarding, NPS | "Falar com CCO" |
| **CLO** | LGPD, IP, compliance | "Falar com CLO" |

## Validação de Features

Toda nova feature passa pelo **Coeficiente de Validação (CV)**:

| Variável | Peso | Descrição |
|----------|------|-----------|
| V1 | 25% | Dores TDAH |
| V2 | 20% | Base Científica |
| V3 | 15% | Volume de Busca |
| V4 | 15% | Gap de Mercado |
| V5 | 10% | Viabilidade Técnica |
| V6 | 10% | Fit com Personas |
| V7 | 5% | Potencial Monetização |

**Score:** >= 7.0 Priorizar | 5.0-6.9 Refinar | < 5.0 Descartar

## Performance Targets

| Métrica | Target |
|---------|--------|
| Lighthouse Score | > 90 |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.5s |
| Custo AI por usuário | < R$0.10/mês |
| Uptime | > 99.5% |

## Base Científica

### Russell A. Barkley, PhD
- Modelo: Déficits de autorregulação
- Aplicação: Ciclos 3 dias, externalização, recompensas imediatas

### Thomas E. Brown, PhD
- Modelo: 6 clusters funções executivas
- Aplicação: Ativação (10min), Divisão Ação/Retenção/Manutenção

### Joseph Biederman, MD
- Modelo: Comorbidades e tratamento
- Aplicação: Timer progressivo (ansiedade), gamificação ética

## Important Notes

- NUNCA use localStorage em artifacts (use React state)
- Progressive enhancement: funciona sem JS
- Mobile-first: design para 375px primeiro
- Acessibilidade: contrast ratio mínimo 4.5:1
- Offline-first: Dexie.js para cache local

## API Endpoints

```
/api/trpc/*           # tRPC endpoints
/api/ai/personas      # C-Level personas
/api/ai/prompts       # Prompt library
/api/ai/validate      # CV validation
/api/ai/chat          # Contextual chat
/health               # Health check
```
