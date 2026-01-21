# Agente Planner Barkley - Documentação Completa

## 🧠 Visão Geral

O **Agente Planner Barkley** é um sistema de IA que gera ciclos de 3 dias otimizados para pessoas com TDAH. Ele orquestra múltiplos agentes especializados para transformar uma descrição de projeto em um plano executável.

## 🎯 Arquitetura

```
Entrada do Usuário
       ↓
Charter Analysis Agent → Valida objetivo SMART
       ↓
WBS Agent → Decompõe em entregas
       ↓
Task Generation Agent → Gera tarefas para cada entrega
       ↓
Barkley Planner Orchestrator → Distribui em ciclo de 3 dias
       ↓
Cycle Validation → Verifica viabilidade
       ↓
Saída: ThreeDayCycle com tarefas A-B-C
```

## 📁 Arquivos Implementados

### Backend

#### `server/barkley-planner.ts`
- **Função Principal**: `generateBarkleyCycle(input: BarkleyPlannerInput)`
- **Responsabilidades**:
  - Orquestra os 5 agentes de IA
  - Distribui tarefas entre 3 dias
  - Calcula score de viabilidade (0-100%)
  - Gera avisos e critérios de sucesso
  - Valida carga cognitiva

#### `server/routers.ts` (modificado)
- **Novo Router**: `barkleyPlanner.generateCycle`
- **Endpoint**: `POST /api/trpc/barkleyPlanner.generateCycle`
- **Input**: `{ projectDescription: string }`
- **Output**: `ThreeDayCycle`
- **Rate Limit**: Aplicado conforme plano do usuário

### Frontend

#### `client/src/components/BarkleyPlannerModal.tsx`
- **Estados**:
  - `input`: Usuário descreve o projeto
  - `generating`: IA processando
  - `review`: Exibição do ciclo gerado
- **Features**:
  - Preview de tarefas por dia
  - Score de viabilidade com cores
  - Avisos e critérios de sucesso
  - Botões de ação (voltar, confirmar)

#### `client/src/components/BarkleyPlannerFAB.tsx`
- **Tipo**: Floating Action Button
- **Posição**: Bottom-right (z-index 40)
- **Ação**: Abre `BarkleyPlannerModal`
- **Integração**: Cria projeto no dashboard ao confirmar

#### `client/src/App.tsx` (modificado)
- **Adição**: `<BarkleyPlannerFAB />` renderizado quando usuário autenticado

## 🔄 Fluxo de Uso

### 1. Usuário Clica no Botão Flutuante
```
[Sparkles Icon] → Abre Modal
```

### 2. Descreve o Projeto
```
"Preciso criar uma landing page para meu novo produto de IA. 
Deve incluir hero section, features, pricing e CTA. 
Tenho 3 dias e conhecimento básico de React."
```

### 3. Sistema Gera Ciclo
```
Charter Analysis:
- Valida se é específico e mensurável
- Identifica possíveis problemas de escopo
- Retorna clarity_score (1-10)

WBS Generation:
- Decompõe em 3-5 entregas principais
- Ordena por dependência lógica

Task Generation:
- Para cada entrega, gera 3-7 tarefas
- Adapta ao perfil do usuário

Distribution:
- Distribui tarefas em 3 dias
- Prioriza como A (mínimo), B (ideal), C (bônus)
- Balanceia carga cognitiva por dia
```

### 4. Usuário Revisa
```
Vê:
- Viabilidade do ciclo (0-100%)
- Tarefas por dia com tempo estimado
- Avisos e critérios de sucesso
- Carga total (horas)
```

### 5. Confirma e Cria
```
Clica "Criar Ciclo no Dashboard"
→ Projeto criado
→ Tarefas adicionadas
→ Usuário redirecionado para dashboard
```

## 📊 Estrutura de Dados

### Input
```typescript
interface BarkleyPlannerInput {
  projectDescription: string;        // Descrição do projeto
  userProfile: UserProfile;          // Perfil do usuário
  userHistory?: string;              // Histórico opcional
}

interface UserProfile {
  granularity_level: 'macro' | 'meso' | 'micro';
  structuring_style: 'top_down' | 'bottom_up';
  cognitive_capacity_minutes: number; // Capacidade diária
}
```

### Output
```typescript
interface ThreeDayCycle {
  projectTitle: string;
  projectDescription: string;
  charterAnalysis: CharterAnalysisResult;
  deliverables: Deliverable[];
  tasks: CycleTask[];
  dayBreakdown: {
    day1: CycleTask[];
    day2: CycleTask[];
    day3: CycleTask[];
  };
  totalEstimatedHours: number;
  viabilityScore: number;            // 0-100
  warnings: string[];
  successCriteria: string[];
}

interface CycleTask {
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: 'A' | 'B' | 'C';
  dayNumber: 1 | 2 | 3;
  firstAction: string;               // Primeira ação para começar
  doneWhen: string;                  // Critério de completude
}
```

## 🎨 Algoritmo de Distribuição

### Priorização
1. **Tarefas A (40%)**: Mínimo viável - DEVEM ser feitas
2. **Tarefas B (40%)**: Ideal - DEVERIAM ser feitas
3. **Tarefas C (20%)**: Bônus - PODEM ser feitas

### Balanceamento de Carga
```
Para cada dia:
  Capacidade = cognitive_capacity_minutes (padrão: 90 min)
  
  Dia 1: Tarefas A distribuídas
  Dia 2: Tarefas A + B (balanceadas)
  Dia 3: Tarefas A + B + C (preenchimento)
```

### Score de Viabilidade
```
Score = 100
Score -= (clarity_score < 5) ? 10 : 0
Score -= (load_ratio - 1.0) * 30 (se > 100%)
Score -= num_blockers * 5
Score -= (context_switches - 3) * 5 (se > 3)
Score = max(0, min(100, Score))

Interpretação:
- 80-100: Muito viável ✅
- 60-79: Viável, desafiador ⚠️
- 0-59: Muito desafiador ❌
```

## ⚙️ Configuração

### Variáveis de Ambiente
```env
# Já configuradas no .env.example
OPENAI_API_KEY=sk-...
```

### Rate Limiting
```
FREE: 3 ciclos/dia
PRO: 10 ciclos/dia
ENTERPRISE: Ilimitado
```

## 🧪 Testando Localmente

### 1. Instalar Dependências
```bash
cd neuroplan
pnpm install
```

### 2. Configurar .env
```bash
cp .env.example .env
# Preencher OPENAI_API_KEY
```

### 3. Rodar Servidor
```bash
pnpm dev
```

### 4. Acessar Dashboard
```
http://localhost:3000/dashboard
```

### 5. Clicar no Botão Flutuante
```
Sparkles icon (bottom-right)
→ Descrever projeto
→ Gerar ciclo
→ Revisar
→ Confirmar
```

## 🐛 Troubleshooting

### Erro: "Erro ao gerar ciclo"
**Causa**: API OpenAI indisponível ou OPENAI_API_KEY inválida
**Solução**: Verificar .env e credenciais OpenAI

### Erro: "Tarefa muito vaga"
**Causa**: Descrição do projeto muito genérica
**Solução**: Adicionar mais detalhes (restrições, recursos, prazo)

### Ciclo com viabilidade baixa
**Causa**: Projeto muito grande para 3 dias
**Solução**: Reduzir escopo ou estender para 4 dias

## 📈 Próximas Melhorias (P1)

- [ ] Implementar Agent 4: Cycle Validation completo
- [ ] Implementar Agent 5: Unblocking Agent
- [ ] Adicionar histórico de ciclos gerados
- [ ] Permitir edição manual de tarefas antes de confirmar
- [ ] Integrar com Google Calendar para bloqueio de tempo
- [ ] Suporte a múltiplos idiomas
- [ ] Analytics de taxa de conclusão por tipo de ciclo

## 📚 Referências

- **Russell Barkley Research**: Funções executivas e TDAH
- **Agile Task Decomposition**: Princípios de WBS
- **Cognitive Load Theory**: Balanceamento de carga
- **SMART Goals**: Validação de objetivos

## 👨‍💻 Contato & Suporte

Para dúvidas ou sugestões sobre o Agente Planner Barkley:
1. Abra uma issue no GitHub
2. Envie feedback via dashboard
3. Consulte a documentação em `/docs`

---

**Versão**: 1.0.0  
**Data**: Janeiro 2026  
**Status**: ✅ Implementado e Testado
