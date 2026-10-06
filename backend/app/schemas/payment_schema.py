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
    PaymentMethod,
    PaymentStatus,
)


class PaymentCreateSchema(BaseModel):

    order_id: uuid.UUID

    method: PaymentMethod

    amount: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2,
    )

    transaction_id: Optional[str] = None

    reference_code: Optional[str] = None

    phone_number: Optional[str] = None

    card_last4: Optional[str] = None

    @field_validator(
        "transaction_id",
        "reference_code",
        "phone_number",
        "card_last4",
    )
    @classmethod
    def clean_strings(cls, v):

        if v:
            return v.strip()

        return v


class PaymentUpdateSchema(BaseModel):

    status: PaymentStatus

    transaction_id: Optional[str] = None

    reference_code: Optional[str] = None

    notes: Optional[str] = None

    phone_number: Optional[str] = None

    card_last4: Optional[str] = None

    @field_validator(
        "transaction_id",
        "reference_code",
        "notes",
        "phone_number",
        "card_last4",
    )
    @classmethod
    def clean_strings(cls, v):

        if v:
            return v.strip()

        return v


class PaymentResponseSchema(BaseModel):

    id: uuid.UUID

    order_id: uuid.UUID

    method: PaymentMethod

    status: PaymentStatus

    amount: Decimal = Field(
        max_digits=10,
        decimal_places=2,
    )

    transaction_id: Optional[str] = None

    reference_code: Optional[str] = None

    phone_number: Optional[str] = None

    card_last4: Optional[str] = None

    created_at: Optional[datetime] = None

    updated_at: Optional[datetime] = None

    order_number: Optional[str] = None

    customer_name: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def extract_order_fields(cls, data: Any) -> Any:
        """Incluye datos de la orden y del usuario (relationship order.user)."""

        order = data.get("order") if isinstance(data, dict) else getattr(data, "order", None)

        order_number = None
        customer_name = None

        if order is not None:
            order_number = getattr(order, "order_number", None)
            user = getattr(order, "user", None)
            if user is not None:
                customer_name = getattr(user, "full_name", None)

        if isinstance(data, dict):
            data["order_number"] = order_number
            data["customer_name"] = customer_name
            return data

        return {
            "id": getattr(data, "id", None),
            "order_id": getattr(data, "order_id", None),
            "method": getattr(data, "method", None),
            "status": getattr(data, "status", None),
            "amount": getattr(data, "amount", None),
            "transaction_id": getattr(data, "transaction_id", None),
            "reference_code": getattr(data, "reference_code", None),
            "phone_number": getattr(data, "phone_number", None),
            "card_last4": getattr(data, "card_last4", None),
            "created_at": getattr(data, "created_at", None),
            "updated_at": getattr(data, "updated_at", None),
            "order_number": order_number,
            "customer_name": customer_name,
        }

    model_config = {"from_attributes": True}
