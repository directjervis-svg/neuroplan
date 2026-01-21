"""
TDAH-specific models based on Barkley, Brown, and Biederman research
"""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class TaskEffortType(str, Enum):
    """Task categorization by cognitive effort (Brown Cluster 3)."""

    ACTION = "action"  # Create something new, requires high focus
    RETENTION = "retention"  # Maintain something existing, medium focus
    MAINTENANCE = "maintenance"  # Routine tasks, low effort


class EnergyLevel(str, Enum):
    """Required energy level for task."""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TimerType(str, Enum):
    """Timer type preference."""

    PROGRESSIVE = "progressive"  # Count-up (recommended for TDAH - Barkley)
    COUNTDOWN = "countdown"  # Traditional countdown


class Task(BaseModel):
    """Task model with TDAH-specific attributes."""

    id: str = Field(..., description="Task ID")
    title: str = Field(..., description="Task title")
    description: str = Field(default="", description="Task description")
    effort_type: TaskEffortType = Field(..., description="Type of cognitive effort")
    estimated_minutes: int = Field(default=25, description="Estimated duration")
    energy_level: EnergyLevel = Field(..., description="Required energy level")
    dependencies: list[str] = Field(default_factory=list, description="Task IDs this depends on")
    first_action: str = Field(default="", description="First concrete action to start")
    completed: bool = Field(default=False)
    completed_at: datetime | None = None

    class Config:
        use_enum_values = True


class TimerSession(BaseModel):
    """Progressive timer session (Barkley principle: show time worked, not remaining)."""

    id: str = Field(..., description="Session ID")
    task_id: str | None = Field(None, description="Associated task")
    timer_type: TimerType = Field(default=TimerType.PROGRESSIVE)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: datetime | None = None
    elapsed_seconds: int = Field(default=0, description="Total seconds worked")
    pause_count: int = Field(default=0, description="Number of pauses")
    is_running: bool = Field(default=False)

    class Config:
        use_enum_values = True


class ActivityLog(BaseModel):
    """Activity log for "Where I Left Off" feature (Brown Cluster 5: Memory)."""

    id: str = Field(..., description="Log ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    action: str = Field(..., description="Action performed")
    context: str = Field(default="", description="Context/details")
    project_id: str | None = Field(None, description="Associated project")
    task_id: str | None = Field(None, description="Associated task")


class WhereILeftOff(BaseModel):
    """Where I Left Off panel data - memory externalization (Barkley)."""

    recent_activities: list[ActivityLog] = Field(
        default_factory=list, description="Last 3 activities"
    )
    last_task: Task | None = Field(None, description="Last task worked on")
    last_project: str | None = Field(None, description="Last project accessed")
    time_since_last_activity: str = Field(default="", description="Human-readable time")
    suggested_next_action: str = Field(default="", description="AI-suggested next step")


class DailyPlan(BaseModel):
    """Daily plan following Barkley's max 3 tasks rule."""

    date: datetime = Field(default_factory=datetime.utcnow)
    tasks: list[Task] = Field(
        default_factory=list, max_length=3, description="Max 3 tasks per day"
    )
    energy_peak_time: str = Field(
        default="09:00-12:00", description="Medication peak time for ACTION tasks"
    )
    completed_count: int = Field(default=0)

    def add_task(self, task: Task) -> bool:
        """Add task if under limit. Returns False if at capacity."""
        if len(self.tasks) >= 3:
            return False
        self.tasks.append(task)
        return True


class WeeklyOverview(BaseModel):
    """Weekly overview for planning (max 3 days ahead - Barkley temporal myopia)."""

    days: list[DailyPlan] = Field(default_factory=list, max_length=7)
    focus_project: str | None = Field(None, description="Main project for the week")
    weekly_goal: str = Field(default="", description="One clear weekly goal")


# Scientific citations for TDAH features
TDAH_CITATIONS = {
    "barkley-temporal": {
        "author": "Barkley, R. A.",
        "year": 2010,
        "title": "Taking Charge of Adult ADHD",
        "source": "New York: Guilford Press",
        "concept": "Temporal myopia - difficulty projecting future consequences",
        "application": "Use 3-day cycles instead of 30-day planning",
    },
    "barkley-externalization": {
        "author": "Barkley, R. A.",
        "year": 2012,
        "title": "Executive Functions: What They Are, How They Work, and Why They Evolved",
        "source": "New York: Guilford Press",
        "concept": "Externalization of working memory",
        "application": "Visual dashboard, 'Where I Left Off' panel",
    },
    "barkley-rewards": {
        "author": "Barkley, R. A.",
        "year": 2015,
        "title": "Attention-Deficit Hyperactivity Disorder: A Handbook for Diagnosis and Treatment",
        "source": "New York: Guilford Press",
        "concept": "Immediate rewards over delayed consequences",
        "application": "Gamification with instant XP feedback",
    },
    "brown-clusters": {
        "author": "Brown, T. E.",
        "year": 2013,
        "title": "A New Understanding of ADHD in Children and Adults",
        "source": "London: Routledge",
        "concept": "6 clusters of executive functions",
        "application": "Task categorization by effort type",
    },
    "brown-activation": {
        "author": "Brown, T. E.",
        "year": 2013,
        "title": "A New Understanding of ADHD in Children and Adults",
        "source": "London: Routledge",
        "concept": "Activation cluster - difficulty starting tasks",
        "application": "'Start Now' 10-minute block with first_action",
    },
    "brown-emotion": {
        "author": "Brown, T. E.",
        "year": 2014,
        "title": "Smart but Stuck: Emotions in Teens and Adults with ADHD",
        "source": "San Francisco: Jossey-Bass",
        "concept": "Emotional dysregulation in ADHD",
        "application": "Gentle language, anti-guilt messaging",
    },
    "biederman-comorbidity": {
        "author": "Biederman, J., Mick, E., & Faraone, S. V.",
        "year": 2000,
        "title": "Age-Dependent Decline of Symptoms of ADHD",
        "source": "American Journal of Psychiatry, 157(5), 816-818",
        "concept": "50-60% comorbid anxiety, 30-40% depression",
        "application": "Progressive timer (reduces anxiety), ethical gamification",
    },
    "cast-dua": {
        "author": "CAST",
        "year": 2020,
        "title": "Universal Design for Learning Guidelines version 2.2",
        "source": "https://udlguidelines.cast.org",
        "concept": "Multiple means of representation, action, engagement",
        "application": "Text + icons + colors, keyboard + mouse + voice input",
    },
}


def get_citation(key: str) -> dict | None:
    """Get a scientific citation by key."""
    return TDAH_CITATIONS.get(key)


def format_citation(key: str) -> str:
    """Format a citation for display."""
    cite = TDAH_CITATIONS.get(key)
    if not cite:
        return ""
    return f"{cite['author']} ({cite['year']}). {cite['title']}. {cite['source']}."
