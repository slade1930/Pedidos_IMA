import uuid

from decimal import Decimal
from datetime import datetime

from sqlalchemy import (
    String,
    Numeric,
    Enum as SAEnum,
    ForeignKey,
    Text,
    DateTime,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.core.types import UuidType

from app.models.base_model import BaseModel

from app.core.constants import (
    PaymentMethod,
    PaymentStatus,
)


class Payment(BaseModel):

    __tablename__ = "payments"

    # Relaciones
    order_id: Mapped[uuid.UUID] = mapped_column(
        UuidType(),
        ForeignKey("orders.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Pago
    method: Mapped[PaymentMethod] = mapped_column(
        SAEnum(PaymentMethod),
        nullable=False,
    )

    status: Mapped[PaymentStatus] = mapped_column(
        SAEnum(PaymentStatus),
        default=PaymentStatus.PENDING,
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        default="USD",
        nullable=False,
    )

    provider: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    transaction_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
        index=True,
    )

    reference_code: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    failure_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Datos del método de pago
    phone_number: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    card_last4: Mapped[str | None] = mapped_column(
        String(4),
        nullable=True,
    )

    # Relaciones
    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="payment",
    )
