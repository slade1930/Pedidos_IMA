from datetime import datetime

from sqlalchemy import (
    String,
    DateTime,
    Text,
    Integer,
    Enum as SAEnum,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.models.base_model import BaseModel
from app.core.constants import FairStatus


class Fair(BaseModel):

    __tablename__ = "fairs"

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    province: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    status: Mapped[FairStatus] = mapped_column(
        SAEnum(FairStatus),
        default=FairStatus.UPCOMING,
        nullable=False,
        index=True,
    )

    # Fechas
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    # Capacidad
    max_orders: Mapped[int] = mapped_column(
        Integer,
        default=500,
        nullable=False,
    )

    # 👈 NUEVO CAMPO: Imagen de la feria
    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        default=None,
    )

    # Relaciones
    products: Mapped[list["Product"]] = relationship(
        "Product",
        back_populates="fair",
        lazy="selectin",
    )

    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="fair",
        lazy="selectin",
    )

    inventory: Mapped[list["Inventory"]] = relationship(
        "Inventory",
        back_populates="fair",
        lazy="selectin",
    )

    @property
    def is_active_fair(self) -> bool:
        now = datetime.utcnow()
        return self.start_date <= now <= self.end_date