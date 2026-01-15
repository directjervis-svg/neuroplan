# 🧪 Plano de Testes Manuais - Bloqueadores Críticos

**Data:** 15 de Janeiro de 2026  
**Versão:** 1.0  
**Responsável:** QA / Founder

---

## 📋 Objetivo

Validar manualmente as 3 implementações críticas antes do deploy staging:
1. Validação de Idade (LGPD)
2. Templates de Projeto
3. Loading States no Wizard

---

## 🔐 TESTE 1: Validação de Idade (LGPD)

### Cenário 1.1: Novo Usuário - Idade Válida (>= 18 anos)

**Pré-requisitos:**
- Banco de dados limpo ou usuário novo
- Aplicação rodando localmente

**Passos:**
1. Acessar `http://localhost:5000`
2. Clicar em "Entrar com Manus"
3. Fazer login com conta nova (nunca usada)
4. Após login, observar se modal de idade aparece

**Resultado Esperado:**
- ✅ Modal "Verificação de Idade" aparece automaticamente
- ✅ Modal não pode ser fechado clicando fora
- ✅ Campo de data está presente com max=hoje
- ✅ Texto explica motivo (LGPD + dados sensíveis TDAH)

**Ação:**
5. Inserir data de nascimento >= 18 anos (ex: 01/01/2000)
6. Clicar em "Confirmar Idade"

**Resultado Esperado:**
- ✅ Modal fecha
- ✅ Página recarrega
- ✅ Usuário tem acesso ao dashboard
- ✅ No banco: `age_verified = true`

**Critério de Sucesso:** ✅ / ❌

---

### Cenário 1.2: Novo Usuário - Idade Inválida (< 18 anos)

**Passos:**
1. Repetir passos 1-4 do Cenário 1.1
2. Inserir data de nascimento < 18 anos (ex: 01/01/2010)
3. Clicar em "Confirmar Idade"

**Resultado Esperado:**
- ✅ Mensagem de erro aparece: "Você precisa ter 18 anos ou mais para usar o NeuroExecução"
- ✅ Modal permanece aberto
- ✅ Usuário não consegue acessar dashboard
- ✅ No banco: `age_verified = false`

**Critério de Sucesso:** ✅ / ❌

---

### Cenário 1.3: Data Inválida - Futuro

**Passos:**
1. Repetir passos 1-4 do Cenário 1.1
2. Inserir data no futuro (ex: 01/01/2030)
3. Clicar em "Confirmar Idade"

**Resultado Esperado:**
- ✅ Mensagem de erro: "Data de nascimento não pode ser no futuro"
- ✅ Modal permanece aberto

**Critério de Sucesso:** ✅ / ❌

---

### Cenário 1.4: Usuário Existente com Idade Verificada

**Pré-requisitos:**
- Usuário já validou idade anteriormente

**Passos:**
1. Fazer login com usuário existente
2. Observar se modal aparece

**Resultado Esperado:**
- ✅ Modal NÃO aparece
- ✅ Usuário vai direto para dashboard

**Critério de Sucesso:** ✅ / ❌

---

## 📋 TESTE 2: Templates de Projeto

### Cenário 2.1: Visualizar Templates

**Pré-requisitos:**
- Usuário logado
- Nenhum projeto criado (ou poucos)

**Passos:**
1. Acessar `/dashboard/projects/new` ou clicar em "Novo Projeto"
2. Observar tela de templates

**Resultado Esperado:**
- ✅ Título "Comece com um Template"
- ✅ 5 templates visíveis:
  - Lançar Produto Digital (badge "Popular")
  - Escrever Artigo ou Relatório (badge "Popular")
  - Organizar Evento
  - Reformar Casa ou Cômodo
  - Planejar Viagem (badge "Popular")
- ✅ Filtros: Todos, Trabalho, Pessoal, Criativo
- ✅ Botão "Prefiro criar do zero"

**Critério de Sucesso:** ✅ / ❌

---

### Cenário 2.2: Filtrar Templates por Categoria

**Passos:**
1. Clicar em filtro "Trabalho"
2. Observar templates exibidos
3. Clicar em filtro "Pessoal"
4. Observar templates exibidos
5. Clicar em "Todos"

**Resultado Esperado:**
- ✅ Filtro "Trabalho": Apenas "Lançar Produto Digital"
- ✅ Filtro "Pessoal": 3 templates (Evento, Reforma, Viagem)
- ✅ Filtro "Criativo": Apenas "Escrever Artigo"
- ✅ Filtro "Todos": 5 templates

**Critério de Sucesso:** ✅ / ❌

---

### Cenário 2.3: Criar Projeto a partir de Template

**Passos:**
1. Clicar em template "Lançar Produto Digital"
2. Aguardar criação do projeto
3. Observar redirecionamento

**Resultado Esperado:**
- ✅ Projeto criado com título "Lançar Produto Digital"
- ✅ Redirecionamento para `/dashboard/projects/{id}`
- ✅ No banco: Projeto com status `ACTIVE`

**Ação:**
4. Verificar deliverables ABC:
   - Abrir detalhes do projeto
   - Verificar se há 3 deliverables (A, B, C)

**Resultado Esperado:**
- ✅ Deliverable A: "MVP funcional com 1-2 funcionalidades core..."
- ✅ Deliverable B: "Produto com 3-5 funcionalidades essenciais..."
- ✅ Deliverable C: "Produto completo com onboarding polido..."

**Ação:**
5. Verificar tarefas criadas:
   - Acessar lista de tarefas do projeto
   - Contar número de tarefas

**Resultado Esperado:**
- ✅ 7 tarefas criadas
- ✅ Tarefas distribuídas em 3 dias:
  - Dia 1: 3 tarefas
  - Dia 2: 2 tarefas
  - Dia 3: 2 tarefas
- ✅ Tarefas com títulos corretos:
  - "Definir problema e solução em uma frase"
  - "Listar 3-5 funcionalidades essenciais do MVP"
  - etc.

**Critério de Sucesso:** ✅ / ❌

---

### Cenário 2.4: Criar Projeto do Zero (Sem Template)

**Passos:**
1. Na tela de templates, clicar em "Prefiro criar do zero"
2. Observar comportamento

**Resultado Esperado:**
- ✅ Wizard tradicional é aberto (Step 1: Calibração)
- ✅ Usuário pode criar projeto manualmente

**Critério de Sucesso:** ✅ / ❌

---

## ⏳ TESTE 3: Loading States no Wizard

### Cenário 3.1: Loading no Step 3 (Análise de Charter)

**Pré-requisitos:**
- Criar projeto do zero (sem template)

**Passos:**
1. Completar Step 1 (Calibração)
2. Completar Step 2 (Charter) com texto:
   - Nome: "Lançar meu app"
   - Resultado: "Criar um aplicativo mobile para gestão de tarefas"
3. Avançar para Step 3
4. Observar loading state

**Resultado Esperado:**
- ✅ Componente `AILoadingState` aparece
- ✅ Ícone de cérebro com animação ping
- ✅ Título: "Analisando seu projeto..."
- ✅ Dicas rotativas (mudam a cada 2s):
  - "Estamos identificando os principais desafios e objetivos"
  - "Nossa IA está estruturando seu plano de execução"
  - "Adaptando a granularidade às suas preferências"
- ✅ Progress bar animada (0% → 95%)
- ✅ Badge: "Usando IA adaptativa GPT-4o-mini"
- ✅ Texto: "Isso pode levar alguns segundos..."

**Ação:**
5. Aguardar conclusão (5-10 segundos)

**Resultado Esperado:**
- ✅ Loading desaparece
- ✅ Análise SMART é exibida
- ✅ Clareza score (0-10) aparece

**Critério de Sucesso:** ✅ / ❌

---

### Cenário 3.2: Loading no Step 4 (Geração de Deliverables)

**Passos:**
1. Continuar do Step 3
2. Aceitar sugestão ou manter original
3. Avançar para Step 4
4. Observar loading state

**Resultado Esperado:**
- ✅ Componente `AILoadingState` aparece
- ✅ Título: "Gerando estrutura de entregáveis..."
- ✅ Dicas rotativas:
  - "Definindo os três níveis: Mínimo, Ideal e Excepcional"
  - "Estruturando seu projeto em etapas alcançáveis"
  - "Aplicando o Sistema ABC baseado em ciência"
- ✅ Progress bar animada
- ✅ Duração estimada: 7 segundos

**Ação:**
5. Aguardar conclusão

**Resultado Esperado:**
- ✅ Loading desaparece
- ✅ 3 deliverables são exibidos (editáveis)

**Critério de Sucesso:** ✅ / ❌

---

### Cenário 3.3: Loading no Step 5 (Geração de Tarefas)

**Passos:**
1. Continuar do Step 4
2. Revisar deliverables (pode editar ou manter)
3. Avançar para Step 5
4. Observar loading state

**Resultado Esperado:**
- ✅ Componente `AILoadingState` aparece
- ✅ Título: "Criando lista de tarefas..."
- ✅ Dicas rotativas:
  - "Quebrando seu projeto em ações específicas"
  - "Distribuindo tarefas ao longo de 3 dias"
  - "Estimando tempo necessário para cada etapa"
- ✅ Progress bar animada
- ✅ Duração estimada: 10 segundos

**Ação:**
5. Aguardar conclusão

**Resultado Esperado:**
- ✅ Loading desaparece
- ✅ Lista de tarefas é exibida (agrupadas por deliverable)

**Critério de Sucesso:** ✅ / ❌

---

### Cenário 3.4: Erro de IA (Simulação)

**Nota:** Este teste requer desabilitar IA temporariamente ou simular erro.

**Passos:**
1. Forçar erro na chamada de IA (ex: desconectar internet)
2. Tentar avançar Step 3, 4 ou 5
3. Observar comportamento

**Resultado Esperado:**
- ✅ Componente `AIErrorFallback` aparece
- ✅ Ícone de alerta vermelho
- ✅ Título: "Ops! Algo deu errado com a IA"
- ✅ Mensagem de erro clara
- ✅ Botão "Tentar Novamente"
- ✅ Botão "Continuar Manualmente"
- ✅ Texto explicativo sobre modo manual

**Critério de Sucesso:** ✅ / ❌

---

## 📊 Resumo de Testes

| Teste | Cenários | Status | Bugs Encontrados |
|-------|----------|--------|------------------|
| **Validação de Idade** | 4 | ⏳ | - |
| **Templates de Projeto** | 4 | ⏳ | - |
| **Loading States** | 4 | ⏳ | - |
| **TOTAL** | **12** | ⏳ | - |

---

## 🐛 Registro de Bugs

### Bug #1
**Título:**  
**Severidade:** 🔴 Crítico / 🟡 Médio / 🟢 Baixo  
**Cenário:** Teste X.Y  
**Descrição:**  
**Passos para Reproduzir:**  
**Comportamento Esperado:**  
**Comportamento Atual:**  
**Screenshot:**  

---

## ✅ Critérios de Aprovação

Para prosseguir com deploy staging:
- ✅ Todos os 12 cenários passam
- ✅ Zero bugs críticos (🔴)
- ✅ Máximo 2 bugs médios (🟡)
- ✅ Bugs baixos (🟢) podem ser corrigidos pós-staging

---

## 📝 Notas do Testador

**Data do Teste:**  
**Testador:**  
**Ambiente:** Local / Staging / Produção  
**Navegador:**  
**Sistema Operacional:**  

**Observações Gerais:**

---

**Documento criado em:** 15/01/2026 18:45 GMT-3
