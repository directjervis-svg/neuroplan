# Análise do Layout NotebookLM - Estrutura Exata

## Características Principais do NotebookLM

### 1. **Estrutura de Layout**
- **Painel Esquerdo (20-25%)**: Lista de fontes/notebooks com scroll vertical
  - Título "Sources" no topo
  - Botão "+ Add source" destacado
  - Lista de itens com ícones coloridos e checkboxes
  - Barra de pesquisa/filtros acima

- **Painel Central (50-55%)**: Área principal de conteúdo
  - Espaço amplo para exibir informações
  - Sem elementos desnecessários
  - Foco total no conteúdo principal
  - Botões de ação centralizados (Delete, Join, etc.)

- **Painel Direito (20-25%)**: Informações contextuais
  - Título do notebook/projeto
  - Ícones de ação (info, share, download)
  - Gráficos/visualizações pequenas
  - Dados resumidos

### 2. **Paleta de Cores**
- Fundo: Branco/cinza muito claro (#F5F5F5 ou similar)
- Texto: Preto/cinza escuro para contraste
- Destaque: Azul vibrante (#5B6FFF ou similar)
- Ícones: Coloridos (azul, amarelo, laranja, vermelho, verde)
- Bordas: Cinza claro, muito sutis

### 3. **Tipografia**
- Fonte: Sans-serif (provavelmente Google Sans ou similar)
- Tamanho: 14px corpo, 16-18px títulos
- Peso: Regular (400) para corpo, Medium (500) para destaques
- Espaçamento: Generoso entre elementos

### 4. **Componentes Visuais**
- Cards com sombra suave
- Bordas arredondadas (8-12px)
- Botões com canto arredondado (24px+)
- Ícones simples e limpos
- Checkboxes grandes e clicáveis
- Scroll suave em painéis

### 5. **Interações**
- Hover states sutis (mudança de cor de fundo)
- Transições suaves (200-300ms)
- Feedback visual imediato
- Sem animações excessivas

---

## Adaptação para NeuroExecução

### Mapeamento de Componentes

| NotebookLM | NeuroExecução |
|-----------|---------------|
| Sources (esquerda) | Painel "Hoje" com tarefas A-B-C |
| Conteúdo central | Área de trabalho da tarefa ativa |
| Painel direito | Assistente + Contexto do projeto |
| Ícones coloridos | Badges de prioridade (A/B/C) |
| Checkboxes | Checkboxes de tarefas |
| Botões azuis | Botões verdes (#22C55E) |

### Proporções Exatas
- Painel esquerdo: 30-35% (tarefas do dia)
- Painel central: 45-50% (workspace)
- Painel direito: 20-25% (assistente)

### Cores Adaptadas
- Primária: Verde (#22C55E) em vez de azul
- Secundária: Cinza escuro (#1F2937)
- Fundo: Branco (#FFFFFF) ou cinza muito claro (#F9FAFB)
- Texto: Cinza escuro (#111827)

---

## Implementação Técnica

### Estrutura HTML/React
```
<div className="flex h-screen bg-white">
  {/* Left Panel - 30-35% */}
  <aside className="w-1/3 border-r border-gray-200 overflow-y-auto">
    {/* Tasks List */}
  </aside>
  
  {/* Center Panel - 45-50% */}
  <main className="flex-1 overflow-y-auto">
    {/* Active Task Workspace */}
  </main>
  
  {/* Right Panel - 20-25% */}
  <aside className="w-1/4 border-l border-gray-200 overflow-y-auto">
    {/* Assistant + Context */}
  </aside>
</div>
```

### Estilos CSS
- Sem Tailwind classes complexas
- Grid/Flex simples
- Cores consistentes
- Sombras suaves (box-shadow: 0 1px 3px rgba(0,0,0,0.1))
- Transições suaves (transition: all 0.2s ease)

---

## Checklist de Conformidade Visual

- [ ] Painel esquerdo com lista de tarefas
- [ ] Painel central amplo e limpo
- [ ] Painel direito com abas
- [ ] Proporções 30-35% / 45-50% / 20-25%
- [ ] Fundo branco/cinza claro
- [ ] Texto em cinza escuro
- [ ] Botões verdes (#22C55E)
- [ ] Bordas sutis em cinza claro
- [ ] Ícones simples e coloridos
- [ ] Checkboxes grandes
- [ ] Sem animações excessivas
- [ ] Responsivo em mobile (drawer lateral)
