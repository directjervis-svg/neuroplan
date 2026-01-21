"""
API routes for the prompt library
"""

from fastapi import APIRouter, HTTPException, Query

from models.prompt import (
    Prompt,
    PromptCategory,
    PromptListResponse,
    PromptExecuteRequest,
    PromptExecuteResponse,
    PROMPTS,
    get_prompt,
    get_all_prompts,
    get_prompts_by_category,
    search_prompts,
    render_prompt,
)

router = APIRouter()


@router.get("/", response_model=PromptListResponse)
async def list_prompts(
    category: PromptCategory | None = None,
    search: str | None = Query(None, min_length=2),
) -> PromptListResponse:
    """List all prompts with optional filtering."""
    if search:
        prompts = search_prompts(search)
    elif category:
        prompts = get_prompts_by_category(category)
    else:
        prompts = get_all_prompts()

    # Calculate counts by category
    all_prompts = get_all_prompts()
    categories = {}
    for p in all_prompts:
        cat = p.category
        categories[cat] = categories.get(cat, 0) + 1

    return PromptListResponse(
        prompts=prompts,
        total=len(prompts),
        categories=categories,
    )


@router.get("/categories")
async def list_categories() -> dict:
    """List all prompt categories with descriptions."""
    return {
        "categories": [
            {
                "id": PromptCategory.VALIDATION,
                "name": "Validação",
                "icon": "🔍",
                "description": "Validar ideias e features antes de investir tempo",
                "count": len(get_prompts_by_category(PromptCategory.VALIDATION)),
            },
            {
                "id": PromptCategory.PRODUCT,
                "name": "Produto",
                "icon": "📦",
                "description": "Design, UX e decisões de produto",
                "count": len(get_prompts_by_category(PromptCategory.PRODUCT)),
            },
            {
                "id": PromptCategory.STRATEGY,
                "name": "Estratégia",
                "icon": "🎯",
                "description": "Posicionamento, mercado e modelo de negócio",
                "count": len(get_prompts_by_category(PromptCategory.STRATEGY)),
            },
            {
                "id": PromptCategory.WORKFLOW,
                "name": "Workflow",
                "icon": "⚙️",
                "description": "Processos, organização e automação",
                "count": len(get_prompts_by_category(PromptCategory.WORKFLOW)),
            },
            {
                "id": PromptCategory.CONTEXT,
                "name": "Contexto",
                "icon": "📝",
                "description": "Checkpoints, retomada e planejamento",
                "count": len(get_prompts_by_category(PromptCategory.CONTEXT)),
            },
        ]
    }


@router.get("/{prompt_id}", response_model=Prompt)
async def get_prompt_detail(prompt_id: str) -> Prompt:
    """Get a specific prompt by ID."""
    prompt = get_prompt(prompt_id)
    if not prompt:
        raise HTTPException(
            status_code=404,
            detail=f"Prompt '{prompt_id}' not found. Example IDs: VAL-001, PRO-001, EST-001",
        )
    return prompt


@router.post("/{prompt_id}/render", response_model=PromptExecuteResponse)
async def render_prompt_endpoint(prompt_id: str, request: PromptExecuteRequest) -> PromptExecuteResponse:
    """Render a prompt with variable substitutions."""
    prompt = get_prompt(prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail=f"Prompt '{prompt_id}' not found")

    # Check required variables
    missing_vars = []
    for var in prompt.variables:
        if var not in request.variables:
            missing_vars.append(var)

    if missing_vars:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required variables: {missing_vars}. Required: {prompt.variables}",
        )

    rendered = render_prompt(prompt, request.variables)

    return PromptExecuteResponse(
        prompt_id=prompt.id,
        rendered_prompt=rendered,
        ai_response=None,  # AI execution happens in chat endpoint
        execution_time_ms=None,
    )


@router.get("/{prompt_id}/variables")
async def get_prompt_variables(prompt_id: str) -> dict:
    """Get the variables required for a prompt."""
    prompt = get_prompt(prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail=f"Prompt '{prompt_id}' not found")

    return {
        "prompt_id": prompt.id,
        "name": prompt.name,
        "variables": prompt.variables,
        "example_values": _get_example_values(prompt.id),
    }


def _get_example_values(prompt_id: str) -> dict[str, str]:
    """Get example values for prompt variables."""
    examples = {
        "VAL-001": {
            "IDEIA_A_VALIDAR": "Timer progressivo (count-up) ao invés de countdown para reduzir ansiedade"
        },
        "VAL-002": {
            "LISTA_FEATURES": "1. Dashboard com 3 colunas\n2. Timer progressivo\n3. Gamificação com XP\n4. Integração calendário"
        },
        "PRO-001": {
            "COMPONENTE_A_DESIGN": "Modal de criação de tarefa com campos: título, esforço, energia, first_action"
        },
        "PRO-002": {
            "CATEGORIA_ANALISE": "Apps de produtividade para TDAH no Brasil"
        },
        "EST-001": {
            "DILEMA_POSICIONAMENTO": "NeuroExecução para TDAH (nicho fiel) ou Produtividade geral (mercado amplo)?"
        },
        "EST-003": {
            "CASOS_USO_AI": "1. Processar briefing → gerar plano\n2. Assistente contextual no projeto\n3. Sugestão de próximos passos"
        },
        "CTX-001": {
            "NUMERO_SEMANA": "4",
            "DATA": "21/01/2026",
        },
        "CTX-004": {
            "CHECKPOINT_ATUAL": "Sprint 1 finalizado. Dashboard base implementado. Faltam testes.",
            "HORAS_DISPONIVEIS": "12",
            "ENERGIA_MEDIA": "7",
        },
    }
    return examples.get(prompt_id, {})
