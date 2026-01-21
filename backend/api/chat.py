"""
API routes for contextual AI chat with personas
"""

import time
from fastapi import APIRouter, HTTPException

from config import settings
from models.chat import ChatRequest, ChatResponse, ChatMessage, MessageRole
from models.persona import get_persona, generate_system_prompt

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat_completion(request: ChatRequest) -> ChatResponse:
    """Send a message to the AI with optional persona context."""
    start_time = time.time()

    # Build system prompt
    system_prompt = _build_system_prompt(request)

    # Check if Anthropic API key is configured
    if not settings.anthropic_api_key:
        # Return mock response for development
        return ChatResponse(
            message=_get_mock_response(request),
            persona_id=request.persona_id,
            tokens_used=0,
            processing_time_ms=int((time.time() - start_time) * 1000),
            sources=[],
        )

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        # Build messages
        messages = []
        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.message})

        # Call Claude API
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=request.max_tokens,
            system=system_prompt,
            messages=messages,
        )

        # Extract response
        full_response = ""
        for block in response.content:
            if block.type == "text":
                full_response += block.text

        processing_time = int((time.time() - start_time) * 1000)

        return ChatResponse(
            message=full_response,
            persona_id=request.persona_id,
            tokens_used=response.usage.input_tokens + response.usage.output_tokens,
            processing_time_ms=processing_time,
            sources=_extract_sources(full_response),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")


@router.post("/with-prompt")
async def chat_with_prompt(
    prompt_id: str,
    variables: dict[str, str],
    persona_id: str | None = None,
) -> ChatResponse:
    """Execute a prompt from the library with AI."""
    from models.prompt import get_prompt, render_prompt

    prompt = get_prompt(prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail=f"Prompt '{prompt_id}' not found")

    rendered = render_prompt(prompt, variables)

    request = ChatRequest(
        message=rendered,
        persona_id=persona_id,
        max_tokens=2048,  # Prompts usually need more tokens
    )

    return await chat_completion(request)


def _build_system_prompt(request: ChatRequest) -> str:
    """Build the system prompt based on persona and context."""
    base_prompt = """Você é NeuroAssist, assistente de execução neuroadaptado da plataforma NeuroExecução.

PRINCÍPIOS FUNDAMENTAIS:
1. Sempre considere que o usuário pode ter TDAH
2. Respostas claras e diretas, sem rodeios
3. Use listas e bullets para organização
4. Ofereça próximos passos concretos
5. Cite fontes científicas quando relevante (Barkley, Brown, Biederman)

"""

    # Add persona context if specified
    if request.persona_id:
        persona = get_persona(request.persona_id)
        if persona:
            project_context = None
            if request.project_context:
                project_context = {
                    "name": request.project_context.name,
                    "phase": request.project_context.phase,
                    "active_tasks": request.project_context.active_tasks,
                    "last_checkpoint": request.project_context.last_checkpoint,
                }
            base_prompt = generate_system_prompt(persona, project_context)

    # Add project context if available
    if request.project_context and not request.persona_id:
        base_prompt += f"""
[CONTEXTO DO PROJETO]
Projeto: {request.project_context.name}
Fase: {request.project_context.phase}
Tarefas ativas: {request.project_context.active_tasks}
Briefing: {request.project_context.briefing[:500] if request.project_context.briefing else 'N/A'}
"""

    return base_prompt


def _get_mock_response(request: ChatRequest) -> str:
    """Return a mock response for development without API key."""
    if request.persona_id:
        persona = get_persona(request.persona_id)
        if persona:
            return f"""[Resposta do {persona.full_title}]

Olá! Sou o {persona.name} da equipe NeuroExecução.

**Nota:** Esta é uma resposta de desenvolvimento. Configure a variável ANTHROPIC_API_KEY para respostas reais.

Minha especialidade inclui: {', '.join(persona.expertise[:5])}

Como posso ajudar com: {request.message[:100]}...?"""

    return f"""[NeuroAssist - Modo Desenvolvimento]

Recebi sua mensagem: "{request.message[:100]}..."

**Nota:** Configure ANTHROPIC_API_KEY no arquivo .env para habilitar respostas de IA.

Enquanto isso, você pode:
1. Explorar os endpoints de personas: /api/ai/personas
2. Ver a biblioteca de prompts: /api/ai/prompts
3. Testar o framework de validação: /api/ai/validation"""


def _extract_sources(response: str) -> list[str]:
    """Extract cited sources from AI response."""
    sources = []
    # Simple extraction for common citation patterns
    import re

    # Pattern: (Author, Year) or Author (Year)
    patterns = [
        r"\(([A-Z][a-z]+(?:\s*(?:et al\.?|&|,)\s*[A-Z][a-z]+)*),?\s*(\d{4})\)",
        r"([A-Z][a-z]+(?:\s*(?:et al\.?|&|,)\s*[A-Z][a-z]+)*)\s*\((\d{4})\)",
    ]

    for pattern in patterns:
        matches = re.findall(pattern, response)
        for match in matches:
            author, year = match
            source = f"{author} ({year})"
            if source not in sources:
                sources.append(source)

    return sources
