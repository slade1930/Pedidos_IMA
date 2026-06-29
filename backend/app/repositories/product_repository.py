# app/repositories/product_repository.py
from typing import Optional
import uuid

from sqlalchemy import (
    select,
    func,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base_repository import BaseRepository
from app.models.product_model import Product


class ProductRepository(BaseRepository[Product]):

    def __init__(
        self,
        db: AsyncSession,
    ):
        super().__init__(Product, db)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Product]:

        result = await self.db.execute(
            select(Product)
            .where(Product.is_active.is_(True))
            .order_by(Product.name.asc())
            .offset(skip)
            .limit(limit)
        )

        return list(result.scalars().all())

    async def get_total_count(self) -> int:

        result = await self.db.execute(
            select(func.count()).select_from(Product).where(Product.is_active.is_(True))
        )
        return result.scalar() or 0

    async def get_by_fair(
        self,
        fair_id: uuid.UUID,
    ) -> list[Product]:

        result = await self.db.execute(
            select(Product)
            .where(
                Product.fair_id == fair_id,
                Product.is_active.is_(True),
            )
            .order_by(Product.name.asc())
        )

        return list(result.scalars().all())

    async def get_by_category(
        self,
        category: str,
        fair_id: uuid.UUID,
    ) -> list[Product]:

        result = await self.db.execute(
            select(Product)
            .where(
                func.lower(Product.category) == category.lower(),
                Product.fair_id == fair_id,
                Product.is_active.is_(True),
            )
            .order_by(Product.name.asc())
        )

        return list(result.scalars().all())

    async def get_by_name(
        self,
        name: str,
        fair_id: uuid.UUID,
    ) -> Optional[Product]:

        result = await self.db.execute(
            select(Product)
            .where(
                Product.name.ilike(f"%{name}%"),
                Product.fair_id == fair_id,
                Product.is_active.is_(True),
            )
            .order_by(Product.name.asc())
        )

        return result.scalar_one_or_none()