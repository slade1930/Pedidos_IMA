# app/services/notification_service.py
from loguru import logger
from app.core.constants import OrderStatus


class NotificationService:

    @staticmethod
    async def notify_order_confirmed(
        email: str, order_number: str, qr_code: str
    ) -> None:
        # Por ahora log — después integrar con email/SMS
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
