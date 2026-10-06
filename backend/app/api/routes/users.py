# app/api/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security_audit import audit_log
from app.services.user_service import UserService
from app.schemas.user_schema import (
    UserCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
    UserAdminUpdateSchema,
)
from app.schemas.response_schema import ResponseSchema, PaginatedResponseSchema
from app.schemas.auth_schema import ChangePasswordSchema
from app.api.dependencies.auth_dependencies import (
    get_current_user,
    get_current_admin,
)
from app.models.user_model import User
import uuid

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=ResponseSchema[UserResponseSchema])
async def register(
    data: UserCreateSchema,
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    user = await service.register(data)
    return ResponseSchema(
        message="Usuario registrado exitosamente",
        data=UserResponseSchema.model_validate(user),
    )


@router.get("/me", response_model=ResponseSchema[UserResponseSchema])
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return ResponseSchema(data=UserResponseSchema.model_validate(current_user))


@router.put("/me", response_model=ResponseSchema[UserResponseSchema])
async def update_me(
    data: UserUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = UserService(db)
    user = await service.update(current_user.id, data)
    return ResponseSchema(
        message="Perfil actualizado",
        data=UserResponseSchema.model_validate(user),
    )


@router.post("/change-password", response_model=ResponseSchema)
async def change_password(
    data: ChangePasswordSchema,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """FASE 1.6: cambia la contraseña exigiendo la contraseña actual."""
    request_id = getattr(request.state, "request_id", None)
    service = UserService(db)
    try:
        await service.change_password(current_user.id, data)
    except HTTPException as exc:
        audit_log(
            "auth.change_password.failed",
            request_id=request_id,
            user_id=str(current_user.id),
            reason=exc.detail,
        )
        raise
    audit_log(
        "auth.change_password.success",
        request_id=request_id,
        user_id=str(current_user.id),
    )
    return ResponseSchema(message="Contraseña actualizada correctamente")


@router.get("", response_model=PaginatedResponseSchema[UserResponseSchema])
async def get_all_users(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = UserService(db)
    users = await service.get_all(skip=skip, limit=limit)
    return PaginatedResponseSchema(
        data=[UserResponseSchema.model_validate(u) for u in users],
        total=len(users),
    )


@router.put("/{user_id}/admin", response_model=ResponseSchema[UserResponseSchema])
async def admin_update_user(
    user_id: uuid.UUID,
    data: UserAdminUpdateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = UserService(db)
    user = await service.admin_update(user_id, data)
    return ResponseSchema(
        message="Usuario actualizado",
        data=UserResponseSchema.model_validate(user),
    )


@router.delete("/{user_id}", response_model=ResponseSchema)
async def deactivate_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = UserService(db)
    await service.deactivate(user_id)
    return ResponseSchema(message="Usuario desactivado")
