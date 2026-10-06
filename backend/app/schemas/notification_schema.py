import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.notification_model import NotificationAudience, NotificationLevel


class NotificationCreateSchema(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    message: str = Field(min_length=1, max_length=2000)
    level: NotificationLevel = NotificationLevel.INFO
    audience: NotificationAudience = NotificationAudience.ALL
    recipient_ids: Optional[list[uuid.UUID]] = None

    @field_validator("title", "message")
    @classmethod
    def clean_strings(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El campo no puede estar vacío")
        return v

    @model_validator(mode="after")
    def check_recipients(self) -> "NotificationCreateSchema":
        if self.audience == NotificationAudience.USERS:
            if not self.recipient_ids:
                raise ValueError(
                    "Debe seleccionar al menos un usuario destinatario"
                )
            # sin duplicados
            self.recipient_ids = list(dict.fromkeys(self.recipient_ids))
        else:
            self.recipient_ids = None
        return self


class NotificationUpdateSchema(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=150)
    message: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    level: Optional[NotificationLevel] = None

    @field_validator("title", "message")
    @classmethod
    def clean_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("El campo no puede estar vacío")
        return v


class NotificationResponseSchema(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    level: NotificationLevel
    audience: NotificationAudience
    recipient_ids: Optional[list[uuid.UUID]] = None
    created_by: Optional[uuid.UUID] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Campos calculados
    read: Optional[bool] = None
    recipients_count: Optional[int] = None
    read_count: Optional[int] = None

    model_config = {"from_attributes": True}


class UnreadCountSchema(BaseModel):
    count: int = 0
