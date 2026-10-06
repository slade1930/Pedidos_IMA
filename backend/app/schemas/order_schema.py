# app/schemas/order_schema.py
from typing import Optional, Any
from decimal import Decimal
from datetime import datetime
import uuid

from pydantic import (
    BaseModel,
    Field,
    field_validator,
    model_validator,
)

from app.core.constants import (
    OrderStatus,
    PaymentMethod,
)


class OrderItemCreateSchema(BaseModel):

    product_id: uuid.UUID

    quantity: int = Field(
        default=1,
        ge=1,
        le=100,
    )


class OrderCreateSchema(BaseModel):

    fair_id: uuid.UUID

    payment_method: PaymentMethod

    items: list[OrderItemCreateSchema]

    notes: Optional[str] = None

    @field_validator("items")
    @classmethod
    def validate_items(cls, items):

        if not items:
            raise ValueError("El pedido debe tener al menos un producto")

        if len(items) > 100:
            raise ValueError("Máximo 100 productos por pedido")

        product_ids = [item.product_id for item in items]

        if len(product_ids) != len(set(product_ids)):
            raise ValueError("No se permiten productos duplicados")

        return items


class OrderStatusUpdateSchema(BaseModel):

    status: OrderStatus


class OrderItemResponseSchema(BaseModel):

    id: uuid.UUID

    product_id: uuid.UUID

    product_name: str

    quantity: int

    unit_price: Decimal = Field(
        max_digits=10,
        decimal_places=2,
    )

    subtotal: Decimal = Field(
        max_digits=10,
        decimal_places=2,
    )

    model_config = {"from_attributes": True}


class OrderResponseSchema(BaseModel):

    id: uuid.UUID

    order_number: str

    user_id: uuid.UUID

    fair_id: uuid.UUID

    status: OrderStatus

    total_amount: Decimal = Field(
        max_digits=10,
        decimal_places=2,
    )

    payment_method: PaymentMethod

    payment_status: Optional[str] = None

    pickup_code: Optional[str] = None

    customer_name: Optional[str] = None

    customer_cedula: Optional[str] = None

    notes: Optional[str] = None

    items: list[OrderItemResponseSchema] = Field(default_factory=list)

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    @model_validator(mode="before")
    @classmethod
    def extract_fields(cls, data: Any) -> Any:
        """Extrae datos del usuario anidado para la respuesta."""
        if isinstance(data, dict):
            user = data.get("user")
            if user and hasattr(user, "full_name"):
                data["customer_name"] = user.full_name
            if user and hasattr(user, "cedula"):
                data["customer_cedula"] = user.cedula

        return data

    model_config = {"from_attributes": True}


# ─── PDA RESTRICTION ───────────────────────────────────────

class PdaRestrictionSchema(BaseModel):
    """Respuesta cuando un ciudadano no puede comprar por restricción PDA"""

    message: str = "Ya realizaste un pedido recientemente"
    last_purchase_date: str
    last_fair_name: str
    days_remaining: int
    next_available_date: str


class PdaStatusSchema(BaseModel):
    """Estado de elegibilidad de compra de un ciudadano (control de beneficios)"""

    can_purchase: bool
    restriction: Optional[PdaRestrictionSchema] = None
