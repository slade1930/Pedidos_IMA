# app/repositories/order_repository.py

from typing import Optional
from datetime import datetime, timedelta, timezone
import uuid

from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base_repository import BaseRepository
from app.models.order_model import Order
from app.models.user_model import User
from app.core.constants import OrderStatus


class OrderRepository(BaseRepository[Order]):

    def __init__(self, db: AsyncSession):
        super().__init__(Order, db)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
        search: str = None,           # 👈 NUEVO
        fair_id: uuid.UUID = None,    # 👈 NUEVO
        status: str = None,           # 👈 NUEVO
        date_from: str = None,        # 👈 NUEVO
        date_to: str = None,          # 👈 NUEVO
    ) -> list[Order]:

        query = (
            select(Order)
            .where(Order.is_active.is_(True))
            .options(
                selectinload(Order.items),
                selectinload(Order.payment),
                selectinload(Order.user),
            )
        )

        # Filtro por feria
        if fair_id:
            query = query.where(Order.fair_id == fair_id)

        # Filtro por estado
        if status:
            query = query.where(Order.status == status)

        # Búsqueda por número de orden o nombre de cliente
        if search:
            query = query.join(User, Order.user_id == User.id).where(
                or_(
                    Order.order_number.ilike(f"%{search}%"),
                    User.full_name.ilike(f"%{search}%"),
                    User.cedula.ilike(f"%{search}%"),
                )
            )

        # Filtro por fecha desde
        if date_from:
            query = query.where(Order.created_at >= datetime.fromisoformat(date_from))

        # Filtro por fecha hasta
        if date_to:
            query = query.where(Order.created_at <= datetime.fromisoformat(date_to))

        query = query.order_by(Order.created_at.desc()).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_total_count(
        self,
        search: str = None,
        fair_id: uuid.UUID = None,
        status: str = None,
        date_from: str = None,
        date_to: str = None,
    ) -> int:

        query = select(func.count()).select_from(Order).where(Order.is_active.is_(True))

        if fair_id:
            query = query.where(Order.fair_id == fair_id)

        if status:
            query = query.where(Order.status == status)

        if search:
            query = query.join(User, Order.user_id == User.id).where(
                or_(
                    Order.order_number.ilike(f"%{search}%"),
                    User.full_name.ilike(f"%{search}%"),
                    User.cedula.ilike(f"%{search}%"),
                )
            )

        if date_from:
            query = query.where(Order.created_at >= datetime.fromisoformat(date_from))

        if date_to:
            query = query.where(Order.created_at <= datetime.fromisoformat(date_to))

        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_by_user(
        self,
        user_id: uuid.UUID,
    ) -> list[Order]:

        result = await self.db.execute(
            select(Order)
            .where(
                Order.user_id == user_id,
                Order.is_active.is_(True),
            )
            .options(
                selectinload(Order.items),
                selectinload(Order.payment),
                selectinload(Order.user),
            )
            .order_by(Order.created_at.desc())
        )

        return list(result.scalars().all())

    async def get_by_fair(
        self,
        fair_id: uuid.UUID,
    ) -> list[Order]:

        result = await self.db.execute(
            select(Order)
            .where(
                Order.fair_id == fair_id,
                Order.is_active.is_(True),
            )
            .order_by(Order.created_at.desc())
        )

        return list(result.scalars().all())

    async def get_by_order_number(
        self,
        order_number: str,
    ) -> Optional[Order]:

        result = await self.db.execute(
            select(Order).where(
                Order.order_number == order_number,
                Order.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_status(
        self,
        status: OrderStatus,
        fair_id: uuid.UUID,
    ) -> list[Order]:

        result = await self.db.execute(
            select(Order)
            .where(
                Order.status == status,
                Order.fair_id == fair_id,
                Order.is_active.is_(True),
            )
            .order_by(Order.created_at.desc())
        )

        return list(result.scalars().all())

    async def user_has_order_in_fair(
        self,
        user_id: uuid.UUID,
        fair_id: uuid.UUID,
    ) -> bool:

        result = await self.db.execute(
            select(Order).where(
                Order.user_id == user_id,
                Order.fair_id == fair_id,
                Order.status != OrderStatus.CANCELLED,
                Order.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none() is not None

    async def get_last_order_by_cedula(
        self,
        cedula: str,
    ) -> Optional[Order]:

        result = await self.db.execute(
            select(Order)
            .join(User, Order.user_id == User.id)
            .where(
                User.cedula == cedula,
                Order.is_active.is_(True),
                Order.status != OrderStatus.CANCELLED,
            )
            .options(
                selectinload(Order.user),
                selectinload(Order.fair),
            )
            .order_by(Order.created_at.desc())
            .limit(1)
        )

        return result.scalar_one_or_none()

    async def get_by_qr(
        self,
        qr_code: str,
    ) -> Optional[Order]:

        result = await self.db.execute(
            select(Order).where(
                Order.qr_token == qr_code,
                Order.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def get_all_with_users(
        self,
        fair_id: uuid.UUID = None,
        date_from: str = None,
        date_to: str = None,
    ) -> list[Order]:
        """Obtiene todas las órdenes activas con datos del usuario, items y feria para reportes"""
        query = (
            select(Order)
            .where(Order.is_active.is_(True))
            .options(
                selectinload(Order.user),
                selectinload(Order.items),
                selectinload(Order.fair),
            )
        )

        if fair_id:
            query = query.where(Order.fair_id == fair_id)

        if date_from:
            query = query.where(Order.created_at >= datetime.fromisoformat(date_from))

        if date_to:
            query = query.where(Order.created_at <= datetime.fromisoformat(date_to))

        query = query.order_by(Order.created_at.desc())

        result = await self.db.execute(query)
        return list(result.scalars().all())
