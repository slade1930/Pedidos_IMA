# app/api/routes/payments.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.payment_service import PaymentService
from app.schemas.payment_schema import (
    PaymentCreateSchema,
    PaymentResponseSchema,
)
from app.schemas.response_schema import ResponseSchema, PaginatedResponseSchema
from app.api.dependencies.auth_dependencies import (
    get_current_user,
    get_current_staff,
)
from app.models.user_model import User
import uuid

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/", response_model=PaginatedResponseSchema[PaymentResponseSchema])
async def get_all_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = PaymentService(db)
    payments = await service.get_all(skip=skip, limit=limit)
    total = await service.get_total_count()
    return PaginatedResponseSchema(
        data=[PaymentResponseSchema.model_validate(p) for p in payments],
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        limit=limit,
        pages=((total + limit - 1) // limit) if total > 0 else 0,
    )


@router.post("/", response_model=ResponseSchema[PaymentResponseSchema])
async def create_payment(
    data: PaymentCreateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = PaymentService(db)
    payment = await service.create(data)
    return ResponseSchema(
        message="Pago registrado",
        data=PaymentResponseSchema.model_validate(payment),
    )


@router.post(
    "/{payment_id}/confirm", response_model=ResponseSchema[PaymentResponseSchema]
)
async def confirm_payment(
    payment_id: uuid.UUID,
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = PaymentService(db)
    payment = await service.confirm(payment_id, transaction_id)
    return ResponseSchema(
        message="Pago confirmado",
        data=PaymentResponseSchema.model_validate(payment),
    )


@router.get("/order/{order_id}", response_model=ResponseSchema[PaymentResponseSchema])
async def get_payment_by_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = PaymentService(db)
    payment = await service.get_by_order(order_id)
    return ResponseSchema(data=PaymentResponseSchema.model_validate(payment))