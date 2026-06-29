from typing import (
    Generic,
    TypeVar,
    Type,
    Optional,
)

import uuid

from sqlalchemy import (
    select,
    delete,
    func,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base_model import BaseModel

ModelType = TypeVar(
    "ModelType",
    bound=BaseModel,
)


class BaseRepository(Generic[ModelType]):

    def __init__(
        self,
        model: Type[ModelType],
        db: AsyncSession,
    ):
        self.model = model
        self.db = db

    async def get_by_id(
        self,
        id: uuid.UUID,
    ) -> Optional[ModelType]:

        result = await self.db.execute(
            select(self.model).where(
                self.model.id == id,
                self.model.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
    ) -> list[ModelType]:

        result = await self.db.execute(
            select(self.model)
            .where(self.model.is_active.is_(True))
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        return list(result.scalars().all())

    async def count(self) -> int:

        result = await self.db.execute(
            select(func.count())
            .select_from(self.model)
            .where(self.model.is_active.is_(True))
        )

        return result.scalar_one()

    async def create(
        self,
        obj: ModelType,
    ) -> ModelType:

        self.db.add(obj)

        await self.db.flush()
        await self.db.refresh(obj)

        return obj

    async def update(
        self,
        id: uuid.UUID,
        data: dict,
    ) -> Optional[ModelType]:

        obj = await self.get_by_id(id)

        if not obj:
            return None

        for key, value in data.items():
            setattr(obj, key, value)

        await self.db.flush()
        await self.db.refresh(obj)

        return obj

    async def soft_delete(
        self,
        id: uuid.UUID,
    ) -> bool:

        obj = await self.get_by_id(id)

        if not obj:
            return False

        obj.is_active = False

        await self.db.flush()

        return True

    async def hard_delete(
        self,
        id: uuid.UUID,
    ) -> bool:

        result = await self.db.execute(delete(self.model).where(self.model.id == id))

        return result.rowcount > 0
