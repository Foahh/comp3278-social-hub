import json
from typing import Any

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # MySQL
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = "rootpassword"
    mysql_database: str = "social_media"

    # MinIO / S3
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket: str = "social-media"
    s3_public_url: str = "http://localhost:9000"

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_expire_hours: int = 72

    # Vanna / OpenAI-compatible
    openai_api_key: str = ""
    openai_base_url: str = ""
    openai_organization: str = ""
    chroma_persist_directory: str = ".chroma"

    vanna_chat_models: str = Field(
        default="",
        description="JSON array of chat model entries (id, name, provider) for the UI picker",
    )

    # App
    cors_origins: list[str] = ["http://localhost:5173"]

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
