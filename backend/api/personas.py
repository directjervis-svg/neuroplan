"""
API routes for C-Level personas
"""

from fastapi import APIRouter, HTTPException

from models.persona import (
    CLevelPersona,
    PersonaListResponse,
    PersonaResponse,
    PERSONAS,
    get_persona,
    get_all_personas,
    generate_system_prompt,
)

router = APIRouter()


@router.get("/", response_model=PersonaListResponse)
async def list_personas() -> PersonaListResponse:
    """List all available C-Level personas."""
    personas = get_all_personas()
    return PersonaListResponse(personas=personas, total=len(personas))


@router.get("/{persona_id}", response_model=PersonaResponse)
async def get_persona_detail(persona_id: str) -> PersonaResponse:
    """Get a specific persona with system prompt."""
    persona = get_persona(persona_id)
    if not persona:
        raise HTTPException(
            status_code=404,
            detail=f"Persona '{persona_id}' not found. Available: {list(PERSONAS.keys())}",
        )

    system_prompt = generate_system_prompt(persona)
    return PersonaResponse(persona=persona, system_prompt=system_prompt)


@router.get("/{persona_id}/expertise")
async def get_persona_expertise(persona_id: str) -> dict:
    """Get expertise areas for a specific persona."""
    persona = get_persona(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found")

    return {
        "persona_id": persona.id,
        "name": persona.name,
        "expertise": persona.expertise,
        "kpis": persona.kpis,
        "when_to_consult": _get_when_to_consult(persona_id),
    }


@router.get("/{persona_id}/system-prompt")
async def get_persona_system_prompt(
    persona_id: str,
    project_name: str | None = None,
    project_phase: str | None = None,
    active_tasks: int = 0,
) -> dict:
    """Generate system prompt for persona with optional project context."""
    persona = get_persona(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found")

    project_context = None
    if project_name:
        project_context = {
            "name": project_name,
            "phase": project_phase or "Em andamento",
            "active_tasks": active_tasks,
            "last_checkpoint": "N/A",
        }

    system_prompt = generate_system_prompt(persona, project_context)
    return {
        "persona_id": persona.id,
        "system_prompt": system_prompt,
        "has_project_context": project_context is not None,
    }


def _get_when_to_consult(persona_id: str) -> list[str]:
    """Get scenarios when to consult each persona."""
    scenarios = {
        "cto": [
            "Discussões de arquitetura técnica",
            "Otimização de custos de API",
            "Escalabilidade e performance",
            "Compliance e segurança",
        ],
        "cpo": [
            "Priorização de features",
            "Validação de hipóteses",
            "Design de experimentos",
            "Roadmap estratégico",
        ],
        "caio": [
            "Otimização de prompts",
            "Redução de custos AI",
            "Implementação de RAG",
            "Qualidade de respostas",
        ],
        "cmo": [
            "Estratégias de conteúdo",
            "Posicionamento de marca",
            "Growth orgânico",
            "Análise de mercado",
        ],
        "cfo": [
            "Modelagem financeira",
            "Pricing e monetização",
            "Fundraising",
            "Unit economics",
        ],
        "cso": [
            "Estratégias de vendas B2B",
            "Parcerias estratégicas",
            "Playbooks de outreach",
            "Pipeline de leads",
        ],
        "cco": [
            "Estratégias de retenção",
            "Design de onboarding",
            "Suporte ao cliente",
            "Redução de churn",
        ],
        "clo": [
            "Questões de compliance",
            "Proteção de IP",
            "Termos de uso",
            "Gestão de riscos legais",
        ],
    }
    return scenarios.get(persona_id.lower(), [])
