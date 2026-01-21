"""
Chat models for contextual AI conversations
"""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    """Message role in conversation."""

    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    """Individual chat message."""

    role: MessageRole = Field(..., description="Message role")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    persona_id: str | None = Field(None, description="Persona context if applicable")

    class Config:
        use_enum_values = True


class ProjectContext(BaseModel):
    """Project context for chat."""

    id: str | None = Field(None, description="Project ID")
    name: str = Field(default="", description="Project name")
    phase: str = Field(default="", description="Current phase")
    active_tasks: int = Field(default=0, description="Number of active tasks")
    last_checkpoint: str = Field(default="", description="Last checkpoint info")
    briefing: str = Field(default="", description="Project briefing")


class ChatRequest(BaseModel):
    """Request for chat completion."""

    message: str = Field(..., description="User message")
    persona_id: str | None = Field(None, description="C-Level persona to consult")
    history: list[ChatMessage] = Field(default_factory=list, description="Conversation history")
    project_context: ProjectContext | None = Field(None, description="Project context")
    max_tokens: int = Field(default=1024, description="Max response tokens")


class ChatResponse(BaseModel):
    """Response from chat completion."""

    message: str = Field(..., description="AI response")
    persona_id: str | None = Field(None, description="Persona that responded")
    tokens_used: int = Field(default=0, description="Tokens consumed")
    processing_time_ms: int = Field(default=0, description="Processing time")
    sources: list[str] = Field(default_factory=list, description="Sources cited if any")
