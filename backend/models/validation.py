"""
Validation Coefficient (CV) models for feature/idea validation
Based on the 7-variable validation framework
"""

from enum import Enum
from pydantic import BaseModel, Field


class ValidationRecommendation(str, Enum):
    """Recommendation based on CV score."""

    PRIORITIZE = "PRIORITIZE"  # CV >= 7.0
    REFINE = "REFINE"  # CV 5.0-6.9
    DISCARD = "DISCARD"  # CV < 5.0


class ValidationVariable(BaseModel):
    """Individual validation variable with score and justification."""

    id: str = Field(..., description="Variable identifier (V1-V7)")
    name: str = Field(..., description="Variable name")
    weight: float = Field(..., description="Weight in final calculation (0-1)")
    score: float = Field(default=0, ge=0, le=10, description="Score from 0-10")
    justification: str = Field(default="", description="Reasoning for score")
    sources: list[str] = Field(default_factory=list, description="Sources cited")


class ValidationInput(BaseModel):
    """Input for validation analysis."""

    idea_description: str = Field(..., description="Description of idea/feature to validate")
    target_audience: str = Field(default="Adultos com TDAH", description="Target audience")
    existing_evidence: list[str] = Field(
        default_factory=list, description="Any existing evidence or research"
    )
    context: str = Field(default="", description="Additional context")


class ValidationScore(BaseModel):
    """Complete validation score with all variables."""

    idea: str = Field(..., description="The validated idea")

    # Individual variable scores
    v1_pain_points: ValidationVariable = Field(
        default_factory=lambda: ValidationVariable(
            id="V1",
            name="Dores TDAH",
            weight=0.25,
        ),
        description="ADHD pain points score",
    )
    v2_scientific_basis: ValidationVariable = Field(
        default_factory=lambda: ValidationVariable(
            id="V2",
            name="Base Científica",
            weight=0.20,
        ),
        description="Scientific foundation score",
    )
    v3_search_volume: ValidationVariable = Field(
        default_factory=lambda: ValidationVariable(
            id="V3",
            name="Volume de Busca",
            weight=0.15,
        ),
        description="Search volume score",
    )
    v4_market_gap: ValidationVariable = Field(
        default_factory=lambda: ValidationVariable(
            id="V4",
            name="Gap de Mercado",
            weight=0.15,
        ),
        description="Market gap score",
    )
    v5_technical_viability: ValidationVariable = Field(
        default_factory=lambda: ValidationVariable(
            id="V5",
            name="Viabilidade Técnica",
            weight=0.10,
        ),
        description="Technical viability score",
    )
    v6_persona_fit: ValidationVariable = Field(
        default_factory=lambda: ValidationVariable(
            id="V6",
            name="Fit com Personas",
            weight=0.10,
        ),
        description="Persona fit score",
    )
    v7_monetization: ValidationVariable = Field(
        default_factory=lambda: ValidationVariable(
            id="V7",
            name="Potencial Monetização",
            weight=0.05,
        ),
        description="Monetization potential score",
    )

    # Calculated fields
    total_cv: float = Field(default=0, description="Final CV score (weighted average)")
    recommendation: ValidationRecommendation = Field(
        default=ValidationRecommendation.DISCARD,
        description="Recommendation based on CV",
    )
    reasoning: str = Field(default="", description="Overall reasoning for recommendation")
    next_steps: list[str] = Field(default_factory=list, description="Suggested next steps")

    def calculate_cv(self) -> float:
        """Calculate the validation coefficient from individual scores."""
        cv = (
            self.v1_pain_points.score * self.v1_pain_points.weight
            + self.v2_scientific_basis.score * self.v2_scientific_basis.weight
            + self.v3_search_volume.score * self.v3_search_volume.weight
            + self.v4_market_gap.score * self.v4_market_gap.weight
            + self.v5_technical_viability.score * self.v5_technical_viability.weight
            + self.v6_persona_fit.score * self.v6_persona_fit.weight
            + self.v7_monetization.score * self.v7_monetization.weight
        )
        self.total_cv = round(cv, 2)

        # Set recommendation based on score
        if self.total_cv >= 7.0:
            self.recommendation = ValidationRecommendation.PRIORITIZE
        elif self.total_cv >= 5.0:
            self.recommendation = ValidationRecommendation.REFINE
        else:
            self.recommendation = ValidationRecommendation.DISCARD

        return self.total_cv


class ValidationResponse(BaseModel):
    """Response from validation analysis."""

    success: bool = Field(default=True)
    validation: ValidationScore | None = None
    error: str | None = None


# Variable definitions for reference
VALIDATION_VARIABLES = [
    {
        "id": "V1",
        "name": "Dores TDAH",
        "weight": 0.25,
        "description": "Frequência e intensidade da dor no público TDAH",
        "sources": ["Reddit r/ADHD", "Grupos Facebook TDAH Brasil", "Fóruns especializados"],
        "criteria": [
            "Alta frequência de menções",
            "Intensidade emocional nas reclamações",
            "Consistência entre diferentes fontes",
        ],
    },
    {
        "id": "V2",
        "name": "Base Científica",
        "weight": 0.20,
        "description": "Suporte científico para a abordagem proposta",
        "sources": ["PubMed", "Google Scholar", "Livros Barkley/Brown/Biederman"],
        "criteria": [
            "Estudos peer-reviewed",
            "Alinhamento com autoridades da área",
            "Evidência de eficácia",
        ],
    },
    {
        "id": "V3",
        "name": "Volume de Busca",
        "weight": 0.15,
        "description": "Demanda de mercado medida por buscas",
        "sources": ["Google Trends", "SEMrush", "Keyword Planner"],
        "criteria": [
            "Volume mensal de buscas",
            "Tendência de crescimento",
            "Sazonalidade",
        ],
    },
    {
        "id": "V4",
        "name": "Gap de Mercado",
        "weight": 0.15,
        "description": "Oportunidade não atendida por concorrentes",
        "sources": ["Análise competitiva", "Reviews de apps", "Feature comparisons"],
        "criteria": [
            "Feature inexistente em concorrentes",
            "Implementação superior possível",
            "Diferenciação clara",
        ],
    },
    {
        "id": "V5",
        "name": "Viabilidade Técnica",
        "weight": 0.10,
        "description": "Facilidade de implementação",
        "sources": ["Avaliação técnica interna", "Benchmarks de desenvolvimento"],
        "criteria": [
            "Complexidade baixa/média",
            "Tecnologia disponível",
            "Tempo de desenvolvimento razoável",
        ],
    },
    {
        "id": "V6",
        "name": "Fit com Personas",
        "weight": 0.10,
        "description": "Alinhamento com público-alvo definido",
        "sources": ["Pesquisas com usuários", "Personas documentadas"],
        "criteria": [
            "Resolve problema real das personas",
            "Adequado ao contexto de uso",
            "Linguagem e UX apropriados",
        ],
    },
    {
        "id": "V7",
        "name": "Potencial Monetização",
        "weight": 0.05,
        "description": "Capacidade de gerar receita",
        "sources": ["Benchmarks de pricing", "Willingness to pay"],
        "criteria": [
            "Diferencial pagável",
            "Não é table stakes",
            "Mencionável em marketing",
        ],
    },
]
