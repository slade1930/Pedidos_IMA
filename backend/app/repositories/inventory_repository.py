# app/repositories/inventory_repository.py

from typing import Optional
import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base_repository import BaseRepository
from app.models.inventory_model import Inventory


class InventoryRepository(BaseRepository[Inventory]):

    def __init__(self, db: AsyncSession):
        super().__init__(Inventory, db)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Inventory]:

        result = await self.db.execute(
            select(Inventory)
            .where(Inventory.is_active.is_(True))
            .order_by(Inventory.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        return list(result.scalars().all())

    async def get_total_count(self) -> int:

        result = await self.db.execute(
            select(func.count()).select_from(Inventory).where(Inventory.is_active.is_(True))
        )
        return result.scalar() or 0

    async def get_by_product_and_fair(
        self,
        product_id: uuid.UUID,
        fair_id: uuid.UUID,
        for_update: bool = False,
    ) -> Optional[Inventory]:

        query = select(Inventory).where(
            Inventory.product_id == product_id,
            Inventory.fair_id == fair_id,
            Inventory.is_active.is_(True),
        )

        if for_update:
            query = query.with_for_update()

        result = await self.db.execute(query)

        return result.scalar_one_or_none()

    async def get_by_fair(
        self,
        fair_id: uuid.UUID,
    ) -> list[Inventory]:

        result = await self.db.execute(
            select(Inventory).where(
                Inventory.fair_id == fair_id,
                Inventory.is_active.is_(True),
            )
        )

        return list(result.scalars().all())

    async def reserve_stock(
        self,
        product_id: uuid.UUID,
        fair_id: uuid.UUID,
        quantity: int,
    ) -> bool:

        if quantity <= 0:
            return False

        inventory = await self.get_by_product_and_fair(
            product_id,
            fair_id,
            for_update=True,
        )

        if not inventory:
            return False

        if inventory.available_stock < quantity:
            return False

        inventory.reserved_stock += quantity

        await self.db.flush()

        return True

    async def release_stock(
        self,
        product_id: uuid.UUID,
        fair_id: uuid.UUID,
        quantity: int,
    ) -> bool:

        if quantity <= 0:
            return False

        inventory = await self.get_by_product_and_fair(
            product_id,
            fair_id,
            for_update=True,
        )

        if not inventory:
            return False

        if quantity > inventory.reserved_stock:
            return False

        inventory.reserved_stock -= quantity

        await self.db.flush()

        return True

    async def confirm_delivery(
        self,
        product_id: uuid.UUID,
        fair_id: uuid.UUID,
        quantity: int,
    ) -> bool:

        if quantity <= 0:
            return False

        inventory = await self.get_by_product_and_fair(
            product_id,
            fair_id,
            for_update=True,
        )

        if not inventory:
            return False

        if quantity > inventory.reserved_stock:
            return False

        inventory.reserved_stock -= quantity
        inventory.delivered_stock += quantity

        await self.db.flush()

        return True