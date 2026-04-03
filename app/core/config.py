from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

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
    openai_model: str = ""
    openai_base_url: str = ""
    openai_organization: str = ""
    chroma_host: str = ""
    chroma_port: int = 8000
    chroma_ssl: bool = False

    # App
    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
