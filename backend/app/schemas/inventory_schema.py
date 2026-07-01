# app/schemas/inventory_schema.py
from typing import Optional
import uuid

from pydantic import (
    BaseModel,
    Field,
    field_validator,
    model_validator,
)


class InventoryCreateSchema(BaseModel):

    product_id: uuid.UUID

    fair_id: uuid.UUID

    total_stock: int = Field(ge=0)

    notes: Optional[str] = None

    @field_validator("notes")
    @classmethod
    def clean_notes(cls, v):
        return v.strip() if v else v


class InventoryUpdateSchema(BaseModel):

    total_stock: Optional[int] = Field(default=None, ge=0)

    notes: Optional[str] = None

    @field_validator("notes")
    @classmethod
    def clean_notes(cls, v):
        return v.strip() if v else v


class InventoryResponseSchema(BaseModel):

    id: uuid.UUID

    product_id: uuid.UUID

    product_name: Optional[str] = None  # 👈 NUEVO

    fair_id: uuid.UUID

    total_stock: int

    reserved_stock: int

    delivered_stock: int

    available_stock: int

    is_available: bool

    notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_stock_logic(self):

        if self.reserved_stock > self.total_stock:
            raise ValueError("Reserved stock no puede ser mayor al total")

        if self.delivered_stock > self.total_stock:
            raise ValueError("Delivered stock no puede ser mayor al total")

        return self

    model_config = {"from_attributes": True}
