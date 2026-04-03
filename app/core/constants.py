"""Shared constants from repository-root constants.json."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Final

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
_CONSTANTS_FILE = _REPO_ROOT / "constants.json"


class AppConstants(BaseModel):
    model_config = ConfigDict(frozen=True)

    max_post_text_length: int = Field(validation_alias="MAX_POST_TEXT_LENGTH")
    max_comment_length: int = Field(validation_alias="MAX_COMMENT_LENGTH")
    feed_page_size: int = Field(validation_alias="FEED_PAGE_SIZE")
    allowed_image_mime_types: frozenset[str] = Field(
        validation_alias="ALLOWED_IMAGE_MIME_TYPES",
    )
    image_upload_max_mb: int = Field(validation_alias="IMAGE_UPLOAD_MAX_MB")
    default_image_mime_type: str = Field(validation_alias="DEFAULT_IMAGE_MIME_TYPE")

    @field_validator("allowed_image_mime_types", mode="before")
    @classmethod
    def _mime_types_to_frozenset(cls, v: Any) -> frozenset[str]:
        if isinstance(v, frozenset):
            return v
        return frozenset(v)

    @computed_field
    @property
    def max_image_upload_bytes(self) -> int:
        return self.image_upload_max_mb * 1024 * 1024


def load_app_constants(path: Path | None = None) -> AppConstants:
    p = path or _CONSTANTS_FILE
    return AppConstants.model_validate_json(p.read_text(encoding="utf-8"))


APP_CONSTANTS: Final[AppConstants] = load_app_constants()
