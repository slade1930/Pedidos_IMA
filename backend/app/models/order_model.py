import uuid

from decimal import Decimal
from datetime import datetime

from sqlalchemy import (
    String,
    Numeric,
    Enum as SAEnum,
    ForeignKey,
    Text,
    Boolean,
    DateTime,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from sqlalchemy.dialects.postgresql import UUID

from app.models.base_model import BaseModel

from app.core.constants import (
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)


class Order(BaseModel):

    __tablename__ = "orders"

    # Relaciones
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    fair_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("fairs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Pedido
    order_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus),
        default=OrderStatus.PENDING,
        nullable=False,
        index=True,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    payment_method: Mapped[PaymentMethod] = mapped_column(
        SAEnum(PaymentMethod),
        nullable=False,
    )

    payment_status: Mapped[PaymentStatus] = mapped_column(
        SAEnum(PaymentStatus),
        default=PaymentStatus.PENDING,
        nullable=False,
        index=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # QR y pickup
    qr_token: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        unique=True,
    )

    qr_used: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    pickup_code: Mapped[str | None] = mapped_column(
        String(5),
        nullable=True,
    )

    picked_up_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    cancel_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relaciones
    user: Mapped["User"] = relationship(
        "User",
        back_populates="orders",
    )

    fair: Mapped["Fair"] = relationship(
        "Fair",
        back_populates="orders",
    )

    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    payment: Mapped["Payment"] = relationship(
        "Payment",
        back_populates="order",
        uselist=False,
    )