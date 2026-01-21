"""
API routes for TDAH-specific features
Based on Barkley, Brown, and Biederman research
"""

from datetime import datetime, timedelta
from uuid import uuid4
from fastapi import APIRouter, HTTPException

from models.tdah import (
    Task,
    TaskEffortType,
    EnergyLevel,
    TimerSession,
    TimerType,
    ActivityLog,
    WhereILeftOff,
    DailyPlan,
    WeeklyOverview,
    TDAH_CITATIONS,
    get_citation,
    format_citation,
)

router = APIRouter()

# In-memory storage for demo (replace with database in production)
_timer_sessions: dict[str, TimerSession] = {}
_activity_logs: list[ActivityLog] = []
_daily_plans: dict[str, DailyPlan] = {}


# === Timer Endpoints (Barkley: Progressive Timer) ===


@router.post("/timer/start", response_model=TimerSession)
async def start_timer(
    task_id: str | None = None,
    timer_type: TimerType = TimerType.PROGRESSIVE,
) -> TimerSession:
    """Start a new timer session (progressive/count-up recommended for TDAH)."""
    session = TimerSession(
        id=str(uuid4()),
        task_id=task_id,
        timer_type=timer_type,
        started_at=datetime.utcnow(),
        is_running=True,
    )
    _timer_sessions[session.id] = session

    # Log activity
    _log_activity(
        action=f"Iniciou timer {timer_type}",
        context=f"Tarefa: {task_id or 'Sem tarefa associada'}",
        task_id=task_id,
    )

    return session


@router.post("/timer/{session_id}/pause", response_model=TimerSession)
async def pause_timer(session_id: str) -> TimerSession:
    """Pause an active timer session."""
    session = _timer_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Timer session not found")

    if not session.is_running:
        raise HTTPException(status_code=400, detail="Timer is already paused")

    # Calculate elapsed time
    now = datetime.utcnow()
    elapsed = (now - session.started_at).total_seconds()
    session.elapsed_seconds += int(elapsed)
    session.pause_count += 1
    session.is_running = False

    _log_activity(
        action="Pausou timer",
        context=f"Tempo trabalhado: {_format_time(session.elapsed_seconds)}",
        task_id=session.task_id,
    )

    return session


@router.post("/timer/{session_id}/resume", response_model=TimerSession)
async def resume_timer(session_id: str) -> TimerSession:
    """Resume a paused timer session."""
    session = _timer_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Timer session not found")

    if session.is_running:
        raise HTTPException(status_code=400, detail="Timer is already running")

    session.started_at = datetime.utcnow()
    session.is_running = True

    _log_activity(
        action="Retomou timer",
        context=f"Pausas: {session.pause_count}",
        task_id=session.task_id,
    )

    return session


@router.post("/timer/{session_id}/stop", response_model=TimerSession)
async def stop_timer(session_id: str) -> TimerSession:
    """Stop and finalize a timer session."""
    session = _timer_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Timer session not found")

    now = datetime.utcnow()
    if session.is_running:
        elapsed = (now - session.started_at).total_seconds()
        session.elapsed_seconds += int(elapsed)

    session.ended_at = now
    session.is_running = False

    _log_activity(
        action="Finalizou sessão de foco",
        context=f"Total: {_format_time(session.elapsed_seconds)}",
        task_id=session.task_id,
    )

    return session


@router.get("/timer/{session_id}", response_model=TimerSession)
async def get_timer(session_id: str) -> TimerSession:
    """Get current timer status."""
    session = _timer_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Timer session not found")

    # Update elapsed time if running
    if session.is_running:
        now = datetime.utcnow()
        elapsed = (now - session.started_at).total_seconds()
        session.elapsed_seconds = int(elapsed)

    return session


# === Where I Left Off Endpoints (Brown Cluster 5: Memory) ===


@router.get("/where-i-left-off", response_model=WhereILeftOff)
async def get_where_i_left_off() -> WhereILeftOff:
    """Get the 'Where I Left Off' panel data for immediate context recovery."""
    recent = _activity_logs[-3:] if _activity_logs else []
    recent.reverse()  # Most recent first

    # Calculate time since last activity
    time_since = ""
    if recent:
        last_time = recent[0].timestamp
        delta = datetime.utcnow() - last_time
        time_since = _format_relative_time(delta)

    return WhereILeftOff(
        recent_activities=recent,
        time_since_last_activity=time_since,
        suggested_next_action=_suggest_next_action(recent),
    )


@router.post("/activity-log")
async def log_activity(
    action: str,
    context: str = "",
    project_id: str | None = None,
    task_id: str | None = None,
) -> ActivityLog:
    """Log an activity for the 'Where I Left Off' feature."""
    log = _log_activity(action, context, project_id, task_id)
    return log


# === Task Management Endpoints (Brown Cluster 3: Effort) ===


@router.post("/tasks/categorize")
async def categorize_task(
    title: str,
    description: str = "",
) -> dict:
    """Suggest task categorization based on description."""
    # Simple heuristic - in production, use AI
    effort_type = _suggest_effort_type(title, description)
    energy_level = _suggest_energy_level(effort_type)

    return {
        "title": title,
        "suggested_effort_type": effort_type,
        "suggested_energy_level": energy_level,
        "explanation": _get_categorization_explanation(effort_type),
        "scientific_basis": format_citation("brown-clusters"),
    }


@router.get("/tasks/effort-types")
async def get_effort_types() -> dict:
    """Get explanation of effort types (Brown Cluster 3)."""
    return {
        "effort_types": [
            {
                "type": TaskEffortType.ACTION,
                "name": "Ação",
                "description": "Criar algo novo, requer alto foco",
                "when_to_schedule": "Durante pico de medicação/energia",
                "examples": ["Escrever código novo", "Criar documento", "Reunião importante"],
                "max_per_day": 1,
            },
            {
                "type": TaskEffortType.RETENTION,
                "name": "Retenção",
                "description": "Manter algo existente, foco médio",
                "when_to_schedule": "Período intermediário do dia",
                "examples": ["Revisar documento", "Responder emails", "Atualizar planilha"],
                "max_per_day": 2,
            },
            {
                "type": TaskEffortType.MAINTENANCE,
                "name": "Manutenção",
                "description": "Tarefas rotineiras, baixo esforço",
                "when_to_schedule": "Período de baixa energia / rebote",
                "examples": ["Organizar arquivos", "Backup", "Limpar inbox"],
                "max_per_day": 3,
            },
        ],
        "scientific_basis": get_citation("brown-clusters"),
    }


# === Daily Planning Endpoints (Barkley: Max 3 Tasks) ===


@router.get("/daily-plan")
async def get_daily_plan(date: str | None = None) -> DailyPlan:
    """Get the daily plan (max 3 tasks per Barkley)."""
    plan_date = date or datetime.utcnow().strftime("%Y-%m-%d")
    plan = _daily_plans.get(plan_date)

    if not plan:
        plan = DailyPlan(date=datetime.utcnow())
        _daily_plans[plan_date] = plan

    return plan


@router.post("/daily-plan/add-task")
async def add_task_to_daily_plan(
    date: str,
    task: Task,
) -> dict:
    """Add a task to the daily plan (enforces max 3 rule)."""
    plan = _daily_plans.get(date)
    if not plan:
        plan = DailyPlan(date=datetime.fromisoformat(date))
        _daily_plans[date] = plan

    if len(plan.tasks) >= 3:
        raise HTTPException(
            status_code=400,
            detail="Máximo de 3 tarefas por dia (princípio de Barkley). Remova uma tarefa primeiro.",
        )

    plan.tasks.append(task)

    return {
        "success": True,
        "tasks_count": len(plan.tasks),
        "remaining_slots": 3 - len(plan.tasks),
        "scientific_basis": "Barkley (2010): Miopia temporal - ciclos curtos são mais efetivos",
    }


# === Scientific Citations ===


@router.get("/citations")
async def get_all_citations() -> dict:
    """Get all TDAH scientific citations."""
    return {"citations": TDAH_CITATIONS}


@router.get("/citations/{key}")
async def get_citation_by_key(key: str) -> dict:
    """Get a specific citation."""
    citation = get_citation(key)
    if not citation:
        raise HTTPException(
            status_code=404,
            detail=f"Citation '{key}' not found. Available: {list(TDAH_CITATIONS.keys())}",
        )
    return {"key": key, "citation": citation, "formatted": format_citation(key)}


# === Helper Functions ===


def _log_activity(
    action: str,
    context: str = "",
    project_id: str | None = None,
    task_id: str | None = None,
) -> ActivityLog:
    """Log an activity and return the log entry."""
    log = ActivityLog(
        id=str(uuid4()),
        timestamp=datetime.utcnow(),
        action=action,
        context=context,
        project_id=project_id,
        task_id=task_id,
    )
    _activity_logs.append(log)

    # Keep only last 100 logs
    if len(_activity_logs) > 100:
        _activity_logs.pop(0)

    return log


def _format_time(seconds: int) -> str:
    """Format seconds as Xh Xm Xs."""
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60

    if h > 0:
        return f"{h}h {m}m {s}s"
    elif m > 0:
        return f"{m}m {s}s"
    else:
        return f"{s}s"


def _format_relative_time(delta: timedelta) -> str:
    """Format timedelta as relative time."""
    seconds = int(delta.total_seconds())

    if seconds < 60:
        return "agora mesmo"
    elif seconds < 3600:
        minutes = seconds // 60
        return f"há {minutes} minuto{'s' if minutes > 1 else ''}"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"há {hours} hora{'s' if hours > 1 else ''}"
    else:
        days = seconds // 86400
        return f"há {days} dia{'s' if days > 1 else ''}"


def _suggest_effort_type(title: str, description: str) -> TaskEffortType:
    """Suggest effort type based on task content."""
    text = (title + " " + description).lower()

    action_keywords = ["criar", "escrever", "desenvolver", "implementar", "novo", "design"]
    retention_keywords = ["revisar", "atualizar", "responder", "ajustar", "melhorar"]
    maintenance_keywords = ["organizar", "limpar", "backup", "arquivar", "deletar"]

    for keyword in action_keywords:
        if keyword in text:
            return TaskEffortType.ACTION

    for keyword in retention_keywords:
        if keyword in text:
            return TaskEffortType.RETENTION

    for keyword in maintenance_keywords:
        if keyword in text:
            return TaskEffortType.MAINTENANCE

    return TaskEffortType.RETENTION  # Default to medium effort


def _suggest_energy_level(effort_type: TaskEffortType) -> EnergyLevel:
    """Suggest energy level based on effort type."""
    mapping = {
        TaskEffortType.ACTION: EnergyLevel.HIGH,
        TaskEffortType.RETENTION: EnergyLevel.MEDIUM,
        TaskEffortType.MAINTENANCE: EnergyLevel.LOW,
    }
    return mapping.get(effort_type, EnergyLevel.MEDIUM)


def _get_categorization_explanation(effort_type: TaskEffortType) -> str:
    """Get explanation for task categorization."""
    explanations = {
        TaskEffortType.ACTION: "Esta tarefa requer criação/foco alto. Agende para seu horário de pico de energia.",
        TaskEffortType.RETENTION: "Esta tarefa mantém algo existente. Pode ser feita em energia média.",
        TaskEffortType.MAINTENANCE: "Esta tarefa é rotineira. Ideal para momentos de baixa energia.",
    }
    return explanations.get(effort_type, "")


def _suggest_next_action(recent_activities: list[ActivityLog]) -> str:
    """Suggest next action based on recent activity."""
    if not recent_activities:
        return "Comece definindo as 3 tarefas do dia (máximo)"

    last = recent_activities[0]

    if "timer" in last.action.lower():
        return "Revise o que foi feito e registre um checkpoint"
    elif "checkpoint" in last.action.lower():
        return "Escolha a próxima tarefa da sua lista"
    else:
        return "Continue de onde parou ou inicie um novo timer de foco"
