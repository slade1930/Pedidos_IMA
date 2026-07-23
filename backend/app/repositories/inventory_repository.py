# app/repositories/inventory_repository.py

from typing import Optional
import uuid

from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base_repository import BaseRepository
from app.models.inventory_model import Inventory
from app.models.product_model import Product


class InventoryRepository(BaseRepository[Inventory]):

    def __init__(self, db: AsyncSession):
        super().__init__(Inventory, db)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        search: str = None,         # 👈 NUEVO: búsqueda por nombre de producto
        fair_id: uuid.UUID = None,  # 👈 NUEVO: filtro por feria
        low_stock: bool = False,    # 👈 NUEVO: filtrar stock bajo
    ) -> list[Inventory]:

        query = (
            select(Inventory)
            .where(Inventory.is_active.is_(True))
            .options(selectinload(Inventory.product))
            .join(Product, Inventory.product_id == Product.id)  # 👈 Join con productos para buscar
        )

        # Filtro por feria
        if fair_id:
            query = query.where(Inventory.fair_id == fair_id)

        # Búsqueda por nombre de producto
        if search:
            query = query.where(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.sku.ilike(f"%{search}%"),
                )
            )

        # Filtro de stock bajo
        if low_stock:
            query = query.where(
                (Inventory.total_stock - Inventory.reserved_stock - Inventory.delivered_stock) <= Inventory.low_stock_threshold
            )
            # Ordenar de menor a mayor stock disponible
            query = query.order_by(
                (Inventory.total_stock - Inventory.reserved_stock - Inventory.delivered_stock).asc()
            )
        else:
            query = query.order_by(Inventory.created_at.desc())

        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_total_count(
        self,
        search: str = None,
        fair_id: uuid.UUID = None,
        low_stock: bool = False,
    ) -> int:

        query = (
            select(func.count())
            .select_from(Inventory)
            .where(Inventory.is_active.is_(True))
            .join(Product, Inventory.product_id == Product.id)
        )

        if fair_id:
            query = query.where(Inventory.fair_id == fair_id)

        if search:
            query = query.where(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.sku.ilike(f"%{search}%"),
                )
            )

        if low_stock:
            query = query.where(
                (Inventory.total_stock - Inventory.reserved_stock - Inventory.delivered_stock) <= Inventory.low_stock_threshold
            )

        result = await self.db.execute(query)
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
