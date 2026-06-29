from enum import Enum
from datetime import datetime

from sqlalchemy import (
    String,
    Boolean,
    Enum as SAEnum,
    DateTime,
    Integer,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.models.base_model import BaseModel


class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    CLIENT = "client"


class User(BaseModel):

    __tablename__ = "users"

    # Datos personales
    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    cedula: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        unique=True,
        nullable=True,
    )

    province: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    district: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    corregimiento: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    address: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    profile_image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # Seguridad
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    password_changed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    failed_login_attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    is_blocked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Roles
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole),
        default=UserRole.CLIENT,
        nullable=False,
        index=True,
    )

    # Relaciones
    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="user",
        lazy="selectin",
    )

    # Helpers
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

    def is_staff(self) -> bool:
        return self.role == UserRole.STAFF

    def __repr__(self):
        return f"<User email={self.email}>"
