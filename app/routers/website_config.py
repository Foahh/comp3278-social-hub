from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["config"])


@router.get("/api/config")
async def website_config() -> dict:
    """Public configuration for the SPA (chat models, defaults)."""
    models = settings.chat_model_catalog()
    default_model = settings.default_chat_model_id()
    return {
        "chat": {
            "models": models,
            "defaultModel": default_model,
        },
    }
