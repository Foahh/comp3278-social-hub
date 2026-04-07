import json
from typing import Any, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # MySQL
    mysql_host: str
    mysql_port: int
    mysql_user: str
    mysql_password: str
    mysql_database: str

    # MinIO / S3
    s3_endpoint_url: str
    s3_access_key: str
    s3_secret_key: str
    s3_bucket: str
    s3_public_url: str

    # Auth
    jwt_secret: str
    jwt_expire_hours: int = 72

    # Vanna / OpenAI-compatible
    openai_api_key: Optional[str] = None
    openai_base_url: Optional[str] = None
    openai_organization: Optional[str] = None

    vanna_chat_models: str = Field(
        default="",
        description="JSON array of chat model entries (id, name, provider) for the UI picker",
    )

    # App
    cors_origins: list[str]

    def chat_model_catalog(self) -> list[dict[str, str]]:
        """Parse VANNA_CHAT_MODELS JSON into a list of {id, name, provider}."""
        raw = (self.vanna_chat_models or "").strip()
        if not raw:
            return []
        try:
            data: Any = json.loads(raw)
        except json.JSONDecodeError:
            return []
        if not isinstance(data, list):
            return []
        out: list[dict[str, str]] = []
        for item in data:
            if not isinstance(item, dict):
                continue
            mid = item.get("id")
            if not isinstance(mid, str) or not mid.strip():
                continue
            name = item.get("name")
            name_s = name.strip() if isinstance(name, str) else mid
            prov = item.get("provider")
            prov_s = prov.strip() if isinstance(prov, str) and prov.strip() else "openai"
            out.append({"id": mid.strip(), "name": name_s or mid, "provider": prov_s})
        return out

    def default_chat_model_id(self) -> str | None:
        """First model in VANNA_CHAT_MODELS, or None if the catalog is empty."""
        catalog = self.chat_model_catalog()
        return catalog[0]["id"] if catalog else None


settings = Settings()
