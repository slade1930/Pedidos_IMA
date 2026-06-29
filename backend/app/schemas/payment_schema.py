from typing import Optional
from decimal import Decimal
import uuid

from pydantic import (
    BaseModel,
    Field,
    field_validator,
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

    @field_validator(
        "transaction_id",
        "reference_code",
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

    @field_validator(
        "transaction_id",
        "reference_code",
        "notes",
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

    model_config = {"from_attributes": True}
