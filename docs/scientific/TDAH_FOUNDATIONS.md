# Base Científica TDAH - NeuroExecução

**Versão:** 1.0
**Última Atualização:** 21/01/2026

## 1. Russell A. Barkley, PhD

### Perfil
- **Status:** Principal referência mundial para TDAH adulto
- **Afiliação:** Virginia Commonwealth University
- **Contribuição:** Modelo de TDAH centrado em déficits de autorregulação

### Conceitos-Chave

#### 1.1 Miopia Temporal (Time Myopia)
> "Adults with ADHD don't have a problem with **knowing** what to do. They have a problem with **doing** what they know." — Barkley (2010)

**Problema:** Dificuldade de projetar consequências futuras

**Aplicação no NeuroExecução:**
- Ciclos de 3 dias (não 30 dias)
- Dashboard "Hoje" sempre visível
- Feedback imediato < 200ms

#### 1.2 Externalização (Externalization)
**Problema:** Working memory fraca, não dá para "lembrar"

**Aplicação:**
- Tudo visual no dashboard
- Painel "Onde Parei" sempre visível
- Zero dependência de memória mental

#### 1.3 Recompensas Imediatas
**Problema:** Motivação depende de feedback instantâneo

**Aplicação:**
- Gamificação ética com XP por tarefa
- Progress bar em tempo real
- Checkmarks visuais imediatos

#### 1.4 Ponto de Performance
**Problema:** Trabalhar sob pressão, não planejamento

**Aplicação:**
- Timer progressivo (count-up)
- Ver tempo trabalhado, não faltante
- Sem notificações ansiogênicas

### Obras de Referência

1. **Taking Charge of Adult ADHD** (2010)
   - ISBN: 978-1606233382
   - Foco: Estratégias práticas para adultos

2. **12 Principles for Raising a Child with ADHD** (2012)
   - ISBN: 978-1462539130
   - Foco: Princípios de manejo

3. **Executive Functions: What They Are, How They Work, and Why They Evolved** (2012)
   - ISBN: 978-1462545933
   - Foco: Teoria das funções executivas

---

## 2. Thomas E. Brown, PhD

### Perfil
- **Status:** Especialista em funções executivas e TDAH adulto
- **Afiliação:** Yale University (Associate Director of Yale Clinic)
- **Contribuição:** Modelo de 6 clusters de funções executivas

### 6 Clusters de Funções Executivas

| # | Cluster | Déficit | Aplicação NeuroExecução |
|---|---------|---------|------------------------|
| 1 | **Ativação** | Dificuldade iniciar tarefas | Bloco "Começar Agora" 10min + first_action |
| 2 | **Foco** | Distração frequente | Uma tarefa por vez + bench para switching |
| 3 | **Esforço** | Fadiga mental rápida | Divisão Ação/Retenção/Manutenção |
| 4 | **Emoção** | Frustração/baixa tolerância | Linguagem gentil, anti-culpa |
| 5 | **Memória** | Working memory fraca | Tudo externalizado, painel "Onde Parei" |
| 6 | **Monitoria** | Perda de noção de progresso | Progress bars, checkpoints frequentes |

### Citação-Chave
> "ADHD is not primarily a disorder of **attention**. It's a disorder of **executive functions**, which includes attention management." — Brown (2013)

### Obras de Referência

1. **A New Understanding of ADHD in Children and Adults** (2013)
   - ISBN: 978-0415814256
   - Foco: Modelo de funções executivas

2. **Smart but Stuck: Emotions in Teens and Adults with ADHD** (2014)
   - ISBN: 978-1118279274
   - Foco: Regulação emocional

---

## 3. Joseph Biederman, MD

### Perfil
- **Status:** Autoridade em comorbidades e tratamento farmacológico
- **Afiliação:** Harvard Medical School / Massachusetts General Hospital
- **Contribuição:** Grandes estudos epidemiológicos

### Comorbidades Frequentes

| Comorbidade | Prevalência | Aplicação NeuroExecução |
|-------------|-------------|------------------------|
| **Ansiedade** | 50-60% | Timer progressivo (não countdown ansioso) |
| **Depressão** | 30-40% | Gamificação ética (reforço positivo) |
| **TOC** | 20-30% | Permitir edição de tarefas (não lock) |

### Medicação e Picos de Efeito

| Medicamento | Pico de Efeito | Rebote |
|-------------|----------------|--------|
| Metilfenidato IR | 1-3h após dose | 4-6h após dose |
| Metilfenidato LA | 2-4h após dose | 8-10h após dose |
| Lisdexanfetamina | 3-5h após dose | 10-12h após dose |

**Aplicação:**
- Sugestão "horário de foco" no calendário
- Tarefas ACTION para horário de pico
- Tarefas MAINTENANCE para período de rebote

### Citação-Chave
> "ADHD persists into adulthood in about 60-70% of cases, but the presentation changes significantly." — Biederman et al. (2000)

### Obras de Referência

1. **Age-Dependent Decline of Symptoms of ADHD** (2000)
   - American Journal of Psychiatry, 157(5), 816-818
   - Foco: Persistência na idade adulta

---

## 4. Design Universal para Aprendizagem (DUA)

### Fonte
**CAST (Center for Applied Special Technology)**
https://udlguidelines.cast.org

### 3 Princípios Aplicados

#### 4.1 Múltiplas Formas de Representação
```
Status de tarefa = Ícone + Cor + Texto

Exemplo:
✅ (ícone) + Verde (cor) + "Completo" (texto)
```

#### 4.2 Múltiplas Formas de Ação/Expressão
```
Criar tarefa via:
- Texto (digitar)
- Voz (speech-to-text)
- Template (select)
- Upload (arquivo)
```

#### 4.3 Múltiplas Formas de Engajamento
```
Engajamento via:
- Gamificação ética (XP por tarefa)
- Progresso visual (barras)
- Comunidade (ranking opcional)
```

---

## 5. Aplicações Práticas no NeuroExecução

### 5.1 Timer Progressivo (Barkley)
```typescript
// Count-up ao invés de countdown
// Reduz ansiedade, mostra conquista

function ProgressiveTimer() {
  const [elapsed, setElapsed] = useState(0);

  // Mostra: "2h 15m trabalhados"
  // Não mostra: "45min restantes"
}
```

### 5.2 Máximo 3 Tarefas/Dia (Barkley)
```typescript
// Miopia temporal = ciclos curtos

interface DailyPlan {
  tasks: Task[]; // max 3
}

function addTask(task: Task) {
  if (plan.tasks.length >= 3) {
    throw new Error("Máximo de 3 tarefas por dia");
  }
}
```

### 5.3 Divisão por Tipo de Esforço (Brown)
```typescript
enum TaskEffortType {
  ACTION = 'action',      // Criar algo novo, alto foco
  RETENTION = 'retention', // Manter existente, foco médio
  MAINTENANCE = 'maintenance' // Rotina, baixo esforço
}
```

### 5.4 Painel "Onde Parei" (Brown Cluster 5)
```typescript
// Memory externalization

interface WhereILeftOff {
  recent_activities: ActivityLog[];
  last_task: Task | null;
  suggested_next_action: string;
}
```

---

## 6. Referências Bibliográficas Completas

### Livros
1. Barkley, R. A. (2010). *Taking Charge of Adult ADHD*. New York: Guilford Press.
2. Barkley, R. A. (2012). *12 Principles for Raising a Child with ADHD*. New York: Guilford Press.
3. Brown, T. E. (2013). *A New Understanding of ADHD in Children and Adults*. London: Routledge.
4. Brown, T. E. (2014). *Smart but Stuck*. San Francisco: Jossey-Bass.

### Artigos
5. Biederman, J., Mick, E., & Faraone, S. V. (2000). Age-Dependent Decline of Symptoms of ADHD. *American Journal of Psychiatry*, 157(5), 816-818.

### Guidelines
6. CAST (2020). *Universal Design for Learning Guidelines version 2.2*. https://udlguidelines.cast.org

### Organizações
7. ABDA - Associação Brasileira do Déficit de Atenção: https://tdah.org.br
8. CHADD - Children and Adults with ADHD: https://chadd.org

---

**Status:** ✅ Production-Ready
**Validação:** Citações com fontes primárias
**Uso:** Fundamentar decisões de produto
