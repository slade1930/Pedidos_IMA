from datetime import datetime
from enum import Enum
import uuid

from sqlalchemy import (
    String,
    Text,
    JSON,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.types import UuidType
from app.models.base_model import BaseModel


class NotificationLevel(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


class NotificationAudience(str, Enum):
    ALL = "all"
    USERS = "users"


class Notification(BaseModel):
    """Notificación creada por un administrador y visible para los usuarios."""

    __tablename__ = "notifications"

    title: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    level: Mapped[NotificationLevel] = mapped_column(
        SAEnum(NotificationLevel),
        default=NotificationLevel.INFO,
        nullable=False,
    )
    audience: Mapped[NotificationAudience] = mapped_column(
        SAEnum(NotificationAudience),
        default=NotificationAudience.ALL,
        nullable=False,
        index=True,
    )
    # Para audience=USERS: lista de UUIDs (strings) de destinatarios.
    # Para audience=ALL: None (visible para todos los usuarios registrados).
    recipient_ids: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UuidType(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )


class UserNotification(BaseModel):
    """Estado por usuario: destinatario (audience=USERS) y/o marca de leído."""

    __tablename__ = "user_notifications"
    __table_args__ = (
        UniqueConstraint("user_id", "notification_id", name="uq_user_notification"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UuidType(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    notification_id: Mapped[uuid.UUID] = mapped_column(
        UuidType(),
        ForeignKey("notifications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
