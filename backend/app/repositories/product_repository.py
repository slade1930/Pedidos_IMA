# app/repositories/product_repository.py

from typing import Optional
import uuid

from sqlalchemy import (
    select,
    func,
    or_,
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
        search: str = None,
        category: str = None,
        fair_id: uuid.UUID = None,
        is_active: bool = True,
    ) -> list[Product]:
        
        query = select(Product).where(Product.is_active.is_(is_active))
        
        if fair_id:
            query = query.where(Product.fair_id == fair_id)
        
        if search:
            query = query.where(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.sku.ilike(f"%{search}%"),
                )
            )
        
        if category:
            query = query.where(Product.category == category)
        
        query = query.order_by(Product.name.asc()).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_total_count(
        self,
        search: str = None,
        category: str = None,
        fair_id: uuid.UUID = None,
        is_active: bool = True,
    ) -> int:
        
        query = select(func.count()).select_from(Product).where(Product.is_active.is_(is_active))
        
        if fair_id:
            query = query.where(Product.fair_id == fair_id)
        
        if search:
            query = query.where(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.sku.ilike(f"%{search}%"),
                )
            )
        
        if category:
            query = query.where(Product.category == category)
        
        result = await self.db.execute(query)
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
