# app/repositories/payment_repository.py

from typing import Optional
import uuid

from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base_repository import BaseRepository
from app.models.payment_model import Payment
from app.core.constants import PaymentStatus


class PaymentRepository(BaseRepository[Payment]):

    def __init__(self, db: AsyncSession):
        super().__init__(Payment, db)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Payment]:

        result = await self.db.execute(
            select(Payment)
            .where(Payment.is_active.is_(True))
            .options(selectinload(Payment.order))
            .order_by(Payment.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        return list(result.scalars().all())

    async def get_total_count(self) -> int:

        result = await self.db.execute(
            select(func.count()).select_from(Payment).where(Payment.is_active.is_(True))
        )
        return result.scalar() or 0

    async def get_by_order(
        self,
        order_id: uuid.UUID,
    ) -> Optional[Payment]:

        result = await self.db.execute(
            select(Payment)
            .where(
                Payment.order_id == order_id,
                Payment.is_active.is_(True),
            )
            .options(
                selectinload(Payment.order),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_transaction_id(
        self,
        transaction_id: str,
    ) -> Optional[Payment]:

        if not transaction_id:
            return None

        result = await self.db.execute(
            select(Payment).where(
                Payment.transaction_id == transaction_id,
                Payment.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_status(
        self,
        status: PaymentStatus,
    ) -> list[Payment]:

        result = await self.db.execute(
            select(Payment)
            .where(
                Payment.status == status,
                Payment.is_active.is_(True),
            )
            .order_by(Payment.created_at.desc())
        )

        return list(result.scalars().all())