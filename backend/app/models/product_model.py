import uuid

from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    String,
    Text,
    Numeric,
    Integer,
    Enum as SAEnum,
    ForeignKey,
    Boolean,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from sqlalchemy.dialects.postgresql import UUID

from app.models.base_model import BaseModel


class ProductCategory(str, Enum):
    VEGETABLES = "vegetables"
    FRUITS = "fruits"
    GRAINS = "grains"
    MEATS = "meats"
    DAIRY = "dairy"
    OTHER = "other"


class ProductUnit(str, Enum):
    POUND = "pound"
    KILOGRAM = "kilogram"
    UNIT = "unit"
    DOZEN = "dozen"
    BAG = "bag"


class Product(BaseModel):

    __tablename__ = "products"

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    sku: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # Precio
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    unit: Mapped[ProductUnit] = mapped_column(
        SAEnum(ProductUnit),
        default=ProductUnit.UNIT,
        nullable=False,
    )

    category: Mapped[ProductCategory] = mapped_column(
        SAEnum(ProductCategory),
        nullable=False,
        index=True,
    )

    # Disponibilidad
    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    is_featured: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Restricción
    max_per_user: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    # Relación feria
    fair_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("fairs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relaciones
    fair: Mapped["Fair"] = relationship(
        "Fair",
        back_populates="products",
    )

    inventory: Mapped["Inventory"] = relationship(
        "Inventory",
        back_populates="product",
        uselist=False,
    )

    order_items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="product",
        lazy="selectin",
    )
