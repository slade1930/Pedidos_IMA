# app/services/payment_service.py
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.payment_repository import PaymentRepository
from app.repositories.order_repository import OrderRepository
from app.models.payment_model import Payment
from app.schemas.payment_schema import PaymentCreateSchema, PaymentUpdateSchema
from app.core.constants import PaymentStatus, OrderStatus
from app.services.notification_service import NotificationService
import uuid


class PaymentService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.payment_repo = PaymentRepository(db)
        self.order_repo = OrderRepository(db)

    async def get_all(self, skip: int = 0, limit: int = 10) -> list[Payment]:
        return await self.payment_repo.get_all(skip, limit)

    async def get_total_count(self) -> int:
        return await self.payment_repo.get_total_count()

    async def create(self, data: PaymentCreateSchema) -> Payment:
        order = await self.order_repo.get_by_id(data.order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado",
            )

        existing = await self.payment_repo.get_by_order(data.order_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este pedido ya tiene un pago asociado",
            )

        payment = Payment(**data.model_dump())
        return await self.payment_repo.create(payment)

    async def confirm(self, payment_id: uuid.UUID, transaction_id: str) -> Payment:
        payment = await self.payment_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pago no encontrado",
            )

        updated = await self.payment_repo.update(
            payment_id,
            {
                "status": PaymentStatus.COMPLETED,
                "transaction_id": transaction_id,
            },
        )

        # Actualizar estado del pedido
        await self.order_repo.update(
            payment.order_id, {"status": OrderStatus.CONFIRMED}
        )

        return updated

    async def get_by_order(self, order_id: uuid.UUID) -> Payment:
        payment = await self.payment_repo.get_by_order(order_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pago no encontrado",
            )
        return payment