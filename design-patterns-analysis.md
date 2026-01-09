# Análise dos Padrões de Design - NeuroPlan Exportação PDF

## Padrões Identificados

### 1. Layout A4 para Impressão
- Dimensões: 210mm x 297mm
- Padding: 15mm
- Print color adjust: exact
- Page break after: always

### 2. Paleta de Cores Corporativa
- Navy Dark: #0F172A
- Slate Gray: #334155
- Light Gray: #F1F5F9
- Accent Blue: #2563EB (substituir por verde no NeuroPlan)
- Accent Teal: #0D9488
- Destaque/Laranja: #FF6B35, #FF8C42

### 3. Tipografia
- Font: Roboto, Inter, system fonts
- Títulos: 24pt-28pt, font-weight 900
- Subtítulos: 10pt-14pt, uppercase, letter-spacing
- Corpo: 9pt-14pt

### 4. Estrutura de Cards
- Grid 3x2 para infográficos
- Números grandes (32pt) como watermark
- Ícones SVG 40x40px
- Seção "Quando usar" com background destacado

### 5. Elementos de Progresso
- Barras de progresso com border-radius
- Indicadores circulares numerados
- Badges coloridos por categoria

### 6. Formatos de Exportação Necessários

#### A. Plano Mental One-Page
- Layout A4 único
- Header com título e logo
- Grid de cards com tarefas
- Footer com data e autor

#### B. Post-its Recortáveis
- Grid de cards pequenos
- Bordas tracejadas para recorte
- Uma tarefa por card
- Espaço para checkbox manual

#### C. One-Page do Projeto
- Resumo executivo
- Entregáveis A-B-C
- Timeline visual
- Tarefas principais

#### D. Código para Calendário (iCal)
- Formato .ics
- Eventos com título da tarefa
- Duração estimada
- Lembretes configuráveis

### 7. Elementos Interativos (Web)
- Accordions abre/fecha
- Botões de copiar texto
- Progress indicators
- Tabs de navegação
