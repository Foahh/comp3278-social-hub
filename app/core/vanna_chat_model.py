"""Per-request LLM model selection for Vanna chat (metadata.model → OpenAI payload)."""

from __future__ import annotations

from contextvars import ContextVar, Token
from typing import Any

from vanna.core.llm import LlmRequest
from vanna.core.middleware import LlmMiddleware
from vanna.integrations.openai import OpenAILlmService
from vanna.servers.base import ChatHandler
from vanna.servers.base.models import ChatRequest

from app.core.config import settings

# Set for the duration of a single chat SSE / poll request.
_llm_model_override: ContextVar[str | None] = ContextVar("llm_model_override", default=None)


class MetadataOpenAILlmService(OpenAILlmService):
    """Uses LlmRequest.metadata[\"model\"] when present (injected by middleware)."""

    def _build_payload(self, request: LlmRequest) -> dict[str, Any]:
        payload = super()._build_payload(request)
        override = request.metadata.get("model") if request.metadata else None
        if isinstance(override, str) and override.strip():
            payload["model"] = override.strip()
        return payload


class InjectRequestModelMiddleware(LlmMiddleware):
    """Copies the per-request model from a ContextVar into LlmRequest.metadata."""

    async def before_llm_request(self, request: LlmRequest) -> LlmRequest:
        model = _llm_model_override.get()
        if not model:
            return request
        merged = {**request.metadata, "model": model}
        return request.model_copy(update={"metadata": merged})


class ValidatedModelChatHandler(ChatHandler):
    """Applies metadata.model only when it appears in the server-configured catalog."""

    async def handle_stream(self, request: ChatRequest):
        token: Token | None = None
        raw = request.metadata.get("model") if request.metadata else None
        if isinstance(raw, str) and raw.strip():
            allowed = {m["id"] for m in settings.chat_model_catalog()}
            if raw.strip() in allowed:
                token = _llm_model_override.set(raw.strip())
        try:
            async for chunk in super().handle_stream(request):
                yield chunk
        finally:
            if token is not None:
                _llm_model_override.reset(token)
