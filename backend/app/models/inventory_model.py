import uuid

from sqlalchemy import (
    Integer,
    ForeignKey,
    Text,
    UniqueConstraint,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from sqlalchemy.dialects.postgresql import UUID

from app.models.base_model import BaseModel


class Inventory(BaseModel):

    __tablename__ = "inventory"

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "fair_id",
            name="uq_inventory_product_fair",
        ),
    )

    # Relaciones
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    fair_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("fairs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Stock
    total_stock: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    reserved_stock: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    delivered_stock: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    low_stock_threshold: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=10,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relaciones
    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="inventory",
    )

    fair: Mapped["Fair"] = relationship(
        "Fair",
        back_populates="inventory",
    )

    # Helpers
    @property
    def available_stock(self) -> int:
        return max(
            self.total_stock - self.reserved_stock - self.delivered_stock,
            0,
        )

    @property
    def is_available(self) -> bool:
        return self.available_stock > 0

    @property
    def is_low_stock(self) -> bool:
        return self.available_stock <= self.low_stock_threshold
