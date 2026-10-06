# app/services/notification_service.py
import uuid

from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import OrderStatus  # noqa: F401 (import histórico)
from app.models.notification_model import (
    Notification,
    NotificationAudience,
    UserNotification,
)
from app.repositories.notification_repository import NotificationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.notification_schema import (
    NotificationCreateSchema,
    NotificationUpdateSchema,
)


class NotificationService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = NotificationRepository(db)
        self.user_repo = UserRepository(db)

    # ── Lógica de negocio (persistente) ────────────────────

    async def create(
        self, data: NotificationCreateSchema, created_by: uuid.UUID
    ) -> Notification:
        recipient_ids: list[uuid.UUID] | None = None

        if data.audience == NotificationAudience.USERS:
            existing = await self.repo.get_existing_recipient_ids(
                data.recipient_ids or []
            )
            if len(existing) != len(set(data.recipient_ids or [])):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Algunos destinatarios no existen o están inactivos",
                )
            recipient_ids = [str(u) for u in existing]

        notification = Notification(
            title=data.title,
            message=data.message,
            level=data.level,
            audience=data.audience,
            recipient_ids=recipient_ids,
            created_by=created_by,
        )
        notification = await self.repo.create(notification)

        if recipient_ids:
            await self.repo.add_recipients(
                notification.id,
                [uuid.UUID(u) for u in recipient_ids],
            )

        # stats para la respuesta admin
        notification.recipients_count = len(recipient_ids) if recipient_ids else (
            await self.repo.count_active_users()
        )
        notification.read_count = 0
        notification.read = False
        return notification

    async def admin_list(
        self, skip: int = 0, limit: int = 10
    ) -> tuple[list[Notification], int]:
        items, total = await self.repo.get_all_paginated(skip=skip, limit=limit)
        read_counts = await self.repo.read_stats_for([n.id for n in items])
        active_users = await self.repo.count_active_users()
        for n in items:
            if n.audience == NotificationAudience.USERS:
                n.recipients_count = len(n.recipient_ids or [])
            else:
                n.recipients_count = active_users
            n.read_count = read_counts.get(n.id, 0)
            n.read = None
        return items, total

    async def mine(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 10
    ) -> tuple[list[Notification], int]:
        rows, total = await self.repo.get_for_user(
            user_id, skip=skip, limit=limit
        )
        items: list[Notification] = []
        for notification, read_at in rows:
            notification.read = read_at is not None
            notification.recipients_count = None
            notification.read_count = None
            items.append(notification)
        return items, total

    async def unread_count(self, user_id: uuid.UUID) -> int:
        return await self.repo.unread_count(user_id)

    async def mark_read(self, notification_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        visible = await self.repo.get_user_notification(notification_id, user_id)
        if not visible:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notificación no encontrada",
            )
        return await self.repo.mark_read(notification_id, user_id)

    async def mark_all_read(self, user_id: uuid.UUID) -> int:
        return await self.repo.mark_all_read(user_id)

    async def update(
        self, notification_id: uuid.UUID, data: NotificationUpdateSchema
    ) -> Notification:
        notification = await self.repo.get_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notificación no encontrada",
            )
        update_data = data.model_dump(exclude_none=True)
        if not update_data:
            return notification
        updated = await self.repo.update(notification_id, update_data)
        return updated or notification

    async def deactivate(self, notification_id: uuid.UUID) -> bool:
        notification = await self.repo.get_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notificación no encontrada",
            )
        return await self.repo.soft_delete(notification_id)

    # ── Notificaciones de sistema (log; email/SMS pendiente) ──

    @staticmethod
    async def notify_order_confirmed(
        email: str, order_number: str, pickup_code: str
    ) -> None:
        logger.info(f"[NOTIFY] Pedido confirmado: {order_number} -> {email}")

    @staticmethod
    async def notify_order_ready(email: str, order_number: str) -> None:
        logger.info(f"[NOTIFY] Pedido listo para retiro: {order_number} -> {email}")

    @staticmethod
    async def notify_order_delivered(email: str, order_number: str) -> None:
        logger.info(f"[NOTIFY] Pedido entregado: {order_number} -> {email}")

    @staticmethod
    async def notify_payment_completed(
        email: str, amount: float, order_number: str
    ) -> None:
        logger.info(f"[NOTIFY] Pago completado: {amount} -> {order_number} -> {email}")

    @staticmethod
    async def notify_low_stock(product_name: str, available: int) -> None:
        logger.warning(f"[STOCK] Stock bajo: {product_name} -> {available} unidades")
