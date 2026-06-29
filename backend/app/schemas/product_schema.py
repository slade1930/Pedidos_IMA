# app/schemas/product_schema.py
from typing import Optional
from decimal import Decimal
from datetime import datetime
import uuid

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)

from app.models.product_model import (
    ProductUnit,
    ProductCategory,
)


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

    created_at: datetime

    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}