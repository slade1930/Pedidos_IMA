import uuid
from datetime import datetime, timezone

from sqlalchemy import select, func, or_, and_

from app.repositories.base_repository import BaseRepository
from app.models.notification_model import (
    Notification,
    NotificationAudience,
    UserNotification,
)
from app.models.user_model import User


class NotificationRepository(BaseRepository[Notification]):

    def __init__(self, db):
        super().__init__(Notification, db)

    # ── ADMIN ──────────────────────────────────────────────

    async def get_all_paginated(
        self, skip: int = 0, limit: int = 10
    ) -> tuple[list[Notification], int]:
        base = select(Notification).where(Notification.is_active.is_(True))
        total = (
            await self.db.execute(
                select(func.count()).select_from(Notification).where(
                    Notification.is_active.is_(True)
                )
            )
        ).scalar_one()
        rows = await self.db.execute(
            base.order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(rows.scalars().all()), total

    async def read_stats_for(
        self, notification_ids: list[uuid.UUID]
    ) -> dict[uuid.UUID, int]:
        """read_count por notificación (filas leídas)."""
        if not notification_ids:
            return {}
        rows = await self.db.execute(
            select(
                UserNotification.notification_id,
                func.count().label("read_count"),
            )
            .where(
                UserNotification.notification_id.in_(notification_ids),
                UserNotification.read_at.is_not(None),
            )
            .group_by(UserNotification.notification_id)
        )
        return {rid: count for rid, count in rows.all()}

    async def count_active_users(self) -> int:
        return (
            await self.db.execute(
                select(func.count())
                .select_from(User)
                .where(User.is_active.is_(True))
            )
        ).scalar_one()

    async def get_existing_recipient_ids(
        self, user_ids: list[uuid.UUID]
    ) -> list[uuid.UUID]:
        rows = await self.db.execute(
            select(User.id).where(
                User.id.in_(user_ids), User.is_active.is_(True)
            )
        )
        return list(rows.scalars().all())

    # ── USUARIO (mis notificaciones) ───────────────────────

    @staticmethod
    def _visible_condition(user_id: uuid.UUID):
        """Una notificación es visible si está activa y (audience=ALL o soy destinatario)."""
        return and_(
            Notification.is_active.is_(True),
            or_(
                Notification.audience == NotificationAudience.ALL,
                UserNotification.id.is_not(None),
            ),
        )

    @staticmethod
    def _join_condition(user_id: uuid.UUID):
        return and_(
            UserNotification.notification_id == Notification.id,
            UserNotification.user_id == user_id,
        )

    async def get_for_user(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 10
    ) -> tuple[list[tuple[Notification, datetime | None]], int]:
        join = and_(
            self._join_condition(user_id),
            UserNotification.is_active.is_(True),
        )
        total = (
            await self.db.execute(
                select(func.count())
                .select_from(Notification)
                .outerjoin(UserNotification, join)
                .where(self._visible_condition(user_id))
            )
        ).scalar_one()
        rows = await self.db.execute(
            select(Notification, UserNotification.read_at)
            .outerjoin(UserNotification, join)
            .where(self._visible_condition(user_id))
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(rows.all()), total

    async def unread_count(self, user_id: uuid.UUID) -> int:
        join = and_(
            self._join_condition(user_id),
            UserNotification.is_active.is_(True),
        )
        return (
            await self.db.execute(
                select(func.count())
                .select_from(Notification)
                .outerjoin(UserNotification, join)
                .where(
                    self._visible_condition(user_id),
                    UserNotification.read_at.is_(None),
                )
            )
        ).scalar_one()

    async def get_user_notification(
        self, notification_id: uuid.UUID, user_id: uuid.UUID
    ) -> tuple[Notification, datetime | None] | None:
        join = and_(
            self._join_condition(user_id),
            UserNotification.is_active.is_(True),
        )
        row = (
            await self.db.execute(
                select(Notification, UserNotification.read_at)
                .outerjoin(UserNotification, join)
                .where(
                    Notification.id == notification_id,
                    self._visible_condition(user_id),
                )
            )
        ).first()
        return row

    async def mark_read(
        self, notification_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        now = datetime.now(timezone.utc)
        row = (
            await self.db.execute(
                select(UserNotification).where(
                    UserNotification.notification_id == notification_id,
                    UserNotification.user_id == user_id,
                )
            )
        ).scalar_one_or_none()

        if row is None:
            self.db.add(
                UserNotification(
                    notification_id=notification_id,
                    user_id=user_id,
                    read_at=now,
                )
            )
            await self.db.flush()
            return True

        if row.read_at is not None:
            return False  # ya estaba leída

        row.read_at = now
        await self.db.flush()
        return True

    async def mark_all_read(self, user_id: uuid.UUID) -> int:
        """Marca como leídas todas las visibles. Devuelve cuántas cambió."""
        now = datetime.now(timezone.utc)
        join = and_(
            self._join_condition(user_id),
            UserNotification.is_active.is_(True),
        )

        # 1) visibles con fila existente sin leer → actualizar
        result = await self.db.execute(
            select(Notification.id, UserNotification.id)
            .select_from(Notification)
            .outerjoin(UserNotification, join)
            .where(
                self._visible_condition(user_id),
                UserNotification.id.is_not(None),
                UserNotification.read_at.is_(None),
            )
        )
        to_update = [row[1] for row in result.all()]
        if to_update:
            await self.db.execute(
                UserNotification.__table__.update()
                .where(UserNotification.id.in_(to_update))
                .values(read_at=now)
            )

        # 2) visibles sin fila (audience=ALL, nunca vistas) → crear ya leída
        result = await self.db.execute(
            select(Notification.id)
            .select_from(Notification)
            .outerjoin(UserNotification, join)
            .where(
                self._visible_condition(user_id),
                UserNotification.id.is_(None),
            )
        )
        to_create = [row[0] for row in result.all()]
        for nid in to_create:
            self.db.add(
                UserNotification(
                    notification_id=nid,
                    user_id=user_id,
                    read_at=now,
                )
            )
        await self.db.flush()
        return len(to_update) + len(to_create)

    async def add_recipients(
        self, notification_id: uuid.UUID, user_ids: list[uuid.UUID]
    ) -> None:
        for uid in user_ids:
            self.db.add(
                UserNotification(
                    notification_id=notification_id,
                    user_id=uid,
                    read_at=None,
                )
            )
        await self.db.flush()
