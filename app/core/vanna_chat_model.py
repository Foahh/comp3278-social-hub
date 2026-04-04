"""Per-request LLM model selection for Vanna chat.

Also provides a non-blocking LLM service that uses ``openai.AsyncOpenAI`` so that
concurrent chat requests don't serialise on the event loop.
"""

from __future__ import annotations

import json
import os
from collections.abc import AsyncGenerator
from contextvars import ContextVar, Token
from typing import Any

from openai import AsyncOpenAI
from vanna.core.llm import LlmRequest, LlmResponse, LlmStreamChunk
from vanna.core.middleware import LlmMiddleware
from vanna.core.tool import ToolCall
from vanna.integrations.openai import OpenAILlmService
from vanna.servers.base import ChatHandler
from vanna.servers.base.models import ChatRequest

from app.core.config import settings

# Set for the duration of a single chat SSE / poll request.
_llm_model_override: ContextVar[str | None] = ContextVar("llm_model_override", default=None)


class MetadataOpenAILlmService(OpenAILlmService):
    """Non-blocking OpenAI service with per-request model override.

    Uses ``AsyncOpenAI`` for all LLM calls so the event loop is never blocked,
    while keeping the parent's ``_build_payload`` / tool-validation helpers.
    """

    def __init__(self, **kwargs: Any) -> None:
        # Let the parent build self.model and validate imports, but we won't
        # use its synchronous ``self._client``.
        super().__init__(**kwargs)

        # Build an *async* client with the same credentials.
        async_kwargs: dict[str, Any] = {}
        api_key = kwargs.get("api_key") or os.getenv("OPENAI_API_KEY")
        if api_key:
            async_kwargs["api_key"] = api_key
        org = kwargs.get("organization") or os.getenv("OPENAI_ORG")
        if org:
            async_kwargs["organization"] = org
        base_url = kwargs.get("base_url") or os.getenv("OPENAI_BASE_URL")
        if base_url:
            async_kwargs["base_url"] = base_url
        self._async_client = AsyncOpenAI(**async_kwargs)

    def _build_payload(self, request: LlmRequest) -> dict[str, Any]:
        payload = super()._build_payload(request)
        override = request.metadata.get("model") if request.metadata else None
        if isinstance(override, str) and override.strip():
            payload["model"] = override.strip()
        return payload

    # -- async overrides using the non-blocking client -----------------------

    async def send_request(self, request: LlmRequest) -> LlmResponse:
        payload = self._build_payload(request)
        resp = await self._async_client.chat.completions.create(**payload, stream=False)

        if not resp.choices:
            return LlmResponse(content=None, tool_calls=None, finish_reason=None)

        choice = resp.choices[0]
        content: str | None = getattr(choice.message, "content", None)
        tool_calls = self._extract_tool_calls_from_message(choice.message)

        usage: dict[str, int] = {}
        if getattr(resp, "usage", None):
            usage = {
                k: int(v)
                for k, v in {
                    "prompt_tokens": getattr(resp.usage, "prompt_tokens", 0),
                    "completion_tokens": getattr(resp.usage, "completion_tokens", 0),
                    "total_tokens": getattr(resp.usage, "total_tokens", 0),
                }.items()
            }

        return LlmResponse(
            content=content,
            tool_calls=tool_calls or None,
            finish_reason=getattr(choice, "finish_reason", None),
            usage=usage or None,
        )

    async def stream_request(self, request: LlmRequest) -> AsyncGenerator[LlmStreamChunk]:
        payload = self._build_payload(request)
        stream = await self._async_client.chat.completions.create(**payload, stream=True)

        tc_builders: dict[int, dict[str, str | None]] = {}
        last_finish: str | None = None

        async for event in stream:
            if not getattr(event, "choices", None):
                continue

            choice = event.choices[0]
            delta = getattr(choice, "delta", None)
            if delta is None:
                last_finish = getattr(choice, "finish_reason", last_finish)
                continue

            content_piece: str | None = getattr(delta, "content", None)
            if content_piece:
                yield LlmStreamChunk(content=content_piece)

            streamed_tool_calls = getattr(delta, "tool_calls", None)
            if streamed_tool_calls:
                for tc in streamed_tool_calls:
                    idx = getattr(tc, "index", 0) or 0
                    b = tc_builders.setdefault(idx, {"id": None, "name": None, "arguments": ""})
                    if getattr(tc, "id", None):
                        b["id"] = tc.id
                    fn = getattr(tc, "function", None)
                    if fn is not None:
                        if getattr(fn, "name", None):
                            b["name"] = fn.name
                        if getattr(fn, "arguments", None):
                            b["arguments"] = (b["arguments"] or "") + fn.arguments

            last_finish = getattr(choice, "finish_reason", last_finish)

        final_tool_calls: list[ToolCall] = []
        for b in tc_builders.values():
            if not b.get("name"):
                continue
            args_raw = b.get("arguments") or "{}"
            try:
                loaded = json.loads(args_raw)
                args_dict: dict[str, Any] = loaded if isinstance(loaded, dict) else {"args": loaded}
            except Exception:
                args_dict = {"_raw": args_raw}
            final_tool_calls.append(
                ToolCall(
                    id=b.get("id") or "tool_call", name=b["name"] or "tool", arguments=args_dict
                )
            )

        if final_tool_calls:
            yield LlmStreamChunk(tool_calls=final_tool_calls, finish_reason=last_finish)
        else:
            yield LlmStreamChunk(finish_reason=last_finish or "stop")


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
