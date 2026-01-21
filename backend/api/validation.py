"""
API routes for the Validation Coefficient (CV) framework
"""

from fastapi import APIRouter, HTTPException

from models.validation import (
    ValidationInput,
    ValidationScore,
    ValidationResponse,
    ValidationVariable,
    ValidationRecommendation,
    VALIDATION_VARIABLES,
)

router = APIRouter()


@router.get("/variables")
async def get_validation_variables() -> dict:
    """Get the validation framework variables and weights."""
    return {
        "variables": VALIDATION_VARIABLES,
        "formula": "CV = (V1×0.25) + (V2×0.20) + (V3×0.15) + (V4×0.15) + (V5×0.10) + (V6×0.10) + (V7×0.05)",
        "thresholds": {
            "PRIORITIZE": {"min": 7.0, "description": "Executar imediatamente"},
            "REFINE": {"min": 5.0, "max": 6.9, "description": "Ajustar e retestar"},
            "DISCARD": {"max": 4.9, "description": "Não investir tempo"},
        },
    }


@router.post("/calculate", response_model=ValidationResponse)
async def calculate_validation(scores: dict) -> ValidationResponse:
    """Calculate CV from provided scores."""
    try:
        # Create validation score from input
        validation = ValidationScore(
            idea=scores.get("idea", "Ideia não especificada"),
            v1_pain_points=ValidationVariable(
                id="V1",
                name="Dores TDAH",
                weight=0.25,
                score=scores.get("v1", 0),
                justification=scores.get("v1_justification", ""),
            ),
            v2_scientific_basis=ValidationVariable(
                id="V2",
                name="Base Científica",
                weight=0.20,
                score=scores.get("v2", 0),
                justification=scores.get("v2_justification", ""),
            ),
            v3_search_volume=ValidationVariable(
                id="V3",
                name="Volume de Busca",
                weight=0.15,
                score=scores.get("v3", 0),
                justification=scores.get("v3_justification", ""),
            ),
            v4_market_gap=ValidationVariable(
                id="V4",
                name="Gap de Mercado",
                weight=0.15,
                score=scores.get("v4", 0),
                justification=scores.get("v4_justification", ""),
            ),
            v5_technical_viability=ValidationVariable(
                id="V5",
                name="Viabilidade Técnica",
                weight=0.10,
                score=scores.get("v5", 0),
                justification=scores.get("v5_justification", ""),
            ),
            v6_persona_fit=ValidationVariable(
                id="V6",
                name="Fit com Personas",
                weight=0.10,
                score=scores.get("v6", 0),
                justification=scores.get("v6_justification", ""),
            ),
            v7_monetization=ValidationVariable(
                id="V7",
                name="Potencial Monetização",
                weight=0.05,
                score=scores.get("v7", 0),
                justification=scores.get("v7_justification", ""),
            ),
        )

        # Calculate CV
        cv = validation.calculate_cv()

        # Generate reasoning
        validation.reasoning = _generate_reasoning(validation)
        validation.next_steps = _generate_next_steps(validation)

        return ValidationResponse(success=True, validation=validation)

    except Exception as e:
        return ValidationResponse(success=False, error=str(e))


@router.post("/analyze", response_model=ValidationResponse)
async def analyze_idea(input_data: ValidationInput) -> ValidationResponse:
    """Analyze an idea and suggest scores (requires AI integration)."""
    # This endpoint would integrate with Claude API to analyze the idea
    # For now, return a template response

    return ValidationResponse(
        success=True,
        validation=ValidationScore(
            idea=input_data.idea_description,
            reasoning="Para análise completa, use o endpoint /api/ai/chat com o prompt VAL-001",
            next_steps=[
                "Use o prompt VAL-001 (Coeficiente de Validação) no chat",
                "Forneça a descrição da ideia como variável",
                "Revise os scores sugeridos e ajuste se necessário",
            ],
        ),
    )


@router.get("/example")
async def get_validation_example() -> dict:
    """Get an example of a completed validation."""
    return {
        "example": {
            "idea": "Timer Progressivo (count-up) vs Countdown",
            "scores": {
                "v1": {
                    "score": 9,
                    "justification": "47 menções no Reddit r/ADHD sobre 'countdown causa ansiedade'. Alta intensidade emocional.",
                },
                "v2": {
                    "score": 8,
                    "justification": "Barkley (2015): 'Recompensas imediatas > penalidades futuras'. Brown (2013): 'Monitoring requer feedback visual'.",
                },
                "v3": {
                    "score": 6,
                    "justification": "'timer pomodoro TDAH': 880 buscas/mês. 'countdown anxiety': 1.2K buscas/mês.",
                },
                "v4": {
                    "score": 9,
                    "justification": "Tiimo, Inflow, Focusmate: todos usam countdown. Nenhum tem count-up como opção.",
                },
                "v5": {
                    "score": 10,
                    "justification": "Implementação trivial com setInterval(). Zero dependências externas.",
                },
                "v6": {
                    "score": 8,
                    "justification": "Adulto TDAH 25-50 com ansiedade: reduz estresse. Diagnosticado tardio: ferramenta profissional.",
                },
                "v7": {
                    "score": 7,
                    "justification": "Feature diferenciadora (não table stake). Mencionável em marketing.",
                },
            },
            "cv": 8.25,
            "recommendation": "PRIORITIZE",
            "reasoning": "Score excelente. Timer progressivo atende dor real (ansiedade) com base científica sólida e implementação simples.",
        }
    }


def _generate_reasoning(validation: ValidationScore) -> str:
    """Generate reasoning based on scores."""
    cv = validation.total_cv

    if cv >= 8.0:
        return f"Score excelente ({cv}/10). Ideia fortemente validada. Recomendado priorizar no MVP."
    elif cv >= 7.0:
        return f"Score muito bom ({cv}/10). Ideia validada. Considerar para próximo sprint."
    elif cv >= 6.0:
        return f"Score moderado ({cv}/10). Potencial existe mas precisa refinamento. Revisar pontos fracos."
    elif cv >= 5.0:
        return f"Score limítrofe ({cv}/10). Ideia tem mérito mas riscos significativos. Validar mais antes de investir."
    else:
        return f"Score baixo ({cv}/10). Não recomendado investir tempo. Considerar pivotar ou descartar."


def _generate_next_steps(validation: ValidationScore) -> list[str]:
    """Generate next steps based on validation results."""
    steps = []
    cv = validation.total_cv

    # Find weakest variables
    variables = [
        ("Dores TDAH", validation.v1_pain_points.score),
        ("Base Científica", validation.v2_scientific_basis.score),
        ("Volume de Busca", validation.v3_search_volume.score),
        ("Gap de Mercado", validation.v4_market_gap.score),
        ("Viabilidade Técnica", validation.v5_technical_viability.score),
        ("Fit com Personas", validation.v6_persona_fit.score),
        ("Monetização", validation.v7_monetization.score),
    ]
    variables.sort(key=lambda x: x[1])
    weakest = variables[:2]

    if cv >= 7.0:
        steps.append("Adicionar ao roadmap de desenvolvimento")
        steps.append("Definir especificação técnica detalhada")
        steps.append("Planejar A/B test para validação quantitativa")
    elif cv >= 5.0:
        for var_name, score in weakest:
            if score < 6:
                steps.append(f"Investigar mais: {var_name} (score {score}/10)")
        steps.append("Validar com 5 usuários antes de desenvolver")
    else:
        steps.append("Descartar ou pivotar significativamente")
        steps.append("Analisar o que funcionaria melhor para o público")

    return steps
