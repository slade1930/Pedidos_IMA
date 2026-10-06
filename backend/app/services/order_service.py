# app/services/order_service.py
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.user_repository import UserRepository
from app.repositories.payment_repository import PaymentRepository
from app.models.order_model import Order
from app.models.order_item_model import OrderItem
from app.models.payment_model import Payment
from app.schemas.order_schema import OrderCreateSchema, OrderStatusUpdateSchema
from app.core.constants import OrderStatus, PaymentStatus, SystemLimits, PaymentMethod
from typing import Optional
import uuid
import random
import string

# ─── CONSTANTE PDA ─────────────────────────────────────────

PDA_DAYS_RESTRICTION = 8


def _as_utc(dt: datetime) -> datetime:
    """Normaliza a timezone-aware UTC (los drivers puedn devolver naive en SQLite)."""
    if dt is None:
        return dt
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class OrderService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
        self.inventory_repo = InventoryRepository(db)
        self.user_repo = UserRepository(db)
        self.payment_repo = PaymentRepository(db)

    def _generate_order_number(self) -> str:
        suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"ITAS-{suffix}"

    def _generate_pickup_code(self) -> str:
        return "".join(random.choices(string.digits, k=5))

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
        search: str = None,
        fair_id: uuid.UUID = None,
        status: str = None,
        date_from: str = None,
        date_to: str = None,
    ) -> list[Order]:
        return await self.order_repo.get_all(
            skip=skip, limit=limit,
            search=search, fair_id=fair_id, status=status,
            date_from=date_from, date_to=date_to,
        )

    async def get_total_count(
        self,
        search: str = None,
        fair_id: uuid.UUID = None,
        status: str = None,
        date_from: str = None,
        date_to: str = None,
    ) -> int:
        return await self.order_repo.get_total_count(
            search=search, fair_id=fair_id, status=status,
            date_from=date_from, date_to=date_to,
        )

    async def get_by_id(self, order_id: uuid.UUID) -> Optional[Order]:
        return await self.order_repo.get_by_id(order_id)

    async def _get_pda_restriction(self, user) -> Optional[dict]:
        """Devuelve la restricción PDA activa (un pedido cada 8 días) o None si puede comprar."""
        last_order = await self.order_repo.get_last_order_by_cedula(user.cedula)

        if not last_order:
            return None

        created_at_utc = _as_utc(last_order.created_at)
        days_since_last = (datetime.now(timezone.utc) - created_at_utc).days
        days_remaining = PDA_DAYS_RESTRICTION - days_since_last

        if days_remaining <= 0:
            return None

        next_available = created_at_utc + timedelta(days=PDA_DAYS_RESTRICTION)
        fair_name = getattr(last_order.fair, "name", "Desconocida") if last_order.fair else "Desconocida"

        return {
            "message": "Ya realizaste un pedido recientemente",
            "last_purchase_date": created_at_utc.isoformat(),
            "last_fair_name": fair_name,
            "days_remaining": days_remaining,
            "next_available_date": next_available.isoformat(),
        }

    async def get_pda_status(self, user) -> dict:
        """Estado de elegibilidad de compra del ciudadano para el control de beneficios."""
        restriction = await self._get_pda_restriction(user)
        return {"can_purchase": restriction is None, "restriction": restriction}

    async def create(self, user_id: uuid.UUID, data: OrderCreateSchema) -> Order:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        # ─── VALIDACIÓN PDA: Un pedido cada 8 días ───────
        restriction = await self._get_pda_restriction(user)

        if restriction:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=restriction,
            )

        # ─── Validar productos y calcular total ──────────
        total = 0.0
        order_items = []

        for item_data in data.items:
            product = await self.product_repo.get_by_id(item_data.product_id)

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto no encontrado: {item_data.product_id}",
                )

            if item_data.quantity > product.max_per_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cantidad máxima para {product.name} es {product.max_per_user}",
                )

            reserved = await self.inventory_repo.reserve_stock(
                product.id, data.fair_id, item_data.quantity
            )
            if not reserved:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente para {product.name}",
                )

            subtotal = float(product.price) * item_data.quantity
            total += subtotal

            order_items.append(
                OrderItem(
                    product_id=product.id,
                    product_name=product.name,
                    quantity=item_data.quantity,
                    unit_price=product.price,
                    subtotal=subtotal,
                )
            )

        # ─── Crear pedido ───────────────────────────────
        pickup_code = self._generate_pickup_code()

        order = Order(
            user_id=user_id,
            fair_id=data.fair_id,
            order_number=self._generate_order_number(),
            status=OrderStatus.CONFIRMED,
            total_amount=total,
            payment_method=data.payment_method,
            payment_status=PaymentStatus.COMPLETED,
            notes=data.notes,
        )

        created_order = await self.order_repo.create(order)

        for item in order_items:
            item.order_id = created_order.id
            self.db.add(item)

        await self.db.flush()

        # ─── Registrar el pago AUTOMÁTICAMENTE (completado al hacer pedido) ──
        # La vista "Pagos" del admin lee la tabla payments, por lo que crear el
        # registro aquí garantiza que toda compra del shop se refleje sin
        # confirmación manual previa.
        payment = Payment(
            order_id=created_order.id,
            method=data.payment_method,
            status=PaymentStatus.COMPLETED,
            amount=total,
            currency="USD",
            paid_at=datetime.now(timezone.utc),
        )
        await self.payment_repo.create(payment)
        created_order.payment = payment

        await self.order_repo.update(created_order.id, {
            "pickup_code": pickup_code,
        })

        created_order.pickup_code = pickup_code

        return created_order

    async def update_status(
        self, order_id: uuid.UUID, data: OrderStatusUpdateSchema
    ) -> Order:
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado",
            )

        updated = await self.order_repo.update(order_id, {"status": data.status})

        if data.status == OrderStatus.DELIVERED:
            for item in order.items:
                await self.inventory_repo.confirm_delivery(
                    item.product_id, order.fair_id, item.quantity
                )

        return updated

    async def validate_pickup_code(self, pickup_code: str) -> Order:
        order = await self.order_repo.get_by_pickup_code(pickup_code)

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Código no válido",
            )

        if order.status == OrderStatus.DELIVERED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este código ya fue utilizado",
            )

        return order

    async def get_by_user(self, user_id: uuid.UUID) -> list[Order]:
        return await self.order_repo.get_by_user(user_id)

    async def get_by_fair(self, fair_id: uuid.UUID) -> list[Order]:
        return await self.order_repo.get_by_fair(fair_id)

    async def get_all_for_report(
        self,
        fair_id: uuid.UUID = None,
        date_from: str = None,
        date_to: str = None,
    ) -> list[Order]:
        """Obtiene todas las órdenes con datos de usuario, items y feria para reportes"""
        return await self.order_repo.get_all_with_users(
            fair_id=fair_id, date_from=date_from, date_to=date_to
        )
