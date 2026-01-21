# API Integration - NeuroExecução (KNH4)

**Versão:** 1.0
**Data:** 21/01/2026

---

## 🤖 Anthropic Claude Integration

### Overview

O NeuroExecução utiliza a API da Anthropic para alimentar suas funcionalidades de IA, incluindo:
- Chat contextualizado com 8 personas C-Level
- Execução de 22+ prompts estruturados
- Geração de insights e sugestões
- Validação de features (Coeficiente de Validação)

### Configuration

**Model:** `claude-sonnet-4-5-20250514`
**Base URL:** `https://api.anthropic.com/v1/messages`
**API Version:** `2023-06-01`

### Authentication

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

**Environment Variables:**
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
ANTHROPIC_MODEL=claude-sonnet-4-5-20250514
ANTHROPIC_MAX_TOKENS=1000
ANTHROPIC_TEMPERATURE=0.7
```

---

## 📡 Core Functions

### 1. Consulta a Persona C-Level

**Function:** `consultPersona()`

```typescript
import { CLevelPersona, ProjectContext } from '@/types';

async function consultPersona(
  personaId: string,
  userMessage: string,
  projectContext: ProjectContext
): Promise<string> {
  const persona = getPersonaById(personaId);

  // Montar system prompt contextualizado
  const systemPrompt = `
[CONTEXTO INTERNO]
Você é o ${persona.name} (${persona.label}) do NeuroExecução.
Sua missão: ${persona.mission}
Expertise prioritária: ${persona.expertise.join(', ')}
Tom de comunicação: ${persona.tone}
KPIs de foco (90 dias): ${persona.kpis.join(', ')}

[CONTEXTO DO PROJETO]
Projeto: ${projectContext.name}
Fase atual: ${projectContext.phase}
Tarefas ativas: ${projectContext.activeTasks.length}
Último checkpoint: ${projectContext.lastCheckpoint}
Progresso geral: ${projectContext.progress}%

[INSTRUÇÕES]
1. Responda como ${persona.name}, mantendo o tom ${persona.tone}
2. Priorize insights relacionados à sua expertise
3. Sempre que possível, mencione KPIs relevantes
4. Seja conciso mas acionável (máximo 3 parágrafos)
5. Evite jargões desnecessários (usuário tem TDAH)
`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ],
  });

  // Processar múltiplos content blocks
  const fullResponse = response.content
    .map(item => (item.type === 'text' ? item.text : ''))
    .filter(Boolean)
    .join('\n');

  return fullResponse;
}
```

**Usage:**
```typescript
const response = await consultPersona(
  'cto',
  'Como posso reduzir custos de infraestrutura?',
  currentProject
);
```

---

### 2. Execução de Prompt Estruturado

**Function:** `executePrompt()`

```typescript
import { Prompt } from '@/types';

async function executePrompt(
  prompt: Prompt,
  variables: Record<string, string>
): Promise<string> {
  // Substituir variáveis no template
  let content = prompt.content;
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 2000, // Prompts estruturados podem ser mais longos
    temperature: 0.5, // Mais determinístico para prompts
    messages: [
      { role: 'user', content }
    ],
  });

  const fullResponse = response.content
    .map(item => (item.type === 'text' ? item.text : ''))
    .join('\n');

  return fullResponse;
}
```

**Example Prompt (VAL-001):**
```markdown
# Coeficiente de Validação

Avalie a seguinte feature para o NeuroExecução:

**Feature:** {{featureName}}
**Descrição:** {{featureDescription}}
**Público-alvo:** {{targetAudience}}

Pontue de 0-10 cada variável:

1. **V1 - Dores TDAH (25%):** Aderência às dores reais
2. **V2 - Base Científica (20%):** Validação Barkley/Brown
3. **V3 - Volume de Busca (15%):** Demanda mensurada
4. **V4 - Gap de Mercado (15%):** Inexistência em concorrentes
5. **V5 - Viabilidade Técnica (10%):** Esforço dev vs complexidade
6. **V6 - Fit com Personas (10%):** Alinhamento C-Level
7. **V7 - Potencial Monetização (5%):** Impacto no LTV

Retorne em formato JSON:
{
  "v1": <score>,
  "v2": <score>,
  "v3": <score>,
  "v4": <score>,
  "v5": <score>,
  "v6": <score>,
  "v7": <score>,
  "total_cv": <weighted_average>,
  "recommendation": "PRIORITIZE" | "REFINE" | "DISCARD",
  "reasoning": "<justificativa_detalhada>"
}
```

---

### 3. Streaming Response (Futuro)

**Function:** `streamPersonaResponse()`

```typescript
async function* streamPersonaResponse(
  personaId: string,
  userMessage: string,
  projectContext: ProjectContext
): AsyncGenerator<string> {
  const persona = getPersonaById(personaId);
  const systemPrompt = buildSystemPrompt(persona, projectContext);

  const stream = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    stream: true,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}
```

**Usage (React):**
```typescript
const [response, setResponse] = useState('');

const handleStream = async () => {
  for await (const chunk of streamPersonaResponse('cpo', message, context)) {
    setResponse(prev => prev + chunk);
  }
};
```

---

## 💾 Caching Strategy

### 1. Response Cache (Redis)

```typescript
import { redis } from '@/lib/redis';

async function getCachedResponse(
  cacheKey: string,
  ttl: number = 3600 // 1 hora
): Promise<string | null> {
  return await redis.get(cacheKey);
}

async function setCachedResponse(
  cacheKey: string,
  response: string,
  ttl: number = 3600
): Promise<void> {
  await redis.setex(cacheKey, ttl, response);
}

// Uso
const cacheKey = `ai:persona:${personaId}:${hashMessage(userMessage)}`;
const cached = await getCachedResponse(cacheKey);

if (cached) {
  return cached;
}

const response = await consultPersona(personaId, userMessage, context);
await setCachedResponse(cacheKey, response);
return response;
```

### 2. Prompt Cache (Anthropic)

```typescript
// Anthropic suporta caching nativo de system prompts
const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250514',
  max_tokens: 1000,
  system: [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' }, // Cache por 5 minutos
    },
  ],
  messages: [{ role: 'user', content: userMessage }],
});
```

---

## 📊 Cost Management

### Token Tracking

```typescript
interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_cost: number;
}

function calculateCost(usage: TokenUsage): number {
  const INPUT_COST_PER_1K = 0.003; // $3 per 1M tokens
  const OUTPUT_COST_PER_1K = 0.015; // $15 per 1M tokens

  const inputCost = (usage.input_tokens / 1000) * INPUT_COST_PER_1K;
  const outputCost = (usage.output_tokens / 1000) * OUTPUT_COST_PER_1K;

  return inputCost + outputCost;
}

// Após cada requisição
const cost = calculateCost(response.usage);
await logUsage(userId, cost, response.usage);
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requisições por minuto por IP
  message: 'Muitas requisições. Aguarde 1 minuto.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/ai/*', aiLimiter);
```

### User Quotas

```typescript
async function checkUserQuota(userId: string): Promise<boolean> {
  const usage = await getUserMonthlyUsage(userId);
  const tier = await getUserTier(userId);

  const quotas = {
    free: 100, // 100 requisições/mês
    pro: 1000,
    enterprise: Infinity,
  };

  return usage < quotas[tier];
}
```

---

## 🔐 Security

### API Key Protection

```typescript
// .env.example
ANTHROPIC_API_KEY=sk-ant-your-key-here

// NUNCA commitar .env no git
// Usar variáveis de ambiente em produção (Vercel, Railway)
```

### Input Sanitization

```typescript
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

const MessageSchema = z.object({
  content: z.string().max(4000).min(1),
  personaId: z.enum(['cto', 'cpo', 'caio', 'cmo', 'cfo', 'cso', 'cco', 'clo']),
});

function sanitizeUserInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [], // Remove todos os tags HTML
    allowedAttributes: {},
  });
}
```

### Error Handling

```typescript
async function safeConsultPersona(
  personaId: string,
  userMessage: string,
  projectContext: ProjectContext
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    // Validar entrada
    const validated = MessageSchema.parse({
      content: userMessage,
      personaId,
    });

    // Sanitizar
    const sanitized = sanitizeUserInput(validated.content);

    // Executar
    const response = await consultPersona(personaId, sanitized, projectContext);

    return { success: true, data: response };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API Error:', error.status, error.message);
      return { success: false, error: 'Erro ao consultar IA. Tente novamente.' };
    }

    if (error instanceof z.ZodError) {
      return { success: false, error: 'Entrada inválida.' };
    }

    console.error('Unexpected error:', error);
    return { success: false, error: 'Erro inesperado. Contate o suporte.' };
  }
}
```

---

## 📈 Monitoring

### Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'ai-requests.log' }),
  ],
});

async function logAIRequest(
  userId: string,
  personaId: string,
  inputTokens: number,
  outputTokens: number,
  cost: number,
  latency: number
) {
  logger.info('AI Request', {
    userId,
    personaId,
    inputTokens,
    outputTokens,
    cost,
    latency,
    timestamp: new Date().toISOString(),
  });
}
```

### Metrics

```typescript
interface AIMetrics {
  totalRequests: number;
  avgLatency: number;
  totalCost: number;
  cacheHitRate: number;
  errorRate: number;
}

async function getAIMetrics(period: 'day' | 'week' | 'month'): Promise<AIMetrics> {
  const logs = await getLogsForPeriod(period);

  return {
    totalRequests: logs.length,
    avgLatency: avg(logs.map(l => l.latency)),
    totalCost: sum(logs.map(l => l.cost)),
    cacheHitRate: logs.filter(l => l.cached).length / logs.length,
    errorRate: logs.filter(l => l.error).length / logs.length,
  };
}
```

---

## 🧪 Testing

### Mock API (Development)

```typescript
// __mocks__/anthropic.ts
export const mockClient = {
  messages: {
    create: jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Resposta mockada' }],
      usage: { input_tokens: 100, output_tokens: 50 },
    }),
  },
};
```

### Integration Tests

```typescript
describe('Persona Consultation', () => {
  it('should return valid response from CTO persona', async () => {
    const response = await consultPersona(
      'cto',
      'Como escalar a infraestrutura?',
      mockProjectContext
    );

    expect(response).toBeDefined();
    expect(response.length).toBeGreaterThan(50);
  });

  it('should cache responses', async () => {
    const key = 'test-cache-key';
    const response1 = await consultPersona('cto', 'Test', mockContext);
    const cached = await getCachedResponse(key);

    expect(cached).toEqual(response1);
  });
});
```

---

**Última atualização:** 21/01/2026
**Mantido por:** Equipe NeuroExecução
