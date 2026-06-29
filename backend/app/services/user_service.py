# app/services/user_service.py
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.models.user_model import User
from app.schemas.user_schema import (
    UserCreateSchema,
    UserUpdateSchema,
    UserAdminUpdateSchema,
)
from app.core.security import hash_password
from app.core.constants import UserRole
import uuid


class UserService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, data: UserCreateSchema) -> User:
        if await self.user_repo.email_exists(data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo ya está registrado",
            )

        if await self.user_repo.cedula_exists(data.cedula):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cédula ya está registrada",
            )

        user = User(
            full_name=data.full_name,
            cedula=data.cedula,
            email=data.email,
            phone=data.phone,
            hashed_password=hash_password(data.password),
            role=UserRole.CLIENT,
        )

        return await self.user_repo.create(user)

    async def get_by_id(self, user_id: uuid.UUID) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )
        return user

    async def update(self, user_id: uuid.UUID, data: UserUpdateSchema) -> User:
        user = await self.get_by_id(user_id)
        updated = await self.user_repo.update(
            user.id, data.model_dump(exclude_none=True)
        )
        return updated

    async def admin_update(
        self, user_id: uuid.UUID, data: UserAdminUpdateSchema
    ) -> User:
        user = await self.get_by_id(user_id)
        updated = await self.user_repo.update(
            user.id, data.model_dump(exclude_none=True)
        )
        return updated

    async def get_all(self, skip: int = 0, limit: int = 10) -> list[User]:
        return await self.user_repo.get_all(skip=skip, limit=limit)

    async def deactivate(self, user_id: uuid.UUID) -> bool:
        return await self.user_repo.soft_delete(user_id)
