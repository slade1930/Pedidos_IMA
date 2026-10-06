# app/api/routes/notifications.py
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies.auth_dependencies import (
    get_current_admin,
    get_current_staff,
    get_current_user,
)
from app.models.user_model import User
from app.schemas.notification_schema import (
    NotificationCreateSchema,
    NotificationResponseSchema,
    NotificationUpdateSchema,
    UnreadCountSchema,
)
from app.schemas.response_schema import (
    PaginatedResponseSchema,
    ResponseSchema,
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ─── HEALTH (existente) ────────────────────────────────────

@router.get("/health", response_model=ResponseSchema)
async def notifications_health(
    _: User = Depends(get_current_staff),
):
    return ResponseSchema(message="Servicio de notificaciones activo")


# ─── USUARIO: MIS NOTIFICACIONES ───────────────────────────

@router.get("", response_model=PaginatedResponseSchema[NotificationResponseSchema])
async def get_my_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lista las notificaciones visibles para el usuario autenticado."""
    service = NotificationService(db)
    items, total = await service.mine(
        current_user.id, skip=skip, limit=limit
    )
    return PaginatedResponseSchema(
        data=[NotificationResponseSchema.model_validate(n) for n in items],
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        limit=limit,
        pages=((total + limit - 1) // limit) if total > 0 else 0,
    )


@router.get("/unread-count", response_model=ResponseSchema[UnreadCountSchema])
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = NotificationService(db)
    count = await service.unread_count(current_user.id)
    return ResponseSchema(data=UnreadCountSchema(count=count))


@router.post("/read-all", response_model=ResponseSchema)
async def mark_all_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = NotificationService(db)
    updated = await service.mark_all_read(current_user.id)
    return ResponseSchema(
        message=f"{updated} notificación(es) marcada(s) como leídas"
    )


@router.post("/{notification_id}/read", response_model=ResponseSchema)
async def mark_as_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = NotificationService(db)
    changed = await service.mark_read(notification_id, current_user.id)
    return ResponseSchema(
        message=(
            "Notificación marcada como leída"
            if changed
            else "La notificación ya estaba leída"
        )
    )


# ─── ADMIN: GESTIÓN DE NOTIFICACIONES ──────────────────────

@router.get(
    "/admin",
    response_model=PaginatedResponseSchema[NotificationResponseSchema],
)
async def get_all_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = NotificationService(db)
    items, total = await service.admin_list(skip=skip, limit=limit)
    return PaginatedResponseSchema(
        data=[NotificationResponseSchema.model_validate(n) for n in items],
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        limit=limit,
        pages=((total + limit - 1) // limit) if total > 0 else 0,
    )


@router.post("", response_model=ResponseSchema[NotificationResponseSchema])
async def create_notification(
    data: NotificationCreateSchema,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    service = NotificationService(db)
    notification = await service.create(data, created_by=admin.id)
    return ResponseSchema(
        message="Notificación creada y enviada exitosamente",
        data=NotificationResponseSchema.model_validate(notification),
    )


@router.put(
    "/{notification_id}",
    response_model=ResponseSchema[NotificationResponseSchema],
)
async def update_notification(
    notification_id: uuid.UUID,
    data: NotificationUpdateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = NotificationService(db)
    notification = await service.update(notification_id, data)
    return ResponseSchema(
        message="Notificación actualizada exitosamente",
        data=NotificationResponseSchema.model_validate(notification),
    )


@router.delete("/{notification_id}", response_model=ResponseSchema)
async def delete_notification(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = NotificationService(db)
    await service.deactivate(notification_id)
    return ResponseSchema(message="Notificación eliminada exitosamente")
