"""
Prompt library models for the structured prompts system
Contains 22+ prompts across 5 categories
"""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class PromptCategory(str, Enum):
    """Categories for organizing prompts."""

    VALIDATION = "validation"
    PRODUCT = "product"
    STRATEGY = "strategy"
    WORKFLOW = "workflow"
    CONTEXT = "context"


class Prompt(BaseModel):
    """Structured prompt definition."""

    id: str = Field(..., description="Unique identifier (e.g., VAL-001)")
    name: str = Field(..., description="Prompt name")
    description: str = Field(..., description="Brief description")
    category: PromptCategory = Field(..., description="Prompt category")
    tags: list[str] = Field(default_factory=list, description="Searchable tags")
    content: str = Field(..., description="Full prompt content in markdown")
    variables: list[str] = Field(default_factory=list, description="Replaceable variables")
    usage_count: int = Field(default=0, description="Usage metrics")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True


class PromptListResponse(BaseModel):
    """Response for listing prompts."""

    prompts: list[Prompt]
    total: int
    categories: dict[str, int] = Field(default_factory=dict, description="Count by category")


class PromptExecuteRequest(BaseModel):
    """Request to execute a prompt."""

    prompt_id: str = Field(..., description="Prompt ID to execute")
    variables: dict[str, str] = Field(default_factory=dict, description="Variable replacements")
    project_context: dict | None = Field(None, description="Optional project context")


class PromptExecuteResponse(BaseModel):
    """Response from prompt execution."""

    prompt_id: str
    rendered_prompt: str = Field(..., description="Prompt with variables replaced")
    ai_response: str | None = Field(None, description="AI response if executed")
    execution_time_ms: int | None = Field(None, description="Execution time")


# Pre-defined prompts based on documentation
PROMPTS: dict[str, Prompt] = {
    # VALIDATION PROMPTS (VAL-001 to VAL-005)
    "VAL-001": Prompt(
        id="VAL-001",
        name="Coeficiente de Validação",
        description="Validar ideias antes de investir tempo usando o framework CV",
        category=PromptCategory.VALIDATION,
        tags=["feature", "mvp", "decisão", "priorização"],
        variables=["IDEIA_A_VALIDAR"],
        content="""ROLE: Analista de Validação de Ideias para Produtos TDAH

CONTEXTO:
Preciso validar ideia/feature antes de investir tempo.

IDEIA A VALIDAR:
{IDEIA_A_VALIDAR}

FRAMEWORK:
Para cada variável, pesquise dados reais e atribua nota 0-10:

V1 - Dores TDAH (Peso 25%)
├─ Pesquise: Reddit r/ADHD, grupos Facebook TDAH Brasil
├─ Quantifique: frequência + intensidade emocional
└─ Nota: ___/10 | Justificativa: ___

V2 - Base Científica (Peso 20%)
├─ Pesquise: PubMed, Google Scholar, livros Barkley/Brown
├─ Verifique: suporte científico para abordagem?
└─ Nota: ___/10 | Justificativa: ___

V3 - Volume de Busca (Peso 15%)
├─ Pesquise: Google Trends, SEMrush, palavras-chave
├─ Quantifique: buscas mensais relacionadas
└─ Nota: ___/10 | Justificativa: ___

V4 - Gap de Mercado (Peso 15%)
├─ Pesquise: concorrentes diretos (Tiimo, Inflow, etc)
├─ Identifique: feature existe? Como é implementada?
└─ Nota: ___/10 | Justificativa: ___

V5 - Viabilidade Técnica (Peso 10%)
├─ Avalie: complexidade de implementação
├─ Estime: tempo e recursos necessários
└─ Nota: ___/10 | Justificativa: ___

V6 - Fit com Personas (Peso 10%)
├─ Verifique: alinha com público-alvo definido?
├─ Valide: resolve problema real das personas?
└─ Nota: ___/10 | Justificativa: ___

V7 - Potencial Monetização (Peso 5%)
├─ Analise: pode ser diferencial pago?
├─ Compare: benchmarks de pricing
└─ Nota: ___/10 | Justificativa: ___

OUTPUT:
1. Tabela com notas e justificativas
2. CV = (V1×0.25) + (V2×0.20) + (V3×0.15) + (V4×0.15) + (V5×0.10) + (V6×0.10) + (V7×0.05)
3. Recomendação: PRIORIZAR (≥7.0) / REFINAR (5.0-6.9) / DESCARTAR (<5.0)
4. Fontes citadas""",
    ),
    "VAL-002": Prompt(
        id="VAL-002",
        name="Features MVP",
        description="Priorizar funcionalidades para lançamento usando MoSCoW",
        category=PromptCategory.VALIDATION,
        tags=["feature", "mvp", "priorização", "MoSCoW"],
        variables=["LISTA_FEATURES"],
        content="""ROLE: Product Manager especializado em TDAH e UX neuroadaptativo

CONTEXTO:
Tenho múltiplas features conceituadas. Preciso priorizar para MVP.

LISTA DE FEATURES:
{LISTA_FEATURES}

ANÁLISE (para cada feature):
1. Essencialidade TDAH: Compensa qual déficit executivo específico?
2. Complexidade técnica: Esforço de implementação (1-10)
3. Diferenciação: Existe em concorrentes? Como?
4. Risco sobrecarga: Adiciona ou reduz carga cognitiva do usuário?

OUTPUT:
- Matriz MoSCoW:
  - Must Have: Features essenciais para MVP funcionar
  - Should Have: Importantes mas podem esperar v1.1
  - Could Have: Nice-to-have se sobrar tempo
  - Won't Have: Adiadas intencionalmente (v2.0+)
- Top 5 features para MVP v1.0
- Features adiadas com justificativa
- Justificativa científica para cada decisão""",
    ),
    "VAL-003": Prompt(
        id="VAL-003",
        name="Experiência vs Generalização",
        description="Validar se experiência pessoal é generalizável",
        category=PromptCategory.VALIDATION,
        tags=["validação", "pesquisa", "viés"],
        variables=["EXPERIENCIA_PESSOAL"],
        content="""ROLE: Pesquisador de Comportamento com foco em TDAH

CONTEXTO:
Tenho uma experiência pessoal que acredito ser comum em TDAH.
Preciso validar se é generalizável ou viés pessoal.

EXPERIÊNCIA PESSOAL:
{EXPERIENCIA_PESSOAL}

ANÁLISE:
1. Pesquise literatura científica (PubMed, Scholar)
2. Busque relatos em comunidades (Reddit r/ADHD, grupos)
3. Identifique padrões ou contraexemplos
4. Avalie tamanho de amostra e representatividade

OUTPUT:
- Nível de generalização: Alta / Média / Baixa / Viés pessoal
- Evidências encontradas (com fontes)
- Contraexemplos identificados
- Recomendação: Usar como base? Adaptar? Descartar?""",
    ),
    "VAL-004": Prompt(
        id="VAL-004",
        name="Influenciadores vs Ciência",
        description="Validar claims de influenciadores contra literatura científica",
        category=PromptCategory.VALIDATION,
        tags=["fact-check", "influenciadores", "ciência"],
        variables=["CLAIM_INFLUENCIADOR", "FONTE_INFLUENCIADOR"],
        content="""ROLE: Fact-checker especializado em TDAH

CONTEXTO:
Vi um influenciador fazendo uma afirmação sobre TDAH.
Preciso validar cientificamente.

CLAIM:
{CLAIM_INFLUENCIADOR}

FONTE:
{FONTE_INFLUENCIADOR}

ANÁLISE:
1. Pesquise literatura científica peer-reviewed
2. Compare com consenso da comunidade (APA, CHADD)
3. Identifique nuances perdidas na simplificação
4. Avalie potencial dano de claim incorreto

OUTPUT:
- Veredicto: Verdadeiro / Parcialmente verdadeiro / Enganoso / Falso
- Base científica (ou falta dela)
- Nuances importantes ignoradas
- Fontes primárias para referência""",
    ),
    "VAL-005": Prompt(
        id="VAL-005",
        name="Fact-Check Científico",
        description="Verificar claims contra literatura acadêmica",
        category=PromptCategory.VALIDATION,
        tags=["fact-check", "ciência", "pesquisa"],
        variables=["CLAIM_A_VERIFICAR"],
        content="""ROLE: Pesquisador Acadêmico

CONTEXTO:
Preciso verificar uma afirmação contra literatura científica.

CLAIM A VERIFICAR:
{CLAIM_A_VERIFICAR}

PROCESSO:
1. Busque em PubMed, Google Scholar, Cochrane
2. Identifique meta-análises e revisões sistemáticas
3. Avalie qualidade das evidências (níveis de evidência)
4. Compare com posições de autoridades (Barkley, Brown, etc)

OUTPUT:
- Nível de evidência: Forte / Moderado / Fraco / Ausente
- Principais estudos citados
- Consenso ou debate na comunidade
- Recomendação para uso no produto""",
    ),
    # PRODUCT PROMPTS (PRO-001 to PRO-004)
    "PRO-001": Prompt(
        id="PRO-001",
        name="Design Neurocompatível",
        description="Guidelines de UX científico para TDAH",
        category=PromptCategory.PRODUCT,
        tags=["design", "UX", "acessibilidade", "TDAH"],
        variables=["COMPONENTE_A_DESIGN"],
        content="""ROLE: Designer especializado em acessibilidade cognitiva

CONTEXTO:
Preciso projetar um componente neurocompatível.

COMPONENTE:
{COMPONENTE_A_DESIGN}

PESQUISE evidências científicas para:
1. Cores: Paletas validadas para reduzir ansiedade TDAH
2. Tipografia: Tamanho mínimo, espaçamento, fontes
3. Densidade visual: Quantos elementos por tela máximo
4. Animações: Movimento ajuda ou atrapalha atenção?
5. Sons/feedback: Notificações sonoras são adequadas?
6. Modo escuro vs claro: Preferência por perfil
7. Barras de progresso: Formato mais motivador
8. Timer: Countdown vs progressivo (count-up)

OUTPUT:
- Tabela: Elemento | Recomendação | Fonte científica
- Design tokens recomendados (CSS)
- Anti-patterns a evitar
- Checklist de validação de acessibilidade""",
    ),
    "PRO-002": Prompt(
        id="PRO-002",
        name="Benchmark Concorrentes",
        description="Análise competitiva de ferramentas TDAH",
        category=PromptCategory.PRODUCT,
        tags=["concorrentes", "análise", "mercado"],
        variables=["CATEGORIA_ANALISE"],
        content="""ROLE: Analista de mercado especializado em healthtech

CATEGORIA PARA ANÁLISE:
{CATEGORIA_ANALISE}

PESQUISE ferramentas TDAH no Brasil e internacionais:
- Tiimo, Inflow, Focusmate, Notion templates, Todoist
- Apps de produtividade com features TDAH
- Soluções enterprise (B2B)

PARA CADA CONCORRENTE:
1. Features principais
2. Preço (BRL e USD)
3. Avaliações (App Store, Google Play)
4. Base científica declarada (se houver)
5. Limitações mencionadas em reviews
6. Presença e adaptação para Brasil

OUTPUT:
- Tabela comparativa completa
- Gaps onde NeuroExecução pode vencer
- Features obrigatórias (table stakes)
- Posicionamento de preço recomendado
- Diferenciadores únicos identificados""",
    ),
    "PRO-003": Prompt(
        id="PRO-003",
        name="Acessibilidade Cognitiva",
        description="Checklist de acessibilidade para TDAH",
        category=PromptCategory.PRODUCT,
        tags=["acessibilidade", "WCAG", "cognitivo"],
        variables=["FEATURE_A_AVALIAR"],
        content="""ROLE: Especialista em Design Universal para Aprendizagem (DUA)

FEATURE PARA AVALIAÇÃO:
{FEATURE_A_AVALIAR}

CHECKLIST DE ACESSIBILIDADE COGNITIVA:

1. Múltiplas Formas de Representação
   □ Texto + Ícones + Cores
   □ Áudio alternativo disponível
   □ Linguagem simples (Flesch-Kincaid)

2. Múltiplas Formas de Ação
   □ Digitar OU clicar OU arrastar OU voz
   □ Atalhos de teclado
   □ Touch-friendly (44px mínimo)

3. Múltiplas Formas de Engajamento
   □ Gamificação ética (sem FOMO)
   □ Progresso visual (não punitivo)
   □ Controle do usuário (pausar/continuar)

4. Específicos TDAH (Barkley/Brown)
   □ Max 3 opções por decisão
   □ Feedback < 200ms
   □ Estado sempre visível (onde estou?)
   □ Desfazer disponível

OUTPUT:
- Score de acessibilidade (0-100)
- Itens críticos a corrigir
- Itens desejáveis para v2
- Referências WCAG e DUA aplicáveis""",
    ),
    "PRO-004": Prompt(
        id="PRO-004",
        name="A/B Testing Hipóteses",
        description="Design de experimentos para validar features",
        category=PromptCategory.PRODUCT,
        tags=["A/B test", "experimento", "validação"],
        variables=["HIPOTESE_A_TESTAR", "METRICA_SUCESSO"],
        content="""ROLE: Growth Product Manager com foco em experimentos

HIPÓTESE A TESTAR:
{HIPOTESE_A_TESTAR}

MÉTRICA DE SUCESSO:
{METRICA_SUCESSO}

DESIGN DO EXPERIMENTO:

1. Formulação
   - H0 (hipótese nula): ___
   - H1 (hipótese alternativa): ___
   - Tamanho de efeito mínimo detectável: ___

2. Grupos
   - Controle: descrição exata
   - Tratamento: descrição exata
   - Alocação: 50/50 ou outro?

3. Métricas
   - Primária: ___
   - Secundárias: ___
   - Guardrails (não piorar): ___

4. Execução
   - Duração mínima: ___ dias
   - Tamanho de amostra necessário: ___
   - Critérios de parada antecipada: ___

OUTPUT:
- Documento de especificação do teste
- Calculadora de tamanho de amostra
- Critérios de sucesso/fracasso
- Plano de rollout se positivo""",
    ),
    # STRATEGY PROMPTS (EST-001 to EST-006)
    "EST-001": Prompt(
        id="EST-001",
        name="Posicionamento Nicho",
        description="Análise de posicionamento nicho vs genérico",
        category=PromptCategory.STRATEGY,
        tags=["posicionamento", "nicho", "mercado"],
        variables=["DILEMA_POSICIONAMENTO"],
        content="""ROLE: Estrategista de marca e posicionamento

DILEMA:
{DILEMA_POSICIONAMENTO}

ANÁLISE:

1. Cases de Sucesso
   - Nicho que venceu genérico: ___
   - Genérico que dominou nicho: ___
   - Lições aplicáveis: ___

2. Mercado TDAH Brasil
   - Tamanho: 11M+ adultos
   - Poder aquisitivo médio: ___
   - Estigma vs aceitação: ___
   - Tendência de crescimento: ___

3. Trade-offs
   - TDAH-first: Fidelidade alta, mercado limitado
   - Genérico: Mercado amplo, diferenciação fraca

OUTPUT:
- Recomendação fundamentada com dados
- Estratégia de migração (se aplicável)
- Messaging framework para posição escolhida
- Riscos e mitigações""",
    ),
    "EST-002": Prompt(
        id="EST-002",
        name="Arquitetura Ecossistema",
        description="Design de ecossistema de produtos",
        category=PromptCategory.STRATEGY,
        tags=["ecossistema", "produto", "estratégia"],
        variables=["PRODUTOS_ATUAIS", "VISAO_FUTURO"],
        content="""ROLE: Estrategista de Produto e Plataforma

PRODUTOS ATUAIS:
{PRODUTOS_ATUAIS}

VISÃO DE FUTURO:
{VISAO_FUTURO}

ANÁLISE DE ECOSSISTEMA:

1. Core Product
   - O que é o coração do ecossistema?
   - Sem o quê o resto não funciona?

2. Extensões
   - Quais produtos complementam o core?
   - Ordem de lançamento ideal?

3. Integrações
   - Quais APIs de terceiros são críticas?
   - Build vs Buy vs Partner?

4. Network Effects
   - Onde há efeitos de rede possíveis?
   - Como amplificar valor com mais usuários?

OUTPUT:
- Diagrama de ecossistema
- Roadmap de produtos (12-24 meses)
- Dependências críticas
- Riscos de plataforma""",
    ),
    "EST-003": Prompt(
        id="EST-003",
        name="Stack Tecnológico AI",
        description="Decisão de arquitetura para AI features",
        category=PromptCategory.STRATEGY,
        tags=["arquitetura", "AI", "tecnologia", "custos"],
        variables=["CASOS_USO_AI"],
        content="""ROLE: Arquiteto de software especializado em AI

CASOS DE USO AI NECESSÁRIOS:
{CASOS_USO_AI}

COMPARE OPÇÕES:

1. API Direta (Claude/GPT)
   - Custo por request: ___
   - Latência esperada: ___
   - Personalização: ___

2. Agente Autônomo
   - Custo setup: ___
   - Custo operacional: ___
   - Complexidade: ___

3. Híbrido (cache + API)
   - Estratégia de cache: ___
   - Taxa de hit esperada: ___
   - Economia projetada: ___

MATRIZ DE DECISÃO:
| Critério | API | Agente | Híbrido |
|----------|-----|--------|---------|
| Custo/user/mês | | | |
| Latência P95 | | | |
| Personalização | | | |
| Complexidade | | | |
| Escalabilidade | | | |

OUTPUT:
- Recomendação técnica justificada
- Estimativa de custo (R$/user/mês)
- Stack sugerido com versões
- Plano de migração se necessário""",
    ),
    "EST-004": Prompt(
        id="EST-004",
        name="Modelo Monetização",
        description="Design de modelo de receita SaaS",
        category=PromptCategory.STRATEGY,
        tags=["monetização", "pricing", "SaaS"],
        variables=["FEATURES_DISPONIVEIS", "CUSTOS_OPERACIONAIS"],
        content="""ROLE: Especialista em Monetização SaaS

FEATURES DISPONÍVEIS:
{FEATURES_DISPONIVEIS}

CUSTOS OPERACIONAIS:
{CUSTOS_OPERACIONAIS}

ANÁLISE:

1. Benchmarks de Mercado
   - Concorrentes TDAH: preços praticados
   - SaaS B2C similar: faixas de preço
   - Willingness to pay do público

2. Estrutura de Tiers
   - Free: O que dar de graça?
   - Pro: O que justifica pagamento?
   - Team: O que é B2B?

3. Unit Economics
   - CAC estimado: ___
   - LTV target: ___
   - Payback period: ___

4. Estratégias de Preço
   - Preço psicológico: ___
   - Desconto anual: ___
   - Cupons/promoções: ___

OUTPUT:
- Tabela de preços recomendada
- Features por tier
- Projeção de receita (12 meses)
- Experimentos de pricing sugeridos""",
    ),
    "EST-005": Prompt(
        id="EST-005",
        name="Go-To-Market",
        description="Estratégia de lançamento de produto",
        category=PromptCategory.STRATEGY,
        tags=["GTM", "lançamento", "marketing"],
        variables=["PRODUTO_A_LANCAR", "BUDGET_DISPONIVEL"],
        content="""ROLE: Head of Growth especializado em lançamentos

PRODUTO A LANÇAR:
{PRODUTO_A_LANCAR}

BUDGET DISPONÍVEL:
{BUDGET_DISPONIVEL}

ESTRATÉGIA GTM:

1. Pré-lançamento (30 dias antes)
   - Waitlist building: ___
   - Content seeding: ___
   - Influencer outreach: ___

2. Lançamento (D-Day)
   - Canais de aquisição: ___
   - Mensagem principal: ___
   - Social proof: ___

3. Pós-lançamento (30 dias depois)
   - Onboarding: ___
   - Feedback loop: ___
   - Otimizações: ___

4. Métricas de Sucesso
   - D1: ___
   - D7: ___
   - D30: ___

OUTPUT:
- Calendário detalhado de ações
- Alocação de budget por canal
- Templates de conteúdo
- KPIs com targets""",
    ),
    "EST-006": Prompt(
        id="EST-006",
        name="Fundraising Deck",
        description="Estrutura de deck para investidores",
        category=PromptCategory.STRATEGY,
        tags=["fundraising", "investidores", "pitch"],
        variables=["ROUND_TARGET", "METRICAS_ATUAIS"],
        content="""ROLE: Advisor de Fundraising (ex-VC)

ROUND TARGET:
{ROUND_TARGET}

MÉTRICAS ATUAIS:
{METRICAS_ATUAIS}

ESTRUTURA DO DECK (12-15 slides):

1. Cover + Hook
2. Problema (dados de mercado)
3. Solução (demonstração visual)
4. Mercado (TAM/SAM/SOM)
5. Modelo de Negócio
6. Tração (métricas reais)
7. Competição (posicionamento)
8. Time (backgrounds)
9. Roadmap (12-24 meses)
10. Financials (projeções)
11. Ask (round, uso de fundos)
12. Backup slides

OUTPUT:
- Outline detalhado de cada slide
- Métricas que investidores querem ver
- Red flags a evitar
- FAQ esperado de investidores""",
    ),
    # WORKFLOW PROMPTS (WRK-001 to WRK-007)
    "WRK-001": Prompt(
        id="WRK-001",
        name="Processamento Dados Massa",
        description="Extrair dados estratégicos de documentos grandes",
        category=PromptCategory.WORKFLOW,
        tags=["dados", "síntese", "análise"],
        variables=["DADOS_BRUTOS"],
        content="""ROLE: Analista de dados especializado em síntese

CONTEXTO:
Documentos gerados com redundâncias.
Preciso extrair dados estratégicos.

DADOS BRUTOS:
{DADOS_BRUTOS}

PROCESSO:
1. Identifique e remova duplicados
2. Classifique informações:
   - CRÍTICO: Impacta decisões agora
   - IMPORTANTE: Informa estratégia
   - CONTEXTO: Background útil
   - DESCARTÁVEL: Ruído
3. Extraia métricas numéricas
4. Identifique gaps de informação
5. Sugira próximas pesquisas

OUTPUT:
- Síntese executiva (max 300 palavras)
- Tabela de métricas extraídas
- Top 5 insights acionáveis
- Gaps identificados
- Recomendação de próximos passos""",
    ),
    "WRK-002": Prompt(
        id="WRK-002",
        name="Organização Arquivos",
        description="Estruturar sistema de arquivos do projeto",
        category=PromptCategory.WORKFLOW,
        tags=["organização", "arquivos", "estrutura"],
        variables=["ARQUIVOS_ATUAIS", "OBJETIVO_ORGANIZACAO"],
        content="""ROLE: Information Architect

ARQUIVOS ATUAIS:
{ARQUIVOS_ATUAIS}

OBJETIVO:
{OBJETIVO_ORGANIZACAO}

ANÁLISE:
1. Identifique categorias naturais
2. Proponha nomenclatura consistente
3. Defina hierarquia de pastas
4. Identifique duplicados para consolidar

OUTPUT:
- Estrutura de pastas proposta
- Convenção de nomenclatura
- Arquivos a consolidar/deletar
- Checklist de migração""",
    ),
    "WRK-003": Prompt(
        id="WRK-003",
        name="Gestão Biblioteca Prompts",
        description="Organizar e manter biblioteca de prompts",
        category=PromptCategory.WORKFLOW,
        tags=["prompts", "organização", "biblioteca"],
        variables=["PROMPTS_EXISTENTES"],
        content="""ROLE: Prompt Engineer especializado em organização

PROMPTS EXISTENTES:
{PROMPTS_EXISTENTES}

ANÁLISE:
1. Categorize por função (validação, produto, etc)
2. Identifique overlaps e redundâncias
3. Padronize formato (ROLE, CONTEXTO, OUTPUT)
4. Defina sistema de versionamento

OUTPUT:
- Taxonomia de prompts
- Prompts a consolidar
- Template padrão
- Sistema de tags""",
    ),
    "WRK-004": Prompt(
        id="WRK-004",
        name="Equipe Multi-Agente",
        description="Coordenar múltiplos agentes AI em tarefa",
        category=PromptCategory.WORKFLOW,
        tags=["agentes", "coordenação", "AI"],
        variables=["TAREFA_COMPLEXA", "AGENTES_DISPONIVEIS"],
        content="""ROLE: Orquestrador de Agentes AI

TAREFA COMPLEXA:
{TAREFA_COMPLEXA}

AGENTES DISPONÍVEIS:
{AGENTES_DISPONIVEIS}

PROCESSO:
1. Decomponha tarefa em subtarefas
2. Atribua cada subtarefa ao agente ideal
3. Defina ordem de execução
4. Estabeleça handoffs entre agentes
5. Defina critérios de qualidade

OUTPUT:
- Workflow de execução
- Responsabilidade por agente
- Checkpoints de qualidade
- Plano de contingência""",
    ),
    "WRK-005": Prompt(
        id="WRK-005",
        name="Automação Slides",
        description="Gerar estrutura de apresentação",
        category=PromptCategory.WORKFLOW,
        tags=["apresentação", "slides", "automação"],
        variables=["TEMA_APRESENTACAO", "DURACAO_MINUTOS", "AUDIENCIA"],
        content="""ROLE: Presentation Designer

TEMA:
{TEMA_APRESENTACAO}

DURAÇÃO:
{DURACAO_MINUTOS} minutos

AUDIÊNCIA:
{AUDIENCIA}

ESTRUTURA:
1. Calcule slides por minuto (2-3/min)
2. Defina arco narrativo
3. Distribua conteúdo por slide
4. Sugira visuais para cada slide

OUTPUT:
- Outline detalhado de slides
- Texto sugerido por slide
- Sugestões de visual/gráfico
- Speaker notes""",
    ),
    "WRK-006": Prompt(
        id="WRK-006",
        name="Síntese Documentos",
        description="Resumir documentos longos preservando essência",
        category=PromptCategory.WORKFLOW,
        tags=["síntese", "resumo", "documentos"],
        variables=["DOCUMENTO_LONGO", "TAMANHO_DESEJADO"],
        content="""ROLE: Editor Executivo

DOCUMENTO:
{DOCUMENTO_LONGO}

TAMANHO DESEJADO:
{TAMANHO_DESEJADO}

PROCESSO:
1. Identifique tese principal
2. Extraia argumentos de suporte
3. Preserve dados/métricas críticas
4. Elimine redundâncias
5. Mantenha conclusões intactas

OUTPUT:
- Resumo no tamanho especificado
- Bullet points dos pontos críticos
- Citações diretas preservadas
- Link para original (contexto)""",
    ),
    "WRK-007": Prompt(
        id="WRK-007",
        name="Checkpoint Contexto",
        description="Salvar estado atual para retomada futura",
        category=PromptCategory.WORKFLOW,
        tags=["checkpoint", "contexto", "memória"],
        variables=["TRABALHO_ATUAL", "PROXIMOS_PASSOS"],
        content="""ROLE: Project Memory Manager

TRABALHO ATUAL:
{TRABALHO_ATUAL}

PRÓXIMOS PASSOS PLANEJADOS:
{PROXIMOS_PASSOS}

CHECKPOINT:
1. Estado atual (onde estou?)
2. Decisões tomadas (por quê?)
3. Dependências abertas (bloqueios?)
4. Artefatos gerados (links?)
5. Contexto crítico (não esquecer?)

OUTPUT:
- Checkpoint formatado para retomada
- Perguntas a responder na volta
- Riscos de perda de contexto
- Sugestão de próxima sessão""",
    ),
    # CONTEXT PROMPTS (CTX-001 to CTX-004)
    "CTX-001": Prompt(
        id="CTX-001",
        name="Checkpoint Semanal",
        description="Template de checkpoint semanal do projeto",
        category=PromptCategory.CONTEXT,
        tags=["checkpoint", "semanal", "progresso"],
        variables=["NUMERO_SEMANA", "DATA"],
        content="""# CHECKPOINT SEMANAL - NeuroExecução

Semana: {NUMERO_SEMANA} | Data: {DATA}

## STATUS ATUAL
- Fase: [Validação / MVP / Beta / Produção]
- Decisão anterior: [GO / NO-GO / Pendente]
- Foco: [Descrição em 1 linha]

## ENTREGÁVEIS CONCLUÍDOS
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

## BLOQUEIOS/PENDÊNCIAS
- Bloqueio 1: [descrição + ação]
- Pendência 2: [responsável]

## MÉTRICAS
- Tarefas completadas: X/Y
- Código commitado: [sim/não]
- Validações: X

## PRÓXIMOS 7 DIAS
1. [Prioridade 1]
2. [Prioridade 2]
3. [Prioridade 3]

## CONTEXTO CRÍTICO PARA AGENTE
[3-5 parágrafos essenciais]

## ARTEFATOS GERADOS
- Link 1: [descrição]

## PERGUNTAS ABERTAS
- Pergunta 1?""",
    ),
    "CTX-002": Prompt(
        id="CTX-002",
        name="Retomada de Contexto",
        description="Retomar trabalho com contexto preservado",
        category=PromptCategory.CONTEXT,
        tags=["retomada", "contexto", "continuidade"],
        variables=["CHECKPOINT_ANTERIOR"],
        content="""ROLE: Co-parceiro de projeto NeuroExecução

CONTEXTO:
{CHECKPOINT_ANTERIOR}

TAREFA:
1. Confirme entendimento do estado atual
2. Identifique prioridades para hoje
3. Sugira próximos passos específicos
4. Alerte sobre riscos/bloqueios

RESTRIÇÕES:
- Não repita informações do checkpoint
- Foque em ações concretas
- Pergunte se algo ambíguo""",
    ),
    "CTX-003": Prompt(
        id="CTX-003",
        name="Revisão Entregáveis",
        description="Revisar qualidade de entregáveis produzidos",
        category=PromptCategory.CONTEXT,
        tags=["revisão", "qualidade", "entregáveis"],
        variables=["ENTREGAVEL", "CRITERIOS_QUALIDADE"],
        content="""ROLE: Quality Reviewer

ENTREGÁVEL PARA REVISÃO:
{ENTREGAVEL}

CRITÉRIOS DE QUALIDADE:
{CRITERIOS_QUALIDADE}

CHECKLIST:
1. Está completo? (todos os requisitos atendidos?)
2. Está correto? (sem erros factuais?)
3. Está claro? (linguagem acessível?)
4. Está útil? (resolve o problema?)
5. Está bonito? (apresentação adequada?)

OUTPUT:
- Score de qualidade (0-100)
- Pontos fortes
- Pontos a melhorar
- Sugestões específicas de correção""",
    ),
    "CTX-004": Prompt(
        id="CTX-004",
        name="Planejamento Sprint",
        description="Planejar sprint de 3 dias (Barkley)",
        category=PromptCategory.CONTEXT,
        tags=["sprint", "planejamento", "Barkley"],
        variables=["CHECKPOINT_ATUAL", "HORAS_DISPONIVEIS", "ENERGIA_MEDIA"],
        content="""ROLE: Scrum Master adaptado para solo-founder TDAH

CONTEXTO:
{CHECKPOINT_ATUAL}

CAPACIDADE:
- Horas úteis: {HORAS_DISPONIVEIS}
- Energia média: {ENERGIA_MEDIA} (1-10)

PRINCÍPIOS (Barkley):
- Max 3 tarefas/dia
- Tarefas AÇÃO primeiro
- Buffer 30% imprevistos
- Entregáveis mensuráveis

PLANO DE 3 DIAS:

DIA 1:
- A (mínimo): ___
- B (ideal): ___
- C (bônus): ___

DIA 2:
- A: ___
- B: ___
- C: ___

DIA 3:
- A: ___
- B: ___
- C: ___

OUTPUT:
- Plano visual de 3 dias
- Critérios de "feito" para cada tarefa
- Dependências entre tarefas
- Plano B se travar em qualquer item""",
    ),
}


def get_prompt(prompt_id: str) -> Prompt | None:
    """Get a prompt by ID."""
    return PROMPTS.get(prompt_id.upper())


def get_all_prompts() -> list[Prompt]:
    """Get all available prompts."""
    return list(PROMPTS.values())


def get_prompts_by_category(category: PromptCategory) -> list[Prompt]:
    """Get prompts filtered by category."""
    return [p for p in PROMPTS.values() if p.category == category]


def search_prompts(query: str) -> list[Prompt]:
    """Search prompts by name, description, or tags."""
    query_lower = query.lower()
    results = []
    for prompt in PROMPTS.values():
        if (
            query_lower in prompt.name.lower()
            or query_lower in prompt.description.lower()
            or any(query_lower in tag.lower() for tag in prompt.tags)
        ):
            results.append(prompt)
    return results


def render_prompt(prompt: Prompt, variables: dict[str, str]) -> str:
    """Render a prompt with variable substitutions."""
    content = prompt.content
    for var_name, var_value in variables.items():
        placeholder = "{" + var_name + "}"
        content = content.replace(placeholder, var_value)
    return content
