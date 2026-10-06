# app/schemas/product_schema.py
from typing import Optional
from decimal import Decimal
from datetime import datetime
import uuid

from pydantic import (
    BaseModel,
    Field,
    field_validator,
    model_validator,
)
from typing import Any

from app.models.product_model import (
    ProductUnit,
    ProductCategory,
)
from app.utils.validators import validate_image_base64


def _validate_image_field(v):
    """FASE 3: valida tamaño (10 MB), formato raster y rechaza SVG."""
    if v is None:
        return v
    return validate_image_base64(v)[0]


class ProductCreateSchema(BaseModel):

    name: str

    sku: str

    description: Optional[str] = None

    # 👈 CAMBIADO: Ahora aceptamos image_base64 en lugar de image_url
    image_base64: Optional[str] = None

    price: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2,
    )

    unit: ProductUnit

    category: ProductCategory

    max_per_user: int = Field(default=1, ge=1)

    fair_id: uuid.UUID

    @field_validator("name", "sku")
    @classmethod
    def clean_strings(cls, v: str):
        return v.strip()

    @field_validator("image_base64")
    @classmethod
    def validate_image(cls, v):
        return _validate_image_field(v)


class ProductUpdateSchema(BaseModel):

    name: Optional[str] = None

    sku: Optional[str] = None

    description: Optional[str] = None

    # 👈 CAMBIADO: image_base64 para actualizar imagen
    image_base64: Optional[str] = None

    price: Optional[Decimal] = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )

    unit: Optional[ProductUnit] = None

    category: Optional[ProductCategory] = None

    max_per_user: Optional[int] = Field(default=None, ge=1)

    is_active: Optional[bool] = None

    @field_validator("image_base64")
    @classmethod
    def validate_image(cls, v):
        return _validate_image_field(v)


class ProductResponseSchema(BaseModel):

    id: uuid.UUID

    name: str

    sku: str

    description: Optional[str] = None

    # 👈 CAMBIADO: str en lugar de HttpUrl para permitir rutas relativas
    image_url: Optional[str] = None

    price: Decimal

    unit: ProductUnit

    category: ProductCategory

    max_per_user: int

    fair_id: uuid.UUID

    is_active: bool

    # 👈 NUEVO: Stock disponible de inventario para la feria del producto
    available_stock: int = 0

    created_at: datetime

    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def extract_available_stock(cls, data: Any) -> Any:
        """Extrae el stock disponible del objeto Inventory relacionado al producto."""
        if isinstance(data, dict):
            data["available_stock"] = int(data.get("available_stock", 0) or 0)
            return data

        # ORM Product: construir dict con los atributos + stock del inventario
        inventory = getattr(data, "inventory", None)
        stock = getattr(inventory, "available_stock", 0)
        result = {
            "id": str(data.id),
            "name": data.name,
            "sku": data.sku,
            "description": data.description,
            "image_url": data.image_url,
            "price": data.price,
            "unit": data.unit.value if hasattr(data.unit, "value") else data.unit,
            "category": data.category.value if hasattr(data.category, "value") else data.category,
            "max_per_user": data.max_per_user,
            "fair_id": str(data.fair_id),
            "is_active": data.is_active,
            "available_stock": int(stock) if stock is not None else 0,
            "created_at": data.created_at,
            "updated_at": data.updated_at,
        }
        return result