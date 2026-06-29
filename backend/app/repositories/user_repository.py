from typing import Optional

from sqlalchemy import (
    select,
    func,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base_repository import BaseRepository
from app.models.user_model import User
from app.core.constants import UserRole


class UserRepository(BaseRepository[User]):

    def __init__(
        self,
        db: AsyncSession,
    ):
        super().__init__(User, db)

    async def get_by_email(
        self,
        email: str,
    ) -> Optional[User]:

        result = await self.db.execute(
            select(User).where(
                func.lower(User.email) == email.lower(),
                User.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_cedula(
        self,
        cedula: str,
    ) -> Optional[User]:

        result = await self.db.execute(
            select(User).where(
                User.cedula == cedula,
                User.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_role(
        self,
        role: UserRole,
        skip: int = 0,
        limit: int = 50,
    ) -> list[User]:

        result = await self.db.execute(
            select(User)
            .where(
                User.role == role,
                User.is_active.is_(True),
            )
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        return list(result.scalars().all())

    async def email_exists(
        self,
        email: str,
    ) -> bool:

        return await self.get_by_email(email) is not None

    async def cedula_exists(
        self,
        cedula: str,
    ) -> bool:

        return await self.get_by_cedula(cedula) is not None
