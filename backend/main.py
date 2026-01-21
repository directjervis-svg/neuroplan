"""
NeuroExecução Backend - AI Intelligence Services
FastAPI application for C-Level personas, prompt library, and TDAH features
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import personas, prompts, validation, chat, tdah
from config import settings

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan events."""
    logger.info("Starting NeuroExecução AI Backend", version="1.0.0")
    yield
    logger.info("Shutting down NeuroExecução AI Backend")


app = FastAPI(
    title="NeuroExecução AI Backend",
    description="AI-Powered Execution Platform for ADHD Adults",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(personas.router, prefix="/api/ai/personas", tags=["Personas"])
app.include_router(prompts.router, prefix="/api/ai/prompts", tags=["Prompts"])
app.include_router(validation.router, prefix="/api/ai/validation", tags=["Validation"])
app.include_router(chat.router, prefix="/api/ai/chat", tags=["Chat"])
app.include_router(tdah.router, prefix="/api/ai/tdah", tags=["TDAH Features"])


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "neuroexecucao-ai",
        "version": "1.0.0",
    }


@app.get("/")
async def root() -> dict:
    """Root endpoint with API info."""
    return {
        "name": "NeuroExecução AI Backend",
        "version": "1.0.0",
        "description": "AI-Powered Execution Platform for ADHD Adults",
        "endpoints": {
            "personas": "/api/ai/personas",
            "prompts": "/api/ai/prompts",
            "validation": "/api/ai/validation",
            "chat": "/api/ai/chat",
            "tdah": "/api/ai/tdah",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
