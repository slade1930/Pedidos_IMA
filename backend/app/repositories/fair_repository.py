# app/repositories/fair_repository.py
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy import (
    select,
    func,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base_repository import BaseRepository
from app.models.fair_model import Fair


class FairRepository(BaseRepository[Fair]):

    def __init__(
        self,
        db: AsyncSession,
    ):
        super().__init__(Fair, db)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Fair]:

        result = await self.db.execute(
            select(Fair)
            .where(Fair.is_active.is_(True))
            .order_by(Fair.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        return list(result.scalars().all())

    async def get_total_count(self) -> int:

        result = await self.db.execute(
            select(func.count()).select_from(Fair).where(Fair.is_active.is_(True))
        )
        return result.scalar() or 0

    async def get_active_fairs(
        self,
    ) -> list[Fair]:

        now = datetime.now(timezone.utc)

        result = await self.db.execute(
            select(Fair)
            .where(
                Fair.is_active.is_(True),
                Fair.start_date <= now,
                Fair.end_date >= now,
            )
            .order_by(Fair.start_date.asc())
        )

        return list(result.scalars().all())

    async def get_upcoming_fairs(
        self,
    ) -> list[Fair]:

        now = datetime.now(timezone.utc)

        result = await self.db.execute(
            select(Fair)
            .where(
                Fair.is_active.is_(True),
                Fair.start_date > now,
            )
            .order_by(Fair.start_date.asc())
        )

        return list(result.scalars().all())

    async def get_finished_fairs(
        self,
    ) -> list[Fair]:

        now = datetime.now(timezone.utc)

        result = await self.db.execute(
            select(Fair)
            .where(
                Fair.end_date < now,
            )
            .order_by(Fair.end_date.desc())
        )

        return list(result.scalars().all())

    async def get_by_province(
        self,
        province: str,
    ) -> list[Fair]:

        result = await self.db.execute(
            select(Fair)
            .where(
                func.lower(Fair.province) == province.lower(),
                Fair.is_active.is_(True),
            )
            .order_by(Fair.start_date.desc())
        )

        return list(result.scalars().all())